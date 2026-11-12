const examService = require("./exam.service");
const {
  examPayloadSchema,
  listExamsSchema,
  idParamsSchema,
  examQuestionParamsSchema,
  attachBankQuestionSchema,
  createExamSpecificQuestionSchema,
  assignmentsSchema
} = require("./exam.validator");

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

async function createExam(req, res) {
  const data = validate(examPayloadSchema, req.body);
  const exam = await examService.createExam(data, req.user.id);
  res.status(201).json({ success: true, message: "Draft exam created successfully.", data: exam });
}

async function getExams(req, res) {
  const filters = validate(listExamsSchema, req.query);
  const result = await examService.getExams(filters);
  res.status(200).json({ success: true, data: result.items, pagination: result.pagination });
}

async function getExamById(req, res) {
  const { id } = validate(idParamsSchema, req.params);
  const exam = await examService.getExamById(id);
  res.status(200).json({ success: true, data: exam });
}

async function updateExam(req, res) {
  const { id } = validate(idParamsSchema, req.params);
  const data = validate(examPayloadSchema, req.body);
  const exam = await examService.updateExam(id, data, req.user.id);
  res.status(200).json({ success: true, message: "Draft exam updated successfully.", data: exam });
}

async function attachBankQuestion(req, res) {
  const { id } = validate(idParamsSchema, req.params);
  const data = validate(attachBankQuestionSchema, req.body);
  const result = await examService.attachBankQuestion(id, data, req.user.id);
  res.status(201).json({ success: true, message: "Question Bank question added to exam.", data: result });
}

async function createExamSpecificQuestion(req, res) {
  const { id } = validate(idParamsSchema, req.params);
  const data = validate(createExamSpecificQuestionSchema, req.body);
  const result = await examService.createExamSpecificQuestion(id, data, req.user.id);
  res.status(201).json({ success: true, message: "Exam-specific question created and added.", data: result });
}

async function removeExamQuestion(req, res) {
  const { examId, examQuestionId } = validate(examQuestionParamsSchema, req.params);
  const result = await examService.removeExamQuestion(examId, examQuestionId, req.user.id);
  res.status(200).json({ success: true, message: "Question removed from draft exam.", data: result });
}

async function assignStudents(req, res) {
  const { id } = validate(idParamsSchema, req.params);
  const data = validate(assignmentsSchema, req.body);
  const result = await examService.assignStudents(id, data, req.user.id);
  res.status(200).json({ success: true, message: "Students assigned successfully.", data: result });
}

async function publishExam(req, res) {
  const { id } = validate(idParamsSchema, req.params);
  const result = await examService.publishExam(id, req.user.id);
  res.status(200).json({ success: true, message: "Exam published successfully.", data: result });
}

async function archiveExam(req, res) {
  const { id } = validate(idParamsSchema, req.params);
  const result = await examService.archiveExam(id, req.user.id);
  res.status(200).json({ success: true, message: "Exam archived successfully.", data: result });
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
