const subjectRepository = require("./subject.repository");

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function handleDatabaseError(error) {
  if (error.code === "23505") {
    throw createError("A subject or topic with this name already exists.", 409);
  }

  if (error.code === "23503") {
    throw createError(
      "This record is being used by another part of the system.",
      409
    );
  }

  throw error;
}

async function createSubject(data) {
  try {
    return await subjectRepository.createSubject(data);
  } catch (error) {
    handleDatabaseError(error);
  }
}

async function getSubjects() {
  return subjectRepository.listSubjects();
}

async function getSubjectById(subjectId) {
  const subject = await subjectRepository.getSubjectById(subjectId);

  if (!subject) {
    throw createError("Subject not found.", 404);
  }

  return subject;
}

async function updateSubject(subjectId, data) {
  try {
    const subject = await subjectRepository.updateSubject(subjectId, data);

    if (!subject) {
      throw createError("Subject not found.", 404);
    }

    return subject;
  } catch (error) {
    handleDatabaseError(error);
  }
}

async function deleteSubject(subjectId) {
  const result = await subjectRepository.deleteSubject(subjectId);

  if (result.notFound) {
    throw createError("Subject not found.", 404);
  }

  if (result.inUse) {
    throw createError(
      `This subject cannot be deleted because it is used by ${result.questionCount} question(s) and ${result.examCount} exam(s).`,
      409
    );
  }

  return { deleted: true };
}

async function createTopic(subjectId, data) {
  const existingTopics = await subjectRepository.listTopics(subjectId);

  if (existingTopics === null) {
    throw createError("Subject not found.", 404);
  }

  try {
    return await subjectRepository.createTopic(subjectId, data.name);
  } catch (error) {
    handleDatabaseError(error);
  }
}

async function getTopics(subjectId) {
  const topics = await subjectRepository.listTopics(subjectId);

  if (topics === null) {
    throw createError("Subject not found.", 404);
  }

  return topics;
}

async function updateTopic(topicId, data) {
  try {
    const topic = await subjectRepository.updateTopic(topicId, data.name);

    if (!topic) {
      throw createError("Topic not found.", 404);
    }

    return topic;
  } catch (error) {
    handleDatabaseError(error);
  }
}

async function deleteTopic(topicId) {
  const result = await subjectRepository.deleteTopic(topicId);

  if (result.notFound) {
    throw createError("Topic not found.", 404);
  }

  if (result.inUse) {
    throw createError(
      `This topic cannot be deleted because it is used by ${result.questionCount} question(s).`,
      409
    );
  }

  return { deleted: true };
}

module.exports = {
  createSubject,
  getSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
  createTopic,
  getTopics,
  updateTopic,
  deleteTopic
};
