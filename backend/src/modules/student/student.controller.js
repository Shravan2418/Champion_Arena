const service = require("./student.service");
const {
  updateProfileSchema,
  performanceQuerySchema
} = require("./student.validator");

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

async function getProfile(req, res) {
  const profile = await service.getProfile(req.user.id);
  res.status(200).json({
    success: true,
    data: profile
  });
}

async function updateProfile(req, res) {
  const data = validate(updateProfileSchema, req.body);
  const profile = await service.updateProfile(req.user.id, data);
  res.status(200).json({
    success: true,
    message: "Profile updated successfully.",
    data: profile
  });
}

async function getDashboard(req, res) {
  const dashboard = await service.getDashboard(req.user.id);
  res.status(200).json({
    success: true,
    data: dashboard
  });
}

async function getPerformance(req, res) {
  const { days } = validate(performanceQuerySchema, req.query);
  const performance = await service.getPerformance(req.user.id, days);
  res.status(200).json({
    success: true,
    data: performance
  });
}

module.exports = {
  getProfile,
  updateProfile,
  getDashboard,
  getPerformance
};
