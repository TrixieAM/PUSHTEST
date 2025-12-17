const express = require('express');
const cors = require('cors');
const bodyparser = require('body-parser');
require('dotenv').config();

const db = require('./db');

// Import existing route modules
const childrenRouter = require('./dashboardRoutes/Children');
const EligibilityRoute = require('./dashboardRoutes/Eligibility');
const VoluntaryWork = require('./dashboardRoutes/Voluntary');
const CollegeRoute = require('./dashboardRoutes/College');
const VocationalRoute = require('./dashboardRoutes/Vocational');
const PersonalRoute = require('./dashboardRoutes/PersonalInfo');
const WorkExperienceRoute = require('./dashboardRoutes/WorkExperience');
const OtherInfo = require('./dashboardRoutes/OtherSkills');
const GraduateRoute = require('./dashboardRoutes/Graduate');
const AllData = require('./dashboardRoutes/DataRoute');
const Leave = require('./dashboardRoutes/Leave');
const Attendance = require('./dashboardRoutes/Attendance');
const SalaryGradeTable = require('./payrollRoutes/SalaryGradeTable');
const Remittance = require('./payrollRoutes/Remittance');
const SendPayslip = require('./payrollRoutes/SendPayslip');
const Payroll = require('./payrollRoutes/Payroll');
const PayrollReleased = require('./payrollRoutes/PayrollReleased');
const PayrollJO = require('./payrollRoutes/PayrollJO');
const EmployeeCategory = require('./dashboardRoutes/EmployeeCategory');

// Import new organized routes
const authRoutes = require('./routes/auth');
const passwordRoutes = require('./routes/password');
const settingsRoutes = require('./routes/settings');
const learningRoutes = require('./routes/learning');
const userRoutes = require('./routes/users');
const pageRoutes = require('./routes/pages');
const officialtimeRoutes = require('./routes/officialtime');
const remittanceRoutes = require('./routes/remittance');
const itemRoutes = require('./routes/item');
const salaryRoutes = require('./routes/salary');
const departmentRoutes = require('./routes/department');
const leaveRoutes = require('./routes/leave');
const holidayRoutes = require('./routes/holiday');
const philhealthRoutes = require('./routes/philhealth');
const profileRoutes = require('./routes/profile');
const announcementsRoutes = require('./routes/announcements');
const auditRoutes = require('./routes/audit');
const tasksRoutes = require('./routes/tasks');
const dashboardRoutes = require('./routes/dashboard');
const notesRoutes = require('./routes/notes');
const eventsRoutes = require('./routes/events');
const notificationsRoutes = require('./routes/notifications');
const reportsRoutes = require('./routes/reports');
const settingsExtendedRoutes = require('./routes/settings-extended');
const confidentialPasswordRoutes = require('./routes/confidential-password');

const app = express();

// Middleware
app.use(express.json());
app.use(bodyparser.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const allowedOrigins = [
  'http://localhost:5137',
  'http://192.168.20.16:5137',
  'http://192.168.50.45:5137',
  'http://136.239.248.42:5137',
  'http://192.168.50.97:5137',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Static file serving
app.use('/uploads', express.static('uploads'));

// Ensure audit log table exists
const ensureAuditLogTableSQL = `
  CREATE TABLE IF NOT EXISTS audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employeeNumber VARCHAR(64) NULL,
    action VARCHAR(512) NOT NULL,
    table_name VARCHAR(128) NULL,
    record_id INT NULL,
    targetEmployeeNumber VARCHAR(64) NULL,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

db.query(ensureAuditLogTableSQL, (err) => {
  if (err) {
    console.error('Failed to ensure audit_log table exists:', err);
  } else {
    console.log('Audit log table ready');
  }
});

// Mount existing dashboard and payroll routes
app.use('/ChildrenRoute', childrenRouter);
app.use('/VoluntaryRoute', VoluntaryWork);
app.use('/eligibilityRoute', EligibilityRoute);
app.use('/college', CollegeRoute);
app.use('/GraduateRoute', GraduateRoute);
app.use('/vocational', VocationalRoute);
app.use('/personalinfo', PersonalRoute);
app.use('/WorkExperienceRoute', WorkExperienceRoute);
app.use('/OtherInfo', OtherInfo);
app.use('/allData', AllData);
app.use('/attendance', Attendance);
app.use('/SalaryGradeTable', SalaryGradeTable);
app.use('/Remittance', Remittance);
app.use('/leaveRoute', Leave);
app.use('/SendPayslipRoute', SendPayslip);
app.use('/PayrollRoute', Payroll);
app.use('/PayrollReleasedRoute', PayrollReleased);
app.use('/PayrollJORoutes', PayrollJO);
app.use('/EmploymentCategoryRoutes', EmployeeCategory);

// Mount new organized routes
// Note: These routes are mounted at root to maintain compatibility with existing frontend
// The route files define routes like '/login', so mounting at '/' preserves the original paths
app.use('/', authRoutes);
app.use('/', passwordRoutes);
app.use('/', settingsRoutes);
app.use('/', learningRoutes);
app.use('/', userRoutes);
app.use('/', pageRoutes);
app.use('/', officialtimeRoutes);
app.use('/', remittanceRoutes);
app.use('/', itemRoutes);
app.use('/', salaryRoutes);
app.use('/', departmentRoutes);
app.use('/', leaveRoutes);
app.use('/', holidayRoutes);
app.use('/', philhealthRoutes);
app.use('/', profileRoutes);
app.use('/', announcementsRoutes);
app.use('/', auditRoutes);
app.use('/', tasksRoutes);
app.use('/', dashboardRoutes);
app.use('/', notesRoutes);
app.use('/', eventsRoutes);
app.use('/', notificationsRoutes);
app.use('/', reportsRoutes);
app.use('/', settingsExtendedRoutes);
app.use('/', confidentialPasswordRoutes);



// Server startup
const PORT = process.env.WEB_PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}...`);
});

module.exports = app;
