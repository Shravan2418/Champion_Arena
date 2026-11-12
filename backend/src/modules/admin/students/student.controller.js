const service = require("./student.service");
const {
  studentIdSchema,
  listStudentsSchema,
  studentStatusSchema,
  assignInstitutionSchema,
  membershipStatusSchema,
  studentInstitutionParamsSchema
} = require("./student.validator");

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

async function listStudents(req, res) {
  const filters = validate(listStudentsSchema, req.query);
  const result = await service.listStudents(filters);
  res.status(200).json({
    success: true,
    data: result.items,
    pagination: result.pagination
  });
}

async function getStudent(req, res) {
  const { studentId } = validate(studentIdSchema, req.params);
  const student = await service.getStudentById(studentId);
  res.status(200).json({ success: true, data: student });
}

async function updateStudentStatus(req, res) {
  const { studentId } = validate(studentIdSchema, req.params);
  const { isActive } = validate(studentStatusSchema, req.body);
  const student = await service.updateStudentStatus(
    studentId,
    isActive,
    req.user.id
  );
  res.status(200).json({
    success: true,
    message: isActive
      ? "Student account activated."
      : "Student account deactivated and active sessions revoked.",
    data: student
  });
}

async function assignInstitution(req, res) {
  const params = validate(studentInstitutionParamsSchema, req.params);
  const data = validate(assignInstitutionSchema, req.body);
  const membership = await service.assignInstitution(
    params.studentId,
    params.institutionId,
    data,
    req.user.id
  );
  res.status(200).json({
    success: true,
    message: "Student linked to institution successfully.",
    data: membership
  });
}

async function updateMembershipStatus(req, res) {
  const params = validate(studentInstitutionParamsSchema, req.params);
  const { membershipStatus } = validate(membershipStatusSchema, req.body);
  const membership = await service.updateMembershipStatus(
    params.studentId,
    params.institutionId,
    membershipStatus,
    req.user.id
  );
  res.status(200).json({
    success: true,
    message: "Student institution membership updated.",
    data: membership
  });
}

module.exports = {
  listStudents,
  getStudent,
  updateStudentStatus,
  assignInstitution,
  updateMembershipStatus
};
