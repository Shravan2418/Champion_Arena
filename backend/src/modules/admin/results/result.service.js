const repository = require("./result.repository");

function createError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function listResults(filters) {
  return repository.listResults(filters);
}

async function getResultDetail(resultId) {
  const result = await repository.getResultDetail(resultId);
  if (!result) throw createError("Exam result not found.", 404);
  return result;
}

async function getExamSummary(examId) {
  const summary = await repository.getExamSummary(examId);
  if (!summary) throw createError("Exam not found.", 404);
  return summary;
}

async function releaseManualResults(examId, adminId) {
  const outcome = await repository.releaseManualResults(examId, adminId);

  if (outcome.notFound) {
    throw createError("Exam not found.", 404);
  }

  if (outcome.invalidState) {
    throw createError(
      `This exam is not waiting for manual release. Current release mode: ${outcome.currentMode}.`,
      409
    );
  }

  if (outcome.noResults) {
    throw createError(
      "There are no evaluated results to release for this exam.",
      409
    );
  }

  if (outcome.activeAttempts) {
    throw createError(
      `Cannot release results while ${outcome.activeAttemptCount} student attempt(s) are still in progress.`,
      409
    );
  }

  return outcome;
}

module.exports = {
  listResults,
  getResultDetail,
  getExamSummary,
  releaseManualResults
};
