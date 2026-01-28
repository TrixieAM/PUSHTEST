const express = require('express');
const router = express.Router();
const db = require('../../db');
const { authenticateToken, logAudit } = require('../../middleware/auth');
const socketService = require('../../socket/socketService');

// GET all assessment clearance records
router.get('/api/assessment-clearance', authenticateToken, (req, res) => {
  const sql = `SELECT * FROM assessment_clearance ORDER BY created_at DESC`;

  db.query(sql, (err, result) => {
    if (err) {
      console.error('Database Query Error:', err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    try {
      logAudit(req.user, 'View', 'assessment_clearance', null, null);
    } catch (e) {
      console.error('Audit log error:', e);
    }

    res.json(result);
  });
});

// GET a single assessment clearance by ID
router.get('/api/assessment-clearance/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  const sql = `SELECT * FROM assessment_clearance WHERE id = ?`;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Database Query Error:', err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: 'Assessment clearance not found' });
    }

    try {
      logAudit(req.user, 'View', 'assessment_clearance', id, null);
    } catch (e) {
      console.error('Audit log error:', e);
    }

    res.json(result[0]);
  });
});

// POST: Create assessment clearance record
router.post('/api/assessment-clearance', authenticateToken, (req, res) => {
  const {
    date,
    first_semester,
    second_semester,
    school_year_from,
    school_year_to,
    name,
    position,
    department,
    college_dean,
    director_of_instruction,
    ecc_administrator,
    date_signed,
    email_address,
    telephone_cellphone,
    date_fully_accomplished,
    vacation_address,
    deadline_of_submission
  } = req.body;

  const sql = `INSERT INTO assessment_clearance (
    date,
    first_semester,
    second_semester,
    school_year_from,
    school_year_to,
    name,
    position,
    department,
    college_dean,
    director_of_instruction,
    ecc_administrator,
    date_signed,
    email_address,
    telephone_cellphone,
    date_fully_accomplished,
    vacation_address,
    deadline_of_submission
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(
    sql,
    [
      date || null,
      first_semester ? 1 : 0,
      second_semester ? 1 : 0,
      school_year_from || null,
      school_year_to || null,
      name || null,
      position || null,
      department || null,
      college_dean || null,
      director_of_instruction || null,
      ecc_administrator || null,
      date_signed || null,
      email_address || null,
      telephone_cellphone || null,
      date_fully_accomplished || null,
      vacation_address || null,
      deadline_of_submission || null
    ],
    (err, result) => {
      if (err) {
        console.error('Database Insert Error:', err.message);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      try {
        logAudit(req.user, 'Create', 'assessment_clearance', result.insertId, null);
      } catch (e) {
        console.error('Audit log error:', e);
      }

      // Notify admins in real-time
      socketService.broadcastToRoles(
        ['administrator', 'superadmin', 'technical'],
        'assessmentClearanceChanged',
        { action: 'created', id: result.insertId },
      );

      res.status(201).json({
        message: 'Assessment clearance record created successfully',
        id: result.insertId,
      });
    }
  );
});

// PUT: Update assessment clearance record
router.put('/api/assessment-clearance/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  const {
    date,
    first_semester,
    second_semester,
    school_year_from,
    school_year_to,
    name,
    position,
    department,
    college_dean,
    director_of_instruction,
    ecc_administrator,
    date_signed,
    email_address,
    telephone_cellphone,
    date_fully_accomplished,
    vacation_address,
    deadline_of_submission
  } = req.body;

  const sql = `UPDATE assessment_clearance SET
    date = ?,
    first_semester = ?,
    second_semester = ?,
    school_year_from = ?,
    school_year_to = ?,
    name = ?,
    position = ?,
    department = ?,
    college_dean = ?,
    director_of_instruction = ?,
    ecc_administrator = ?,
    date_signed = ?,
    email_address = ?,
    telephone_cellphone = ?,
    date_fully_accomplished = ?,
    vacation_address = ?,
    deadline_of_submission = ?
    WHERE id = ?`;

  db.query(
    sql,
    [
      date || null,
      first_semester ? 1 : 0,
      second_semester ? 1 : 0,
      school_year_from || null,
      school_year_to || null,
      name || null,
      position || null,
      department || null,
      college_dean || null,
      director_of_instruction || null,
      ecc_administrator || null,
      date_signed || null,
      email_address || null,
      telephone_cellphone || null,
      date_fully_accomplished || null,
      vacation_address || null,
      deadline_of_submission || null,
      id
    ],
    (err, result) => {
      if (err) {
        console.error('Database Update Error:', err.message);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Assessment clearance not found' });
      }

      try {
        logAudit(req.user, 'Update', 'assessment_clearance', id, null);
      } catch (e) {
        console.error('Audit log error:', e);
      }

      // Notify admins in real-time
      socketService.broadcastToRoles(
        ['administrator', 'superadmin', 'technical'],
        'assessmentClearanceChanged',
        { action: 'updated', id: Number(id) },
      );

      res.json({ message: 'Assessment clearance record updated successfully' });
    }
  );
});

// DELETE: Delete assessment clearance record
router.delete('/api/assessment-clearance/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  const sql = `DELETE FROM assessment_clearance WHERE id = ?`;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Database Delete Error:', err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Assessment clearance not found' });
    }

    try {
      logAudit(req.user, 'Delete', 'assessment_clearance', id, null);
    } catch (e) {
      console.error('Audit log error:', e);
    }

    // Notify admins in real-time
    socketService.broadcastToRoles(
      ['administrator', 'superadmin', 'technical'],
      'assessmentClearanceChanged',
      { action: 'deleted', id: Number(id) },
    );

    res.json({ message: 'Assessment clearance record deleted successfully' });
  });
});

module.exports = router;
