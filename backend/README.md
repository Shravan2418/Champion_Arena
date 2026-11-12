# Champion Arena — Notifications Module

This module adds persistent in-app notifications for the two existing roles: `student` and `admin`.

## Included files

```text
backend/
├── database/
│   └── migrations/
│       └── 003_create_notifications.sql
└── src/
    └── modules/
        └── notifications/
            ├── notification.validator.js
            ├── notification.repository.js
            ├── notification.service.js
            ├── notification.controller.js
            ├── student.routes.js
            └── admin.routes.js
```

## Installation

1. Extract the ZIP into the backend root so `src` and `database` merge with existing folders.
2. Run `database/migrations/003_create_notifications.sql` once against the `champion_arena` PostgreSQL database.
3. In `src/app.js`, add:

```js
const studentNotificationRoutes = require("./modules/notifications/student.routes");
const adminNotificationRoutes = require("./modules/notifications/admin.routes");

app.use("/api/student/notifications", studentNotificationRoutes);
app.use("/api/admin/notifications", adminNotificationRoutes);
```

Place registrations before the 404 handler. Preserve existing routes. If there is already a `/api/student` mount, the more specific `/api/student/notifications` route can be placed before or after it, provided the existing `/api/student` router does not catch unmatched paths with its own terminal 404.

4. Run `node --check` on all six JavaScript files, then start `npm run dev`.

## Student endpoints

All require an authenticated Student session.

- `GET /api/student/notifications?page=1&limit=20`
- `GET /api/student/notifications?unreadOnly=true`
- `GET /api/student/notifications?type=announcement`
- `GET /api/student/notifications/unread-count`
- `PATCH /api/student/notifications/read-all`
- `PATCH /api/student/notifications/:notificationId/read`
- `DELETE /api/student/notifications/:notificationId`

## Admin endpoints

All require an authenticated Admin session.

- `POST /api/admin/notifications`
- `GET /api/admin/notifications?page=1&limit=20`
- `GET /api/admin/notifications/:batchId`
- `GET /api/admin/notifications/:batchId/recipients?status=all|read|unread`

### Example: broadcast to all active students

```json
{
  "target": "all_students",
  "type": "announcement",
  "title": "Platform maintenance",
  "message": "The platform will be unavailable from 10 PM to 11 PM.",
  "payload": {}
}
```

### Example: send to one active student

```json
{
  "target": "student",
  "studentId": "STUDENT-UUID-HERE",
  "type": "general",
  "title": "Welcome to Champion Arena",
  "message": "Your account is ready. Start with a practice quiz."
}
```

Allowed types: `general`, `announcement`, `exam`, `result`, `reward`, `system`.

## Internal service integration

`notification.service.js` exports `createForUser(data, db)` and `createForUsers(data, db)`. Backend services can call these when an exam is assigned, a result is released, or a badge is awarded. Pass the existing PostgreSQL client as `db` when notification creation must be part of the caller's transaction.

Example:

```js
await notificationService.createForUser({
  recipientId: studentId,
  createdBy: adminId,
  type: "exam",
  title: "New exam assigned",
  message: "A new examination has been assigned to you.",
  payload: { examId }
}, client);
```

## Notes

- Notifications are stored one row per recipient. Broadcast recipients are snapshotted when the Admin sends the announcement.
- Student queries are scoped to `req.user.id`; students cannot read, update, or delete another student's notifications.
- Admin batch history is scoped to `req.user.id`; an Admin can inspect only batches they created.
- This is persistent in-app notification storage and REST polling. WebSocket push delivery is not implemented in this module.
- Automatic event hooks from exams, results, and rewards should be integrated in the corresponding service modules after their current APIs are tested.
