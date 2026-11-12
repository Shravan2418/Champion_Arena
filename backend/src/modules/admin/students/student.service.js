const repository = require("./student.repository");

function createError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function listStudents(filters) {
  return repository.listStudents(filters);
}

async function getStudentById(studentId) {
  const student = await repository.getStudentById(studentId);
  if (!student) throw createError("Student not found.", 404);
  return student;
}

async function updateStudentStatus(studentId, isActive, adminId) {
  const student = await repository.updateStudentStatus(
    studentId,
    isActive,
    adminId
  );
  if (!student) throw createError("Student not found.", 404);
  return student;
}

async function assignInstitution(studentId, institutionId, data, adminId) {
  return repository.assignInstitution(
    studentId,
    institutionId,
    data,
    adminId
  );
}

async function updateMembershipStatus(
  studentId,
  institutionId,
  membershipStatus,
  adminId
) {
  const membership = await repository.updateMembershipStatus(
    studentId,
    institutionId,
    membershipStatus,
    adminId
  );
  if (!membership) {
    throw createError("Student institution membership not found.", 404);
  }
  return membership;
}

module.exports = {
  listStudents,
  getStudentById,
  updateStudentStatus,
  assignInstitution,
  updateMembershipStatus
};
