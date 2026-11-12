const service = require("./result.service");
const {
  listResultsSchema,
  idParamsSchema,
  examIdParamsSchema
} = require("./result.validator");

function validate(schema, value) {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    const error = new Error("Validation failed.");
    error.statusCode = 400;
    error.details = parsed.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message
    }));
    throw error;
  }
  return parsed.data;
}

async function listResults(req, res) {
  const filters = validate(listResultsSchema, req.query);
  const result = await service.listResults(filters);
  res.status(200).json({ success: true, data: result.items, pagination: result.pagination });
}

async function getResultDetail(req, res) {
  const { resultId } = validate(idParamsSchema, req.params);
  const result = await service.getResultDetail(resultId);
  res.status(200).json({ success: true, data: result });
}

async function getExamSummary(req, res) {
  const { examId } = validate(examIdParamsSchema, req.params);
  const summary = await service.getExamSummary(examId);
  res.status(200).json({ success: true, data: summary });
}

async function releaseManualResults(req, res) {
  const { examId } = validate(examIdParamsSchema, req.params);
  const result = await service.releaseManualResults(examId, req.user.id);
  res.status(200).json({
    success: true,
    message: `Results released successfully for ${result.resultCount} evaluated attempt(s).`,
    data: result
  });
}

module.exports = {
  listResults,
  getResultDetail,
  getExamSummary,
  releaseManualResults
};
