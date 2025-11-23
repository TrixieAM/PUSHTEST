const express = require('express');
const router = express.Router();
const db = require('../db');

// GET notifications by employee number
router.get('/api/notifications/:employeeNumber', async (req, res) => {
  try {
    const { employeeNumber } = req.params;
    
    // Ensure employeeNumber is treated as string for comparison
    // This handles cases where employeeNumber might be stored as string or number
    const [rows] = await db.promise().query(
      `SELECT * FROM notifications 
       WHERE CAST(employeeNumber AS CHAR) = ? 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [String(employeeNumber)]
    );
    
    console.log(`Fetching notifications for employeeNumber: ${employeeNumber}, found ${rows.length} notifications`);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

// GET unread notifications count by employee number
router.get('/api/notifications/:employeeNumber/unread-count', async (req, res) => {
  try {
    const { employeeNumber } = req.params;
    const [rows] = await db.promise().query(
      `SELECT COUNT(*) as count FROM notifications 
       WHERE CAST(employeeNumber AS CHAR) = ? AND read_status = 0`,
      [String(employeeNumber)]
    );
    res.json({ count: rows[0].count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ message: 'Error fetching unread count' });
  }
});

// PUT: Mark notification as read
router.put('/api/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.promise().query(
      'UPDATE notifications SET read_status = 1 WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    console.log(`Notification ${id} marked as read`);
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ message: 'Error updating notification' });
  }
});

// PUT: Mark all notifications as read for an employee
router.put('/api/notifications/:employeeNumber/read-all', async (req, res) => {
  try {
    const { employeeNumber } = req.params;
    await db.promise().query(
      'UPDATE notifications SET read_status = 1 WHERE employeeNumber = ?',
      [employeeNumber]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating notifications:', error);
    res.status(500).json({ message: 'Error updating notifications' });
  }
});

module.exports = router;

