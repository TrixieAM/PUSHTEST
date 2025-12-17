// ============================================
// ROUTE ORGANIZATION STATUS
// ============================================
// All routes have been successfully organized into separate route files:
//
// DONE: routes/users.js
//   - POST /register
//   - POST /excel-register
//   - GET /users
//   - GET /users/:employeeNumber
//
// DONE: routes/pages.js
//   - GET /pages
//   - POST /pages
//   - PUT /pages/:id
//   - DELETE /pages/:id
//   - GET /page_access/:employeeNumber
//   - POST /page_access
//   - PUT /page_access/:employeeNumber/:pageId
//
// DONE: routes/learning.js
//   - GET /learning_and_development_table
//   - GET /learning_and_development_table/by-person/:person_id
//   - POST /learning_and_development_table
//   - PUT /learning_and_development_table/:id
//   - DELETE /learning_and_development_table/:id
//   - POST /upload_learning_and_development_table
//
// DONE: routes/officialtime.js
//   - GET /officialtimetable/:employeeID
//   - POST /officialtimetable
//   - POST /upload-excel-faculty-official-time
//
// DONE: routes/remittance.js
//   - GET /employee-remittance
//   - POST /employee-remittance
//   - PUT /employee-remittance/:id
//   - DELETE /employee-remittance/:id
//
// DONE: routes/item.js
//   - GET /api/item-table
//   - POST /api/item-table
//   - PUT /api/item-table/:id
//   - DELETE /api/item-table/:id
//
// DONE: routes/salary.js
//   - GET /api/salary-grade-status
//   - POST /api/salary-grade-status
//   - PUT /api/salary-grade-status/:id
//   - DELETE /api/salary-grade-status/:id
//
// DONE: routes/department.js
//   - GET /api/department-table
//   - GET /api/department-table/:id
//   - POST /api/department-table
//   - PUT /api/department-table/:id
//   - DELETE /api/department-table/:id
//   - GET /api/department-assignment
//   - GET /api/department-assignment/:id
//   - POST /api/department-assignment
//   - PUT /api/department-assignment/:id
//   - DELETE /api/department-assignment/:id
//
// DONE: routes/leave.js
//   - GET /leave
//   - POST /leave
//   - PUT /leave/:id
//   - DELETE /leave/:id
//   - POST /leave_assignment
//   - GET /leave_assignment
//   - PUT /leave_assignment/:id
//   - DELETE /leave_assignment/:id
//
// DONE: routes/holiday.js
//   - GET /holiday
//   - POST /holiday
//   - PUT /holiday/:id
//   - DELETE /holiday/:id
//
// DONE: routes/philhealth.js
//   - POST /api/philhealth
//   - GET /api/philhealth
//   - PUT /api/philhealth/:id
//   - DELETE /api/philhealth/:id
//
// DONE: routes/profile.js
//   - POST /upload-profile-picture/:employeeNumber
//
// DONE: routes/announcements.js
//   - GET /api/announcements
//   - POST /api/announcements
//   - PUT /api/announcements/:id
//   - DELETE /api/announcements/:id
//
// DONE: routes/audit.js
//   - GET /audit-logs
//
// DONE: routes/tasks.js
//   - GET /tasks
//   - POST /tasks
//   - PUT /tasks/:id/toggle
//   - DELETE /tasks/:id
//
// DONE: routes/dashboard.js
//   - GET /api/dashboard/stats
//   - GET /api/dashboard/attendance-overview
//   - GET /api/dashboard/department-distribution
//   - GET /api/dashboard/leave-stats
//   - GET /api/dashboard/recent-activities
//   - GET /api/dashboard/payroll-summary
//   - GET /api/dashboard/monthly-attendance
//   - GET /api/dashboard/employee-growth
//   - GET /api/dashboard/employee-stats/:employeeNumber
//
// DONE: routes/notes.js
//   - GET /api/notes/:employeeNumber
//   - POST /api/notes
//   - DELETE /api/notes/:id
//
// DONE: routes/events.js
//   - GET /api/events/:employeeNumber
//   - POST /api/events
//   - DELETE /api/events/:id
//
// DONE: routes/settings.js
//   - GET /api/system-settings
//   - GET /api/system-settings/:key
//   - PUT /api/system-settings
//   - PUT /api/system-settings/:key
//   - DELETE /api/system-settings/:key
//   - POST /api/system-settings/reset
//   - GET /api/settings
//   - POST /api/settings