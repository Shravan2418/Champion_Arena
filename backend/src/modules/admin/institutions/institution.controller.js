const service = require("./institution.service");
const {
  createInstitutionSchema,
  updateInstitutionSchema,
  institutionIdSchema,
  listInstitutionsSchema
} = require("./institution.validator");

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

async function createInstitution(req, res) {
  const data = validate(createInstitutionSchema, req.body);
  const institution = await service.createInstitution(data, req.user.id);
  res.status(201).json({
    success: true,
    message: "Institution created. Save the institution code; it is displayed only once.",
    data: institution
  });
}

async function listInstitutions(req, res) {
  const filters = validate(listInstitutionsSchema, req.query);
  const result = await service.listInstitutions(filters);
  res.status(200).json({ success: true, data: result.items, pagination: result.pagination });
}

async function getInstitution(req, res) {
  const { institutionId } = validate(institutionIdSchema, req.params);
  const institution = await service.getInstitutionById(institutionId);
  res.status(200).json({ success: true, data: institution });
}

async function updateInstitution(req, res) {
  const { institutionId } = validate(institutionIdSchema, req.params);
  const data = validate(updateInstitutionSchema, req.body);
  const institution = await service.updateInstitution(institutionId, data, req.user.id);
  res.status(200).json({ success: true, message: "Institution updated.", data: institution });
}

async function rotateInstitutionCode(req, res) {
  const { institutionId } = validate(institutionIdSchema, req.params);
  const institution = await service.rotateInstitutionCode(institutionId, req.user.id);
  res.status(200).json({
    success: true,
    message: "Institution code rotated. The previous code is no longer valid. Save this code; it is displayed only once.",
    data: institution
  });
}

module.exports = {
  createInstitution,
  listInstitutions,
  getInstitution,
  updateInstitution,
  rotateInstitutionCode
};
