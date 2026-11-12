CHAMPION ARENA — EXAM MANAGEMENT MODULE

CONTENTS
  src/modules/exams/
    exam.validator.js
    exam.repository.js
    exam.service.js
    exam.controller.js
    exam.routes.js

INSTALL
1. Extract this ZIP into the backend folder (the folder containing package.json).
   The archive has a top-level src/ directory and will merge into your existing src/.
2. Open backend/src/app.js. Add this import beside your other route imports:

   const examRoutes = require("./modules/exams/exam.routes");

3. Register the route before the 404 handler:

   app.use("/api/exams", examRoutes);

4. Keep your existing auth, question, subject, middleware and error-handler code.
5. Check syntax from the backend directory:

   $files = Get-ChildItem .\src\modules\exams\*.js
   foreach ($file in $files) { node --check $file.FullName; if ($LASTEXITCODE -ne 0) { throw "Syntax error: $($file.Name)" } }

   npm run dev

AUTHORIZATION
All routes require an authenticated Admin account. Exactly two application roles remain: student and admin.

ENDPOINTS
POST   /api/exams
GET    /api/exams?page=1&limit=20&status=draft&examMode=formal&accessMode=public&search=...
GET    /api/exams/:id
PUT    /api/exams/:id                   (replace all exam settings; draft only)
POST   /api/exams/:id/questions/bank   (attach a reusable Question Bank question)
POST   /api/exams/:id/questions/custom (create an exam-specific MCQ and attach it)
DELETE /api/exams/:examId/questions/:examQuestionId (draft only)
POST   /api/exams/:id/assignments      (assigned-access exams; student IDs only)
POST   /api/exams/:id/publish          (validates questions and assignments)
POST   /api/exams/:id/archive

NOTES
- Practice exams automatically use instant feedback. Formal exams automatically use after-submit feedback.
- Publishing calls the existing PostgreSQL validate_exam_for_publish(uuid) function.
- Question Bank questions are attached using the latest immutable question version at the time they are added.
  That selected version is stored in exam_questions and remains frozen for the exam.
- Exam-specific questions are stored with source_type='exam_specific' and cannot be reused by another exam.
- The API returns correct-answer flags in exam detail because these routes are Admin-only. Student exam APIs must not expose them during a formal exam.
- Future start times produce status='scheduled'. A later student-facing availability layer should only open these exams when starts_at has arrived; a scheduled-state transition job can be added with the student exam module.
- This package was syntax-checked with node --check. It has not yet been integration-tested against your local PostgreSQL database or your current app.js.
