const pool = require("../../config/database");
const questionRepository = require("./question.repository");

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function withTransaction(callback) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await callback(client);

    await client.query("COMMIT");

    return result;
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Question Bank transaction rollback failed:", rollbackError);
    }

    throw error;
  } finally {
    client.release();
  }
}

async function createQuestion(data, adminId) {
  return withTransaction(async (client) => {
    const question = await questionRepository.createQuestion(
      client,
      data,
      adminId
    );

    const version = await questionRepository.createQuestionVersion(
      client,
      question.id,
      1,
      data,
      adminId
    );

    await questionRepository.createQuestionOptions(
      client,
      version.id,
      data.options
    );

    return questionRepository.getQuestionDetail(question.id, client);
  });
}

async function getQuestions(filters) {
  return questionRepository.listQuestions(filters);
}

async function getQuestionById(questionId) {
  const question = await questionRepository.getQuestionDetail(questionId);

  if (!question) {
    throw createError("Question not found", 404);
  }

  return question;
}

async function updateQuestion(questionId, data, adminId) {
  return withTransaction(async (client) => {
    const existingQuestion = await questionRepository.getQuestionForUpdate(
      client,
      questionId
    );

    if (!existingQuestion) {
      throw createError("Question not found in the Question Bank", 404);
    }

    await questionRepository.updateQuestion(
      client,
      questionId,
      data
    );

    const nextVersion = await questionRepository.getNextVersionNumber(
      client,
      questionId
    );

    const version = await questionRepository.createQuestionVersion(
      client,
      questionId,
      nextVersion,
      data,
      adminId
    );

    await questionRepository.createQuestionOptions(
      client,
      version.id,
      data.options
    );

    return questionRepository.getQuestionDetail(questionId, client);
  });
}

async function archiveQuestion(questionId) {
  const question = await questionRepository.archiveQuestion(questionId);

  if (!question) {
    throw createError("Question not found in the Question Bank", 404);
  }

  return question;
}

module.exports = {
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  archiveQuestion
};
