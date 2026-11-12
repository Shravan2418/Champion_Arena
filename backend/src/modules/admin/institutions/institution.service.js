const crypto = require("crypto");
const repository = require("./institution.repository");

function createError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function generateInstitutionCode() {
  return `CA-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;
}

function hashInstitutionCode(code) {
  return crypto
    .createHash("sha256")
    .update(String(code).trim().toUpperCase())
    .digest("hex");
}

function handleDatabaseError(error) {
  if (error.code === "23505") {
    throw createError("An institution with conflicting unique data already exists.", 409);
  }
  if (error.code === "23503") {
    throw createError("The requested record is referenced by another record.", 409);
  }
  throw error;
}

async function createInstitution(data, adminId) {
  const code = generateInstitutionCode();
  try {
    const institution = await repository.createInstitution(
      data,
      adminId,
      hashInstitutionCode(code)
    );
    // The raw code is returned only once. The database stores only its SHA-256 hash.
    return { ...institution, institutionCode: code };
  } catch (error) {
    handleDatabaseError(error);
  }
}

async function listInstitutions(filters) {
  return repository.listInstitutions(filters);
}

async function getInstitutionById(institutionId) {
  const institution = await repository.getInstitutionById(institutionId);
  if (!institution) throw createError("Institution not found.", 404);
  return institution;
}

async function updateInstitution(institutionId, data, adminId) {
  try {
    const institution = await repository.updateInstitution(
      institutionId,
      data,
      adminId
    );
    if (!institution) throw createError("Institution not found.", 404);
    return institution;
  } catch (error) {
    handleDatabaseError(error);
  }
}

async function rotateInstitutionCode(institutionId, adminId) {
  const code = generateInstitutionCode();
  const institution = await repository.rotateInstitutionCode(
    institutionId,
    hashInstitutionCode(code),
    adminId
  );
  if (!institution) throw createError("Institution not found.", 404);
  return { ...institution, institutionCode: code };
}

module.exports = {
  createInstitution,
  listInstitutions,
  getInstitutionById,
  updateInstitution,
  rotateInstitutionCode
};
