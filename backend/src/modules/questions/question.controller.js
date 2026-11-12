const questionService = require("./question.service");

const {
  createQuestionSchema,
  updateQuestionSchema,
  listQuestionsSchema,
  questionIdSchema
} = require("./question.validator");

function validate(schema, value) {
  const result = schema.safeParse(value);

  if (!result.success) {
    const error = new Error("Validation failed");

    error.statusCode = 400;
    error.details = result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message
    }));

    throw error;
  }

  return result.data;
}

async function createQuestion(req, res) {
  const data = validate(createQuestionSchema, req.body);

  const question = await questionService.createQuestion(
    data,
    req.user.id
  );

  res.status(201).json({
    success: true,
    message: "Question created successfully",
    data: question
  });
}

async function getQuestions(req, res) {
  const filters = validate(listQuestionsSchema, req.query);

  const result = await questionService.getQuestions(filters);

  res.status(200).json({
    success: true,
    data: result.items,
    pagination: result.pagination
  });
}

async function getQuestionById(req, res) {
  const { id } = validate(questionIdSchema, req.params);

  const question = await questionService.getQuestionById(id);

  res.status(200).json({
    success: true,
    data: question
  });
}

async function updateQuestion(req, res) {
  const { id } = validate(questionIdSchema, req.params);
  const data = validate(updateQuestionSchema, req.body);

  const question = await questionService.updateQuestion(
    id,
    data,
    req.user.id
  );

  res.status(200).json({
    success: true,
    message: "Question updated successfully. A new version was created.",
    data: question
  });
}

async function archiveQuestion(req, res) {
  const { id } = validate(questionIdSchema, req.params);

  const result = await questionService.archiveQuestion(id);

  res.status(200).json({
    success: true,
    message: "Question archived successfully",
    data: result
  });
}

module.exports = {
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  archiveQuestion
};
