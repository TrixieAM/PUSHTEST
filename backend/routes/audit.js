const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, logAudit } = require('../middleware/auth');

// GET audit logs (with VIEW action logged)
router.get('/audit-logs', authenticateToken, (req, res) => {
  const query = 'SELECT * FROM audit_log ORDER BY timestamp DESC';
  db.query(query, (err, result) => {
    if (err) {
      console.error('Error fetching audit logs:', err);
      return res.status(500).json({ error: 'Failed to fetch audit logs' });
    }

    try {
      // Log VIEW action for audit logs page
      logAudit(req.user, 'VIEW', 'audit_log', null, null);
    } catch (e) {
      console.error('Audit log error:', e);
    }

    res.json(result);
  });
});

// Example routes for other modules - Add these patterns to your existing routes

// CREATE/INSERT Examples
router.post('/employees', authenticateToken, (req, res) => {
  const { /* employee fields */ } = req.body;
  
  const query = 'INSERT INTO employees SET ?';
  db.query(query, [req.body], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Log CREATE action
    logAudit(req.user, 'CREATE', 'employees', result.insertId, null);
    res.json({ success: true, id: result.insertId });
  });
});

// UPDATE Example
router.put('/employees/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  const query = 'UPDATE employees SET ? WHERE id = ?';
  db.query(query, [req.body, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Log UPDATE action
    logAudit(req.user, 'UPDATE', 'employees', id, null);
    res.json({ success: true });
  });
});

// DELETE/REMOVE Example
router.delete('/employees/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  const query = 'DELETE FROM employees WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Log DELETE action
    logAudit(req.user, 'DELETE', 'employees', id, null);
    res.json({ success: true });
  });
});

// SEARCH Example
router.post('/employees/search', authenticateToken, (req, res) => {
  const { searchTerm } = req.body;
  
  const query = 'SELECT * FROM employees WHERE name LIKE ? OR employeeNumber LIKE ?';
  const searchPattern = `%${searchTerm}%`;
  
  db.query(query, [searchPattern, searchPattern], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Log SEARCH action
    logAudit(req.user, 'SEARCH', 'employees', null, null);
    res.json(result);
  });
});

// EXPORT Example
router.get('/employees/export', authenticateToken, (req, res) => {
  const query = 'SELECT * FROM employees';
  
  db.query(query, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Log EXPORT action
    logAudit(req.user, 'EXPORT', 'employees', null, null);
    
    // Generate CSV or Excel file
    res.json(result);
  });
});

// REPORT Example
router.get('/reports/attendance', authenticateToken, (req, res) => {
  const { startDate, endDate } = req.query;
  
  const query = 'SELECT * FROM attendance WHERE date BETWEEN ? AND ?';
  db.query(query, [startDate, endDate], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Log REPORT action
    logAudit(req.user, 'REPORT', 'attendance', null, null);
    res.json(result);
  });
});

// LOGIN (typically in auth routes)
router.post('/login', (req, res) => {
  const { employeeNumber, password } = req.body;
  
  // Authenticate user...
  // After successful authentication:
  const user = { employeeNumber, role: 'employee' }; // from DB
  
  // Log LOGIN action
  logAudit(user, 'LOGIN', 'auth', null, null);
  
  res.json({ token: 'jwt_token_here' });
});

// LOGOUT (typically in auth routes)
router.post('/logout', authenticateToken, (req, res) => {
  // Log LOGOUT action
  logAudit(req.user, 'LOGOUT', 'auth', null, null);
  res.json({ success: true });
});

module.exports = router;