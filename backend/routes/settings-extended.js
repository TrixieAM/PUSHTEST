const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// ============================================
// FAQs ROUTES
// ============================================

// GET all FAQs
router.get('/api/faqs', (req, res) => {
  const { category } = req.query;
  let query = 'SELECT * FROM faqs WHERE is_active = 1';
  const params = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  query += ' ORDER BY display_order ASC, id ASC';

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error fetching FAQs:', err);
      return res.status(500).json({ error: 'Failed to fetch FAQs' });
    }
    res.json(results);
  });
});

// GET single FAQ
router.get('/api/faqs/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM faqs WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error fetching FAQ:', err);
      return res.status(500).json({ error: 'Failed to fetch FAQ' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'FAQ not found' });
    }
    res.json(results[0]);
  });
});

// POST create FAQ (admin only)
router.post('/api/faqs', authenticateToken, (req, res) => {
  const { question, answer, category, display_order } = req.body;

  if (!question || !answer) {
    return res.status(400).json({ error: 'Question and answer are required' });
  }

  const query = `
    INSERT INTO faqs (question, answer, category, display_order)
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    query,
    [question, answer, category || 'general', display_order || 0],
    (err, result) => {
      if (err) {
        console.error('Error creating FAQ:', err);
        return res.status(500).json({ error: 'Failed to create FAQ' });
      }
      res.status(201).json({ id: result.insertId, message: 'FAQ created successfully' });
    }
  );
});

// PUT update FAQ (admin only)
router.put('/api/faqs/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { question, answer, category, display_order, is_active } = req.body;

  const updates = [];
  const params = [];

  if (question !== undefined) {
    updates.push('question = ?');
    params.push(question);
  }
  if (answer !== undefined) {
    updates.push('answer = ?');
    params.push(answer);
  }
  if (category !== undefined) {
    updates.push('category = ?');
    params.push(category);
  }
  if (display_order !== undefined) {
    updates.push('display_order = ?');
    params.push(display_order);
  }
  if (is_active !== undefined) {
    updates.push('is_active = ?');
    params.push(is_active);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  params.push(id);

  const query = `UPDATE faqs SET ${updates.join(', ')} WHERE id = ?`;

  db.query(query, params, (err) => {
    if (err) {
      console.error('Error updating FAQ:', err);
      return res.status(500).json({ error: 'Failed to update FAQ' });
    }
    res.json({ message: 'FAQ updated successfully' });
  });
});

// DELETE FAQ (admin only)
router.delete('/api/faqs/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM faqs WHERE id = ?', [id], (err) => {
    if (err) {
      console.error('Error deleting FAQ:', err);
      return res.status(500).json({ error: 'Failed to delete FAQ' });
    }
    res.json({ message: 'FAQ deleted successfully' });
  });
});

// ============================================
// USER PREFERENCES ROUTES
// ============================================

// GET user preferences (public endpoint for login check, also supports authenticated)
router.get('/api/user-preferences/:employeeNumber', (req, res) => {
  const { employeeNumber } = req.params;

  db.query(
    'SELECT * FROM user_preferences WHERE employee_number = ?',
    [employeeNumber],
    (err, results) => {
      if (err) {
        console.error('Error fetching user preferences:', err);
        return res.status(500).json({ error: 'Failed to fetch user preferences' });
      }

      if (results.length === 0) {
        // Return default preferences if none exist
        return res.json({
          employee_number: employeeNumber,
          enable_mfa: 1, // Default to enabled
        });
      }

      res.json(results[0]);
    }
  );
});

// PUT update user preferences
router.put('/api/user-preferences/:employeeNumber', authenticateToken, (req, res) => {
  const { employeeNumber } = req.params;
  const { enable_mfa } = req.body;

  // Check if preferences exist
  db.query(
    'SELECT * FROM user_preferences WHERE employee_number = ?',
    [employeeNumber],
    (err, results) => {
      if (err) {
        console.error('Error checking user preferences:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length === 0) {
        // Insert new preferences
        db.query(
          'INSERT INTO user_preferences (employee_number, enable_mfa) VALUES (?, ?)',
          [employeeNumber, enable_mfa !== undefined ? (enable_mfa ? 1 : 0) : 1],
          (err, result) => {
            if (err) {
              console.error('Error creating user preferences:', err);
              return res.status(500).json({ error: 'Failed to create preferences' });
            }
            res.json({ message: 'Preferences updated successfully' });
          }
        );
      } else {
        // Update existing preferences
        const updates = [];
        const params = [];

        if (enable_mfa !== undefined) {
          updates.push('enable_mfa = ?');
          params.push(enable_mfa ? 1 : 0);
        }

        if (updates.length === 0) {
          return res.status(400).json({ error: 'No fields to update' });
        }

        params.push(employeeNumber);

        db.query(
          `UPDATE user_preferences SET ${updates.join(', ')} WHERE employee_number = ?`,
          params,
          (err) => {
            if (err) {
              console.error('Error updating user preferences:', err);
              return res.status(500).json({ error: 'Failed to update preferences' });
            }
            res.json({ message: 'Preferences updated successfully' });
          }
        );
      }
    }
  );
});

// ============================================
// ABOUT US ROUTES
// ============================================

// GET About Us content
router.get('/api/about-us', (req, res) => {
  db.query('SELECT * FROM about_us ORDER BY id DESC LIMIT 1', (err, results) => {
    if (err) {
      console.error('Error fetching About Us:', err);
      return res.status(500).json({ error: 'Failed to fetch About Us content' });
    }

    if (results.length === 0) {
      return res.json({
        title: 'About Us',
        content: '<p>Content coming soon...</p>',
        version: null,
      });
    }

    res.json(results[0]);
  });
});

// PUT update About Us (admin only)
router.put('/api/about-us', authenticateToken, (req, res) => {
  const { title, content, version } = req.body;
  const employeeNumber = req.user?.employeeNumber || 'system';

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  // Check if About Us exists
  db.query('SELECT * FROM about_us ORDER BY id DESC LIMIT 1', (err, results) => {
    if (err) {
      console.error('Error checking About Us:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      // Insert new About Us
      db.query(
        'INSERT INTO about_us (title, content, version, last_updated_by) VALUES (?, ?, ?, ?)',
        [title, content, version || null, employeeNumber],
        (err, result) => {
          if (err) {
            console.error('Error creating About Us:', err);
            return res.status(500).json({ error: 'Failed to create About Us' });
          }
          res.json({ id: result.insertId, message: 'About Us created successfully' });
        }
      );
    } else {
      // Update existing About Us
      const id = results[0].id;
      db.query(
        'UPDATE about_us SET title = ?, content = ?, version = ?, last_updated_by = ? WHERE id = ?',
        [title, content, version || null, employeeNumber, id],
        (err) => {
          if (err) {
            console.error('Error updating About Us:', err);
            return res.status(500).json({ error: 'Failed to update About Us' });
          }
          res.json({ message: 'About Us updated successfully' });
        }
      );
    }
  });
});

module.exports = router;

