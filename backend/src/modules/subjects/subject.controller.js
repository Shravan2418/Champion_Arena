const subjectService = require("./subject.service");

const {
  idParamsSchema,
  subjectIdParamsSchema,
  createSubjectSchema,
  updateSubjectSchema,
  createTopicSchema,
  updateTopicSchema
} = require("./subject.validator");

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

async function createSubject(req, res) {
  const data = validate(createSubjectSchema, req.body);
  const subject = await subjectService.createSubject(data);

  res.status(201).json({
    success: true,
    message: "Subject created successfully.",
    data: subject
  });
}

async function getSubjects(req, res) {
  const subjects = await subjectService.getSubjects();

  res.status(200).json({
    success: true,
    data: subjects
  });
}

async function getSubjectById(req, res) {
  const { id } = validate(idParamsSchema, req.params);
  const subject = await subjectService.getSubjectById(id);

  res.status(200).json({
    success: true,
    data: subject
  });
}

async function updateSubject(req, res) {
  const { id } = validate(idParamsSchema, req.params);
  const data = validate(updateSubjectSchema, req.body);
  const subject = await subjectService.updateSubject(id, data);

  res.status(200).json({
    success: true,
    message: "Subject updated successfully.",
    data: subject
  });
}

async function deleteSubject(req, res) {
  const { id } = validate(idParamsSchema, req.params);
  const result = await subjectService.deleteSubject(id);

  res.status(200).json({
    success: true,
    message: "Subject deleted successfully.",
    data: result
  });
}

async function createTopic(req, res) {
  const { subjectId } = validate(subjectIdParamsSchema, req.params);
  const data = validate(createTopicSchema, req.body);
  const topic = await subjectService.createTopic(subjectId, data);

  res.status(201).json({
    success: true,
    message: "Topic created successfully.",
    data: topic
  });
}

async function getTopics(req, res) {
  const { subjectId } = validate(subjectIdParamsSchema, req.params);
  const topics = await subjectService.getTopics(subjectId);

  res.status(200).json({
    success: true,
    data: topics
  });
}

async function updateTopic(req, res) {
  const { id } = validate(idParamsSchema, req.params);
  const data = validate(updateTopicSchema, req.body);
  const topic = await subjectService.updateTopic(id, data);

  res.status(200).json({
    success: true,
    message: "Topic updated successfully.",
    data: topic
  });
}

async function deleteTopic(req, res) {
  const { id } = validate(idParamsSchema, req.params);
  const result = await subjectService.deleteTopic(id);

  res.status(200).json({
    success: true,
    message: "Topic deleted successfully.",
    data: result
  });
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
