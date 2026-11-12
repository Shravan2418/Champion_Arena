const attemptService = require("./attempt.service");
const {
  examIdParamsSchema,
  attemptIdParamsSchema,
  saveAnswerParamsSchema,
  saveAnswerBodySchema,
  listExamsQuerySchema
} = require("./attempt.validator");

function validate(schema, value) {
  const result = schema.safeParse(value);
  if (!result.success) {
    const error = new Error("Validation failed.");
    error.statusCode = 400;
    error.details = result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message
    }));
    throw error;
  }
  return result.data;
}

async function listExams(req, res) {
  const filters = validate(listExamsQuerySchema, req.query);
  const result = await attemptService.listExams(req.user.id, filters);
  res.status(200).json({
    success: true,
    data: result.items,
    pagination: result.pagination
  });
}

async function getExamDetails(req, res) {
  const { examId } = validate(examIdParamsSchema, req.params);
  const exam = await attemptService.getExamDetails(examId, req.user.id);
  res.status(200).json({ success: true, data: exam });
}

async function startAttempt(req, res) {
  const { examId } = validate(examIdParamsSchema, req.params);
  const result = await attemptService.startAttempt(examId, req.user.id);

  if (result.attemptExpired) {
    return res.status(409).json({
      success: false,
      message: result.message,
      resultAvailable: result.resultAvailable,
      result: result.result
    });
  }

  res.status(result.resumed ? 200 : 201).json({
    success: true,
    message: result.resumed
      ? "Your existing examination attempt has been restored."
      : "Examination attempt started successfully.",
    data: result.attempt
  });
}

async function getAttempt(req, res) {
  const { attemptId } = validate(attemptIdParamsSchema, req.params);
  const attempt = await attemptService.getAttempt(attemptId, req.user.id);
  res.status(200).json({ success: true, data: attempt });
}

async function saveAnswer(req, res) {
  const params = validate(saveAnswerParamsSchema, req.params);
  const data = validate(saveAnswerBodySchema, req.body);
  const result = await attemptService.saveAnswer(
    params.attemptId,
    params.examQuestionId,
    req.user.id,
    data
  );

  if (result.attemptExpired) {
    return res.status(409).json({
      success: false,
      message: result.message,
      resultAvailable: result.resultAvailable,
      result: result.result
    });
  }

  res.status(200).json({
    success: true,
    message: "Answer saved successfully.",
    data: result
  });
}

async function submitAttempt(req, res) {
  const { attemptId } = validate(attemptIdParamsSchema, req.params);
  const result = await attemptService.submitAttempt(attemptId, req.user.id);
  res.status(200).json({ success: true, ...result });
}

async function getAttemptResult(req, res) {
  const { attemptId } = validate(attemptIdParamsSchema, req.params);
  const result = await attemptService.getAttemptResult(attemptId, req.user.id);
  res.status(200).json({ success: true, ...result });
}

module.exports = {
  listExams,
  getExamDetails,
  startAttempt,
  getAttempt,
  saveAnswer,
  submitAttempt,
  getAttemptResult
};
