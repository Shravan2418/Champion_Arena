
const pool = require("../../config/database");
const attemptRepository = require("./attempt.repository");
const rewardService = require("../rewards/reward.service");

function createError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

// --------------------------------------------------
// TRANSACTION MANAGEMENT
// --------------------------------------------------

async function withTransaction(callback) {
  const client = await pool.connect();
  let started = false;
  let result;

  const afterCommitCallbacks = [];

  try {
    await client.query("BEGIN");
    started = true;

    result = await callback(client, (task) => {
      if (typeof task === "function") {
        afterCommitCallbacks.push(task);
      }
    });

    await client.query("COMMIT");
    started = false;
  } catch (error) {
    if (started) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error(
          "Attempt transaction rollback failed:",
          rollbackError
        );
      }
    }

    throw error;
  } finally {
    // Release the database connection before reward processing.
    client.release();
  }

  // These tasks run only after the exam transaction commits.
  // Reward failure must never undo a successful exam submission.
  for (const task of afterCommitCallbacks) {
    try {
      await task();
    } catch (error) {
      console.error("Post-commit task failed:", error);
    }
  }

  return result;
}

// --------------------------------------------------
// REWARD INTEGRATION
// --------------------------------------------------

async function processRewardsSafely(attempt) {
  if (!attempt?.id || !attempt?.student_id) {
    return null;
  }

  try {
    return await rewardService.awardForAttempt({
      studentId: attempt.student_id,
      attemptId: attempt.id
    });
  } catch (error) {
    console.error(
      `Reward processing failed for attempt ${attempt.id}. It can be retried later:`,
      error
    );

    return null;
  }
}

function scheduleRewardsAfterCommit(afterCommit, attempt) {
  if (typeof afterCommit !== "function") {
    return;
  }

  afterCommit(() => processRewardsSafely(attempt));
}

// --------------------------------------------------
// EXAM TIME AND RESULT RELEASE
// --------------------------------------------------

function isAttemptExpired(attempt) {
  const now = Date.now();

  return (
    now >= new Date(attempt.deadline_at).getTime() ||
    (
      attempt.exam_ends_at &&
      now >= new Date(attempt.exam_ends_at).getTime()
    )
  );
}

function resultIsReleased(attempt) {
  if (attempt.result_release_mode === "immediately") {
    return true;
  }

  if (attempt.result_release_mode === "after_exam_end") {
    return Boolean(
      attempt.exam_ends_at &&
      new Date(attempt.exam_ends_at).getTime() <= Date.now()
    );
  }

  // Manual release requires a separate Admin release feature.
  return false;
}

// --------------------------------------------------
// FINALIZE AND EVALUATE ATTEMPT
// --------------------------------------------------

async function finalizeAttempt(
  client,
  attempt,
  status,
  afterCommit
) {
  const existing = await attemptRepository.getExamResult(
    client,
    attempt.id
  );

  if (attempt.status !== "in_progress") {
    if (!existing) {
      throw createError(
        "This attempt is closed but its result record is missing.",
        500
      );
    }

    scheduleRewardsAfterCommit(afterCommit, attempt);

    return {
      attempt,
      result: existing
    };
  }

  // Evaluate answers on the server.
  await attemptRepository.evaluateAttemptAnswers(
    client,
    attempt.id
  );

  const score = await attemptRepository.getAttemptScore(
    client,
    attempt.id
  );

  const closed = await attemptRepository.closeAttempt(
    client,
    attempt,
    status
  );

  if (!closed) {
    const latestResult = await attemptRepository.getExamResult(
      client,
      attempt.id
    );

    if (latestResult) {
      scheduleRewardsAfterCommit(afterCommit, attempt);

      return {
        attempt,
        result: latestResult
      };
    }

    throw createError(
      "The attempt could not be submitted. Please refresh and try again.",
      409
    );
  }

  const finalAttempt = {
    ...attempt,
    ...closed
  };

  const result = await attemptRepository.createExamResult(
    client,
    finalAttempt,
    score
  );

  // Schedule rewards only after the result has been committed.
  scheduleRewardsAfterCommit(afterCommit, finalAttempt);

  return {
    attempt: finalAttempt,
    result
  };
}

// --------------------------------------------------
// HIDE ANSWERS WHEN REQUIRED
// --------------------------------------------------

function sanitizeQuestions(
  attempt,
  questions,
  allowFormalReview
) {
  return questions.map((question) => {
    const copy = { ...question };

    const options = Array.isArray(copy.options)
      ? copy.options
      : [];

    const practiceFeedbackAvailable =
      attempt.exam_mode === "practice" &&
      copy.is_correct !== null &&
      copy.is_correct !== undefined;

    const revealAnswers =
      allowFormalReview || practiceFeedbackAvailable;

    copy.options = options.map((option) => {
      const safeOption = { ...option };

      if (!revealAnswers) {
        delete safeOption.isCorrect;
      }

      return safeOption;
    });

    if (!revealAnswers) {
      delete copy.explanation;
      delete copy.is_correct;
      delete copy.marks_awarded;
    }

    if (
      revealAnswers &&
      !attempt.show_explanations_after_submit
    ) {
      delete copy.explanation;
    }

    return copy;
  });
}

// --------------------------------------------------
// QUESTION NAVIGATION PALETTE
// --------------------------------------------------

function buildQuestionPalette(questions) {
  return questions.map((question, index) => {
    const answered = Boolean(question.selected_option_id);

    const markedForReview = Boolean(
      question.marked_for_review
    );

    let state = "unanswered";

    if (answered && markedForReview) {
      state = "answered_review";
    } else if (answered) {
      state = "answered";
    } else if (markedForReview) {
      state = "review";
    }

    return {
      questionNumber: index + 1,
      examQuestionId: question.exam_question_id,
      answered,
      markedForReview,
      state
    };
  });
}

// --------------------------------------------------
// ATTEMPT RESPONSE FORMAT
// --------------------------------------------------

function serializeAttempt(
  attempt,
  questions,
  result = null
) {
  const allowFormalReview =
    attempt.exam_mode === "formal" &&
    attempt.status !== "in_progress" &&
    resultIsReleased(attempt);

  const safeQuestions = sanitizeQuestions(
    attempt,
    questions,
    allowFormalReview
  );

  const remaining =
    attempt.status === "in_progress"
      ? Math.max(
          0,
          Math.ceil(
            (
              new Date(attempt.deadline_at).getTime() -
              Date.now()
            ) / 1000
          )
        )
      : 0;

  const response = {
    id: attempt.id,
    examId: attempt.exam_id,
    examTitle: attempt.exam_title,
    examMode: attempt.exam_mode,
    attemptNumber: attempt.attempt_number,
    status: attempt.status,
    startedAt: attempt.started_at,
    deadlineAt: attempt.deadline_at,
    submittedAt: attempt.submitted_at,
    timeSpentSeconds: attempt.time_spent_seconds,
    timeRemainingSeconds: remaining,
    questions: safeQuestions,
    questionPalette: buildQuestionPalette(safeQuestions),

    resultAvailable: Boolean(
      result &&
      (
        attempt.exam_mode === "practice" ||
        resultIsReleased(attempt)
      )
    )
  };

  if (response.resultAvailable) {
    response.result = result;
  }

  return response;
}

// --------------------------------------------------
// LIST AVAILABLE EXAMS
// --------------------------------------------------

async function listExams(studentId, filters) {
  return attemptRepository.listAvailableExams(
    studentId,
    filters
  );
}

// --------------------------------------------------
// GET EXAM DETAILS
// --------------------------------------------------

async function getExamDetails(examId, studentId) {
  const exam = await attemptRepository.getExamForStudent(
    pool,
    examId
  );

  if (!exam) {
    throw createError("Exam not found.", 404);
  }

  const allowed = await attemptRepository.studentHasExamAccess(
    pool,
    studentId,
    exam
  );

  if (!allowed) {
    throw createError(
      "You do not have access to this exam.",
      403
    );
  }

  const attemptsUsed = await attemptRepository.getAttemptCount(
    pool,
    examId,
    studentId
  );

  const now = Date.now();

  const startsInFuture =
    exam.starts_at &&
    new Date(exam.starts_at).getTime() > now;

  const alreadyEnded =
    exam.ends_at &&
    new Date(exam.ends_at).getTime() <= now;

  return {
    ...exam,

    attemptsUsed,

    attemptsRemaining: Math.max(
      0,
      exam.attempt_limit - attemptsUsed
    ),

    canStart:
      ["published", "scheduled"].includes(exam.status) &&
      !startsInFuture &&
      !alreadyEnded &&
      attemptsUsed < exam.attempt_limit,

    startAvailableAt: exam.starts_at,
    accessGranted: true
  };
}

// --------------------------------------------------
// START OR RESUME EXAM ATTEMPT
// --------------------------------------------------

async function startAttempt(examId, studentId) {
  return withTransaction(async (client, afterCommit) => {
    // Lock exam row to prevent simultaneous attempt creation.
    const examResult = await client.query(
      `SELECT *
       FROM exams
       WHERE id = $1
       FOR UPDATE`,
      [examId]
    );

    const exam = examResult.rows[0];

    if (!exam) {
      throw createError("Exam not found.", 404);
    }

    if (!["published", "scheduled"].includes(exam.status)) {
      throw createError(
        "This exam is not available to attempt.",
        409
      );
    }

    if (
      exam.starts_at &&
      new Date(exam.starts_at).getTime() > Date.now()
    ) {
      throw createError(
        "This exam has not started yet.",
        409
      );
    }

    if (
      exam.ends_at &&
      new Date(exam.ends_at).getTime() <= Date.now()
    ) {
      throw createError(
        "The examination window has ended.",
        409
      );
    }

    const allowed =
      await attemptRepository.studentHasExamAccess(
        client,
        studentId,
        exam
      );

    if (!allowed) {
      throw createError(
        "You do not have permission to attempt this exam.",
        403
      );
    }

    // Check whether an unfinished attempt already exists.
    const existing =
      await attemptRepository.getInProgressAttempt(
        client,
        examId,
        studentId
      );

    if (existing) {
      const enriched = {
        ...existing,
        exam_title: exam.title,
        exam_mode: exam.exam_mode,
        result_release_mode: exam.result_release_mode,
        exam_ends_at: exam.ends_at,
        show_explanations_after_submit:
          exam.show_explanations_after_submit,
        shuffle_questions: exam.shuffle_questions,
        shuffle_options: exam.shuffle_options
      };

      if (!isAttemptExpired(enriched)) {
        const questions =
          await attemptRepository.getAttemptQuestions(
            client,
            enriched
          );

        return {
          resumed: true,
          attempt: serializeAttempt(
            enriched,
            questions
          )
        };
      }

      // Automatically submit an expired attempt.
      const expired = await finalizeAttempt(
        client,
        enriched,
        "auto_submitted",
        afterCommit
      );

      const countAfterExpiry =
        await attemptRepository.getAttemptCount(
          client,
          examId,
          studentId
        );

      if (countAfterExpiry >= exam.attempt_limit) {
        return {
          resumed: false,
          attemptExpired: true,

          message:
            "Your previous attempt reached its deadline and was submitted automatically. You have no attempts remaining.",

          resultAvailable:
            exam.exam_mode === "practice" ||
            resultIsReleased(enriched),

          result:
            (
              exam.exam_mode === "practice" ||
              resultIsReleased(enriched)
            )
              ? expired.result
              : undefined
        };
      }
    }

    const attemptsUsed =
      await attemptRepository.getAttemptCount(
        client,
        examId,
        studentId
      );

    if (attemptsUsed >= exam.attempt_limit) {
      throw createError(
        "You have reached the attempt limit for this exam.",
        409
      );
    }

    const questionCountResult = await client.query(
      `SELECT COUNT(*)::int AS count
       FROM exam_questions
       WHERE exam_id = $1`,
      [examId]
    );

    if (questionCountResult.rows[0].count < 1) {
      throw createError(
        "This exam does not contain any questions yet.",
        409
      );
    }

    const attempt =
      await attemptRepository.createAttempt(client, {
        examId,
        studentId,
        attemptNumber: attemptsUsed + 1,
        durationSeconds: exam.duration_seconds,
        endsAt: exam.ends_at
      });

    const header = {
      ...attempt,
      exam_title: exam.title,
      exam_mode: exam.exam_mode,
      result_release_mode: exam.result_release_mode,
      exam_ends_at: exam.ends_at,
      show_explanations_after_submit:
        exam.show_explanations_after_submit,
      shuffle_questions: exam.shuffle_questions,
      shuffle_options: exam.shuffle_options
    };

    const questions =
      await attemptRepository.getAttemptQuestions(
        client,
        header
      );

    return {
      resumed: false,
      attempt: serializeAttempt(header, questions)
    };
  });
}

// --------------------------------------------------
// GET OR RESTORE EXISTING ATTEMPT
// --------------------------------------------------

async function getAttempt(attemptId, studentId) {
  return withTransaction(async (client, afterCommit) => {
    const attempt =
      await attemptRepository.getAttemptForUpdate(
        client,
        attemptId,
        studentId
      );

    if (!attempt) {
      throw createError("Attempt not found.", 404);
    }

    let current = attempt;
    let result = null;

    if (
      current.status === "in_progress" &&
      isAttemptExpired(current)
    ) {
      const finalized = await finalizeAttempt(
        client,
        current,
        "auto_submitted",
        afterCommit
      );

      current = finalized.attempt;
      result = finalized.result;
    } else if (current.status !== "in_progress") {
      result = await attemptRepository.getExamResult(
        client,
        current.id
      );

      // Retry reward processing if the attempt was already submitted.
      scheduleRewardsAfterCommit(afterCommit, current);
    }

    const questions =
      await attemptRepository.getAttemptQuestions(
        client,
        current
      );

    return serializeAttempt(
      current,
      questions,
      result
    );
  });
}

// --------------------------------------------------
// SAVE STUDENT ANSWER
// --------------------------------------------------

async function saveAnswer(
  attemptId,
  examQuestionId,
  studentId,
  data
) {
  return withTransaction(async (client, afterCommit) => {
    const attempt =
      await attemptRepository.getAttemptForUpdate(
        client,
        attemptId,
        studentId
      );

    if (!attempt) {
      throw createError("Attempt not found.", 404);
    }

    if (attempt.status !== "in_progress") {
      throw createError(
        "This attempt is already closed. Answers can no longer be changed.",
        409
      );
    }

    if (isAttemptExpired(attempt)) {
      const finalized = await finalizeAttempt(
        client,
        attempt,
        "auto_submitted",
        afterCommit
      );

      return {
        attemptExpired: true,

        message:
          "The deadline has passed. Your attempt was submitted automatically.",

        resultAvailable:
          attempt.exam_mode === "practice" ||
          resultIsReleased(attempt),

        result:
          (
            attempt.exam_mode === "practice" ||
            resultIsReleased(attempt)
          )
            ? finalized.result
            : undefined
      };
    }

    const question =
      await attemptRepository.getAttemptQuestion(
        client,
        attemptId,
        examQuestionId
      );

    if (!question) {
      throw createError(
        "This question is not part of your attempt.",
        404
      );
    }

    const hasSelectionField =
      Object.prototype.hasOwnProperty.call(
        data,
        "selectedOptionId"
      );

    let selectedOption = null;
    let marksAwarded = null;

    if (
      hasSelectionField &&
      data.selectedOptionId !== null
    ) {
      selectedOption =
        await attemptRepository.getOptionForVersion(
          client,
          data.selectedOptionId,
          question.question_version_id
        );

      if (!selectedOption) {
        throw createError(
          "The selected option does not belong to this question.",
          400
        );
      }

      if (attempt.exam_mode === "practice") {
        marksAwarded = selectedOption.is_correct
          ? Number(question.marks)
          : -Number(question.negative_marks);
      }
    }

    const updated =
      await attemptRepository.updateStudentAnswer(client, {
        attemptId,
        examQuestionId,
        examId: attempt.exam_id,
        hasSelectionField,
        selectedOptionId: data.selectedOptionId,
        markedForReview: data.markedForReview,
        practiceMode: attempt.exam_mode === "practice",
        isCorrect: selectedOption
          ? selectedOption.is_correct
          : null,
        marksAwarded
      });

    let feedback = null;

    if (
      attempt.exam_mode === "practice" &&
      hasSelectionField &&
      data.selectedOptionId !== null &&
      selectedOption
    ) {
      feedback =
        await attemptRepository.getPracticeFeedback(
          client,
          question,
          data.selectedOptionId
        );

      if (!attempt.show_explanations_after_submit) {
        delete feedback.explanation;
      }
    }

    return {
      attemptExpired: false,
      answer: updated,
      feedback,
      savedAt: updated.last_saved_at
    };
  });
}

// --------------------------------------------------
// SUBMIT EXAM ATTEMPT
// --------------------------------------------------

async function submitAttempt(attemptId, studentId) {
  return withTransaction(async (client, afterCommit) => {
    const attempt =
      await attemptRepository.getAttemptForUpdate(
        client,
        attemptId,
        studentId
      );

    if (!attempt) {
      throw createError("Attempt not found.", 404);
    }

    let finalized;

    if (attempt.status === "in_progress") {
      const status = isAttemptExpired(attempt)
        ? "auto_submitted"
        : "submitted";

      finalized = await finalizeAttempt(
        client,
        attempt,
        status,
        afterCommit
      );
    } else {
      const result =
        await attemptRepository.getExamResult(
          client,
          attemptId
        );

      finalized = {
        attempt,
        result
      };

      // Reprocess rewards safely for an already submitted attempt.
      scheduleRewardsAfterCommit(afterCommit, attempt);
    }

    const released =
      finalized.attempt.exam_mode === "practice" ||
      resultIsReleased(finalized.attempt);

    return {
      attemptId,
      status: finalized.attempt.status,
      submittedAt: finalized.attempt.submitted_at,
      resultAvailable: released,

      message: released
        ? "Your attempt has been submitted and evaluated."
        : "Your attempt has been submitted. Your result will be available according to the exam's result release settings.",

      result: released
        ? finalized.result
        : undefined
    };
  });
}

// --------------------------------------------------
// GET EXAM RESULT
// --------------------------------------------------

async function getAttemptResult(attemptId, studentId) {
  let attempt =
    await attemptRepository.getAttemptHeader(
      pool,
      attemptId,
      studentId
    );

  if (!attempt) {
    throw createError("Attempt not found.", 404);
  }

  // Automatically finalize expired attempts.
  if (
    attempt.status === "in_progress" &&
    isAttemptExpired(attempt)
  ) {
    await getAttempt(attemptId, studentId);

    attempt =
      await attemptRepository.getAttemptHeader(
        pool,
        attemptId,
        studentId
      );
  }

  if (attempt.status === "in_progress") {
    throw createError(
      "Submit your attempt before viewing the result.",
      409
    );
  }

  const result =
    await attemptRepository.getExamResult(
      pool,
      attemptId
    );

  if (!result) {
    throw createError(
      "The result has not been generated.",
      404
    );
  }

  // Idempotent reward processing also retries a previous failure.
  await processRewardsSafely(attempt);

  if (
    attempt.exam_mode === "formal" &&
    !resultIsReleased(attempt)
  ) {
    return {
      resultAvailable: false,

      message:
        attempt.result_release_mode === "manual"
          ? "The administrator has not released this result yet."
          : "The result will be available after the examination window ends."
    };
  }

  return {
    resultAvailable: true,
    result
  };
}

// --------------------------------------------------
// EXPORT SERVICES
// --------------------------------------------------

module.exports = {
  listExams,
  getExamDetails,
  startAttempt,
  getAttempt,
  saveAnswer,
  submitAttempt,
  getAttemptResult
};
