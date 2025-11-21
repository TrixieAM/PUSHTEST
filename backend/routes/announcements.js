const express = require('express');
const router = express.Router();
const db = require('../db');
const { upload } = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

// GET all announcements
router.get('/api/announcements', (req, res) => {
  const query = 'SELECT * FROM announcements ORDER BY date DESC';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching announcements:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(results);
  });
});

// POST: Create announcement
router.post('/api/announcements', upload.single('image'), (req, res) => {
  const { title, about, date } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  const query =
    'INSERT INTO announcements (title, about, date, image) VALUES (?, ?, ?, ?)';
  db.query(query, [title, about, date, image], (err, result) => {
    if (err) {
      console.error('Error creating announcement:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.status(201).json({
      message: 'Announcement created successfully',
      id: result.insertId,
    });
  });
});

// PUT: Update announcement
router.put('/api/announcements/:id', upload.single('image'), (req, res) => {
  const { id } = req.params;
  const { title, about, date } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  // Build query dynamically if image is updated
  let query, params;
  if (image) {
    query =
      'UPDATE announcements SET title = ?, about = ?, date = ?, image = ? WHERE id = ?';
    params = [title, about, date, image, id];
  } else {
    query =
      'UPDATE announcements SET title = ?, about = ?, date = ? WHERE id = ?';
    params = [title, about, date, id];
  }

  db.query(query, params, (err, result) => {
    if (err) {
      console.error('Error updating announcement:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }
    res.json({ message: 'Announcement updated successfully' });
  });
});

// DELETE: Delete announcement
router.delete('/api/announcements/:id', (req, res) => {
  const { id } = req.params;

  // First get the announcement to check if it has an image
  const getQuery = 'SELECT image FROM announcements WHERE id = ?';
  db.query(getQuery, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    // If there's an image, delete it from the filesystem
    if (results[0].image) {
      const imagePath = path.join(__dirname, '..', results[0].image);
      fs.unlink(imagePath, (err) => {
        if (err) console.error('Error deleting image:', err);
      });
    }

    // Delete the announcement from the database
    const deleteQuery = 'DELETE FROM announcements WHERE id = ?';
    db.query(deleteQuery, [id], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.json({ message: 'Announcement deleted successfully' });
    });
  });
});

module.exports = router;


