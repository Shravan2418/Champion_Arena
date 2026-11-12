CHAMPION ARENA — STUDENT EXAM ATTEMPT & EVALUATION MODULE
========================================================

MODULE CONTENTS
---------------
src/modules/attempts/
  attempt.validator.js
  attempt.repository.js
  attempt.service.js
  attempt.controller.js
  attempt.routes.js

REQUIREMENTS
------------
- Existing Champion Arena backend (CommonJS)
- PostgreSQL schema already applied
- Existing ../../config/database.js pool export
- Existing require-auth.middleware.js and require-role.middleware.js
- Existing utils/asyncHandler.js
- zod installed (already used by the previous modules)

INSTALLATION (PowerShell)
-------------------------
1. Extract the ZIP into:
   E:\arena\ChampionArena\backend

   Ensure the files land at:
   backend\src\modules\attempts\...

2. Open src/app.js and add with the other route imports:
   const studentAttemptRoutes = require("./modules/attempts/attempt.routes");

3. Add BEFORE the 404 handler:
   app.use("/api/student", studentAttemptRoutes);

4. Do not replace the existing /api/auth, /api/questions, /api/subjects,
   or /api/exams routes. The Admin exam routes remain /api/exams.

5. Syntax check from backend:
   $files = Get-ChildItem .\src\modules\attempts\*.js
   foreach ($file in $files) {
       Write-Host "Checking $($file.Name)"
       node --check $file.FullName
       if ($LASTEXITCODE -ne 0) { throw "Syntax error: $($file.Name)" }
   }

6. Start:
   npm run dev

STUDENT API
-----------
All endpoints require an authenticated Student session.

GET    /api/student/exams
GET    /api/student/exams/:examId
POST   /api/student/exams/:examId/attempts
GET    /api/student/attempts/:attemptId
PUT    /api/student/attempts/:attemptId/answers/:examQuestionId
POST   /api/student/attempts/:attemptId/submit
GET    /api/student/attempts/:attemptId/result

SAVE ANSWER BODY
----------------
{
  "selectedOptionId": "UUID-OF-OPTION",
  "markedForReview": false
}

To clear an answer:
{
  "selectedOptionId": null
}

To only mark/unmark for review:
{
  "markedForReview": true
}

SERVER-SIDE RULES
-----------------
- Only Student role can use these routes.
- Access rules are checked by the backend (public, active institution membership,
  or explicit assignment).
- Attempt start time, deadline and remaining time are server-controlled.
- An existing in-progress attempt is resumed rather than duplicated.
- An expired attempt is auto-submitted on the next request from that student.
- All student answers are initially created in student_answers for a stable
  question palette and unanswered count.
- Formal exam answers never include correctness flags or explanations while
  the result is unreleased.
- Practice mode returns instant feedback only after that question is answered.
- Selected option IDs are checked against that exact question version.
- Marks, negative marks, correctness, score and percentage are evaluated on
  the server. Client-submitted scores are not accepted.
- Results obey result_release_mode:
    immediately   -> result visible after submission
    after_exam_end -> visible after exams.ends_at has passed
    manual        -> hidden; admin manual-release endpoint is not part of this module yet

IMPORTANT LIMITATIONS / FOLLOW-UP
---------------------------------
- Auto-submit is enforced when the student next requests/saves/submits an attempt.
  A background scheduler is not included. The UI should call submit when the
  countdown reaches zero; the server still independently checks the deadline.
- This module uses stable deterministic ordering when shuffle flags are enabled,
  derived from attempt ID and question/option IDs. Order is stable when restoring
  an attempt without requiring a schema change.
- Gamification XP/badges are not awarded here. Those belong in the Reward module,
  and must be applied idempotently after evaluation.
- Integration and database tests must still be run in the local project.
