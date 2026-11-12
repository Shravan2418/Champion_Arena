const pool = require("../../config/database");
const examRepository = require("./exam.repository");

function createError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function withTransaction(callback) {
  const client = await pool.connect();
  let transactionStarted = false;
  try {
    await client.query("BEGIN");
    transactionStarted = true;
    const result = await callback(client);
    await client.query("COMMIT");
    transactionStarted = false;
    return result;
  } catch (error) {
    if (transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Exam transaction rollback failed:", rollbackError);
      }
    }
    throw error;
  } finally {
    client.release();
  }
}

function mapDatabaseError(error) {
  if (error.code === "23505") {
    throw createError("This item is already attached or a record with the same unique value exists.", 409);
  }
  if (error.code === "23503") {
    throw createError("A referenced subject, institution, topic, student or question does not exist.", 400);
  }
  if (error.code === "23514" || error.code === "22P02") {
    throw createError(error.message, 400);
  }
  if (error.code === "P0001") {
    throw createError(error.message, 409);
  }
  throw error;
}

function ensureDraft(exam) {
  if (exam.status !== "draft") {
    throw createError("Only draft exams can be changed. Archive or create a new exam instead.", 409);
  }
}

async function createExam(data, adminId) {
  try {
    return await withTransaction(async (client) => {
      if (data.accessMode === "institution_code") {
        const institution = await examRepository.getActiveInstitution(client, data.institutionId);
        if (!institution) throw createError("The selected institution does not exist or is inactive.", 404);
      }

      const exam = await examRepository.createExam(client, data, adminId);
      await examRepository.writeAuditLog(client, adminId, "exam_created", exam.id, {
        title: data.title,
        examMode: data.examMode,
        accessMode: data.accessMode
      });
      return examRepository.getExamDetail(exam.id, client);
    });
  } catch (error) {
    mapDatabaseError(error);
  }
}

async function getExams(filters) {
  return examRepository.listExams(filters);
}

async function getExamById(examId) {
  const exam = await examRepository.getExamDetail(examId);
  if (!exam) throw createError("Exam not found.", 404);
  return exam;
}

async function updateExam(examId, data, adminId) {
  try {
    return await withTransaction(async (client) => {
      const exam = await examRepository.getExamForUpdate(client, examId);
      if (!exam) throw createError("Exam not found.", 404);
      ensureDraft(exam);

      if (data.accessMode === "institution_code") {
        const institution = await examRepository.getActiveInstitution(client, data.institutionId);
        if (!institution) throw createError("The selected institution does not exist or is inactive.", 404);
      }

      await examRepository.updateExam(client, examId, data);
      await examRepository.writeAuditLog(client, adminId, "exam_updated", examId, {
        title: data.title
      });
      return examRepository.getExamDetail(examId, client);
    });
  } catch (error) {
    mapDatabaseError(error);
  }
}

async function attachBankQuestion(examId, data, adminId) {
  try {
    return await withTransaction(async (client) => {
      const exam = await examRepository.getExamForUpdate(client, examId);
      if (!exam) throw createError("Exam not found.", 404);
      ensureDraft(exam);

      const bankQuestion = await examRepository.getLatestActiveBankQuestion(client, data.questionId);
      if (!bankQuestion) throw createError("Active Question Bank question not found.", 404);
      if (exam.subject_id && bankQuestion.subject_id !== exam.subject_id) {
        throw createError("The selected Question Bank question belongs to a different subject than this exam.", 409);
      }

      const displayOrder = await examRepository.getNextDisplayOrder(client, examId);
      const attached = await examRepository.attachQuestion(client, {
        examId,
        questionId: bankQuestion.question_id,
        questionVersionId: bankQuestion.question_version_id,
        sourceType: "bank",
        displayOrder,
        marks: data.marks,
        negativeMarks: data.negativeMarks
      });

      await examRepository.writeAuditLog(client, adminId, "exam_bank_question_added", examId, {
        questionId: data.questionId,
        examQuestionId: attached.id
      });
      return attached;
    });
  } catch (error) {
    mapDatabaseError(error);
  }
}

async function createExamSpecificQuestion(examId, data, adminId) {
  try {
    return await withTransaction(async (client) => {
      const exam = await examRepository.getExamForUpdate(client, examId);
      if (!exam) throw createError("Exam not found.", 404);
      ensureDraft(exam);

      if (data.topicId && !exam.subject_id) {
        throw createError("Set a subject on the exam before adding an exam-specific question with a topic.", 400);
      }

      const question = await examRepository.createExamSpecificQuestion(client, exam, data, adminId);
      const displayOrder = await examRepository.getNextDisplayOrder(client, examId);
      const attached = await examRepository.attachQuestion(client, {
        examId,
        questionId: question.questionId,
        questionVersionId: question.questionVersionId,
        sourceType: "exam_specific",
        displayOrder,
        marks: data.marks,
        negativeMarks: data.negativeMarks
      });

      await examRepository.writeAuditLog(client, adminId, "exam_specific_question_added", examId, {
        questionId: question.questionId,
        examQuestionId: attached.id
      });
      return attached;
    });
  } catch (error) {
    mapDatabaseError(error);
  }
}

async function removeExamQuestion(examId, examQuestionId, adminId) {
  try {
    return await withTransaction(async (client) => {
      const exam = await examRepository.getExamForUpdate(client, examId);
      if (!exam) throw createError("Exam not found.", 404);
      ensureDraft(exam);

      const removed = await examRepository.deleteExamQuestion(client, examId, examQuestionId);
      if (!removed) throw createError("Question is not attached to this exam.", 404);
      if (removed.source_type === "exam_specific") {
        await examRepository.deleteExamSpecificQuestion(client, removed.question_id);
      }

      await examRepository.writeAuditLog(client, adminId, "exam_question_removed", examId, {
        questionId: removed.question_id,
        sourceType: removed.source_type
      });
      return { removed: true };
    });
  } catch (error) {
    mapDatabaseError(error);
  }
}

async function assignStudents(examId, data, adminId) {
  try {
    return await withTransaction(async (client) => {
      const exam = await examRepository.getExamForUpdate(client, examId);
      if (!exam) throw createError("Exam not found.", 404);
      ensureDraft(exam);
      if (exam.access_mode !== "assigned") {
        throw createError("Student assignments are only available when access mode is 'assigned'.", 409);
      }

      const validStudents = await examRepository.getStudentUsers(client, data.studentIds);
      if (validStudents.length !== data.studentIds.length) {
        throw createError("One or more student IDs are invalid, inactive or do not belong to student accounts.", 400);
      }

      await examRepository.upsertAssignments(client, examId, data.studentIds, adminId, data.dueAt);
      await examRepository.writeAuditLog(client, adminId, "exam_students_assigned", examId, {
        studentCount: data.studentIds.length
      });
      return { assignedCount: data.studentIds.length };
    });
  } catch (error) {
    mapDatabaseError(error);
  }
}

async function publishExam(examId, adminId) {
  try {
    return await withTransaction(async (client) => {
      const exam = await examRepository.getExamForUpdate(client, examId);
      if (!exam) throw createError("Exam not found.", 404);
      ensureDraft(exam);

      if (exam.ends_at && new Date(exam.ends_at) <= new Date()) {
        throw createError("The exam end time must be in the future before publishing.", 400);
      }

      // The PostgreSQL function checks for at least one question and validates four options / one correct answer.
      await client.query("SELECT validate_exam_for_publish($1)", [examId]);

      const nextStatus = exam.starts_at && new Date(exam.starts_at) > new Date()
        ? "scheduled"
        : "published";
      const published = await examRepository.publishExam(client, examId, nextStatus);
      await examRepository.writeAuditLog(client, adminId, "exam_published", examId, {
        status: nextStatus
      });
      return published;
    });
  } catch (error) {
    mapDatabaseError(error);
  }
}

async function archiveExam(examId, adminId) {
  try {
    return await withTransaction(async (client) => {
      const exam = await examRepository.getExamForUpdate(client, examId);
      if (!exam) throw createError("Exam not found.", 404);
      if (exam.status === "archived") throw createError("Exam is already archived.", 409);

      if (await examRepository.hasInProgressAttempts(client, examId)) {
        throw createError("This exam cannot be archived while students have attempts in progress.", 409);
      }

      const archived = await examRepository.archiveExam(client, examId);
      await examRepository.writeAuditLog(client, adminId, "exam_archived", examId, {});
      return archived;
    });
  } catch (error) {
    mapDatabaseError(error);
  }
}

module.exports = {
  createExam,
  getExams,
  getExamById,
  updateExam,
  attachBankQuestion,
  createExamSpecificQuestion,
  removeExamQuestion,
  assignStudents,
  publishExam,
  archiveExam
};
