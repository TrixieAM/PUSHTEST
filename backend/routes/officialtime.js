const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, logAudit } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const xlsx = require('xlsx');
const fs = require('fs');

// GET official time table by employeeID
router.get('/officialtimetable/:employeeID', authenticateToken, (req, res) => {
  const { employeeID } = req.params;
  const { date } = req.query;
  const sql = 'SELECT * FROM officialtime WHERE employeeID = ? ORDER BY id';

  db.query(sql, [employeeID], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    try {
      logAudit(req.user, `View`, 'Official Time', null, employeeID);
    } catch (e) {
      console.error('Audit log error:', e);
    }
    if (date) {
      try {
        logAudit(req.user, 'search', 'official-time-table', date, employeeID);
      } catch (e) {
        console.error('Audit log error:', e);
      }
    }
    res.json(results);
  });
});

// POST official time table
router.post('/officialtimetable', authenticateToken, (req, res) => {
  const { employeeID, records } = req.body;

  if (!records || records.length === 0) {
    return res.status(400).json({ message: 'No records to insert or update.' });
  }

  // Prepare values for bulk insert
  const values = records.map((r) => [
    employeeID,
    r.day,
    r.officialTimeIN,
    r.officialBreaktimeIN,
    r.officialBreaktimeOUT,
    r.officialTimeOUT,
    r.officialHonorariumTimeIN,
    r.officialHonorariumTimeOUT,
    r.officialServiceCreditTimeIN,
    r.officialServiceCreditTimeOUT,
    r.officialOverTimeIN,
    r.officialOverTimeOUT,
    r.breaktime,
  ]);

  const sql = `
    INSERT INTO officialtime (
      employeeID,
      day,
      officialTimeIN,
      officialBreaktimeIN,
      officialBreaktimeOUT,
      officialTimeOUT,
      officialHonorariumTimeIN,
      officialHonorariumTimeOUT,
      officialServiceCreditTimeIN,
      officialServiceCreditTimeOUT,
      officialOverTimeIN,
      officialOverTimeOUT,
      breaktime
    )
    VALUES ?
    ON DUPLICATE KEY UPDATE
      officialTimeIN = VALUES(officialTimeIN),
      officialBreaktimeIN = VALUES(officialBreaktimeIN),
      officialBreaktimeOUT = VALUES(officialBreaktimeOUT),
      officialTimeOUT = VALUES(officialTimeOUT),
      officialHonorariumTimeIN = VALUES(officialHonorariumTimeIN),
      officialHonorariumTimeOUT = VALUES(officialHonorariumTimeOUT),
      officialServiceCreditTimeIN = VALUES(officialServiceCreditTimeIN),
      officialServiceCreditTimeOUT = VALUES(officialServiceCreditTimeOUT),
      officialOverTimeIN = VALUES(officialOverTimeIN),
      officialOverTimeOUT = VALUES(officialOverTimeOUT),
      breaktime = VALUES(breaktime)
  `;

  db.query(sql, [values], (err, result) => {
    if (err) {
      console.error('Error inserting or updating records:', err);
      return res.status(500).json({ error: err.message });
    }
    try {
      logAudit(
        req.user,
        `Insert official time-table for ${employeeID} (${records.length} rows)`,
        'Official Time',
        null,
        employeeID
      );
    } catch (e) {
      console.error('Audit log error:', e);
    }
    res.json({ message: 'Records inserted or updated successfully' });
  });
});

// EXCEL UPLOAD FOR OFFICIAL TIME
router.post(
  '/upload-excel-faculty-official-time',
  upload.single('file'),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    try {
      const workbook = xlsx.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const sheet = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
        defval: null,
        raw: false,
      });

      if (!sheet.length) {
        return res.status(400).json({ message: 'Excel file is empty.' });
      }

      const cleanedSheet = sheet.map((row) => {
        const normalized = {};
        for (const key in row) {
          const cleanKey = key
            .replace(/\u00A0/g, '')
            .trim()
            .toLowerCase();
          normalized[cleanKey] = row[key];
        }
        return normalized;
      });

      const getField = (r, names) => {
        for (const n of names) {
          if (r[n] != null) return r[n];
        }
        return null;
      };

      let insertedCount = 0;
      let updatedCount = 0;
      const processedRecords = [];

      for (const r of cleanedSheet) {
        const employeeID = getField(r, [
          'employeeid',
          'employeenumber',
          'employee number',
          'employee_id',
        ]);
        const day = getField(r, ['day', 'weekday']);
        const officialTimeIN = getField(r, [
          'officialtimein',
          'time in',
          'timein',
        ]);
        const officialBreaktimeIN = getField(r, [
          'officialbreaktimein',
          'break in',
          'breakin',
        ]);
        const officialBreaktimeOUT = getField(r, [
          'officialbreaktimeout',
          'break out',
          'breakout',
        ]);
        const officialTimeOUT = getField(r, [
          'officialtimeout',
          'time out',
          'timeout',
        ]);
        const officialHonorariumTimeIN = getField(r, [
          'officialhonorariumtimein',
          'honorarium time in',
          'honorariumtimein',
        ]);
        const officialHonorariumTimeOUT = getField(r, [
          'officialhonorariumtimeout',
          'honorarium time out',
          'honorariumtimeout',
        ]);
        const officialServiceCreditTimeIN = getField(r, [
          'officialservicecredittimein',
          'service credit time in',
          'servicecredittimein',
        ]);
        const officialServiceCreditTimeOUT = getField(r, [
          'officialservicecredittimeout',
          'service credit time out',
          'servicecredittimeout',
        ]);
        const officialOverTimeIN = getField(r, [
          'officialovertimein',
          'overtime in',
          'ot in',
          'overtimein',
        ]);
        const officialOverTimeOUT = getField(r, [
          'officialovertimeout',
          'overtime out',
          'ot out',
          'overtimeout',
        ]);

        if (!employeeID || !day) continue;

        // Store the record for return
        const recordData = {
          employeeID,
          day,
          officialTimeIN: officialTimeIN || '00:00:00 AM',
          officialBreaktimeIN: officialBreaktimeIN || '00:00:00 AM',
          officialBreaktimeOUT: officialBreaktimeOUT || '00:00:00 AM',
          officialTimeOUT: officialTimeOUT || '00:00:00 AM',
          officialHonorariumTimeIN: officialHonorariumTimeIN || '00:00:00 AM',
          officialHonorariumTimeOUT: officialHonorariumTimeOUT || '00:00:00 AM',
          officialServiceCreditTimeIN:
            officialServiceCreditTimeIN || '00:00:00 AM',
          officialServiceCreditTimeOUT:
            officialServiceCreditTimeOUT || '00:00:00 AM',
          officialOverTimeIN: officialOverTimeIN || '00:00:00 AM',
          officialOverTimeOUT: officialOverTimeOUT || '00:00:00 AM',
        };
        processedRecords.push(recordData);

        const checkQuery = `SELECT id FROM officialtime WHERE employeeID = ? AND day = ?`;
        const checkValues = [employeeID, day];

        try {
          const [rows] = await db.promise().query(checkQuery, checkValues);

          if (rows.length > 0) {
            const updateQuery = `
            UPDATE officialtime SET
              officialTimeIN = ?,
              officialBreaktimeIN = ?,
              officialBreaktimeOUT = ?,
              officialTimeOUT = ?,
              officialHonorariumTimeIN = ?,
              officialHonorariumTimeOUT = ?,
              officialServiceCreditTimeIN = ?,
              officialServiceCreditTimeOUT = ?,
              officialOverTimeIN = ?,
              officialOverTimeOUT = ?
            WHERE employeeID = ? AND day = ?
          `;

            const updateValues = [
              officialTimeIN,
              officialBreaktimeIN,
              officialBreaktimeOUT,
              officialTimeOUT,
              officialHonorariumTimeIN,
              officialHonorariumTimeOUT,
              officialServiceCreditTimeIN,
              officialServiceCreditTimeOUT,
              officialOverTimeIN,
              officialOverTimeOUT,
              employeeID,
              day,
            ];

            const [result] = await db
              .promise()
              .query(updateQuery, updateValues);
            if (result.affectedRows > 0) updatedCount++;
          } else {
            const insertQuery = `
            INSERT INTO officialtime (
              employeeID, day,
              officialTimeIN,
              officialBreaktimeIN,
              officialBreaktimeOUT,
              officialTimeOUT,
              officialHonorariumTimeIN,
              officialHonorariumTimeOUT,
              officialServiceCreditTimeIN,
              officialServiceCreditTimeOUT,
              officialOverTimeIN,
              officialOverTimeOUT
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;

            const insertValues = [
              employeeID,
              day,
              officialTimeIN,
              officialBreaktimeIN,
              officialBreaktimeOUT,
              officialTimeOUT,
              officialHonorariumTimeIN,
              officialHonorariumTimeOUT,
              officialServiceCreditTimeIN,
              officialServiceCreditTimeOUT,
              officialOverTimeIN,
              officialOverTimeOUT,
            ];

            const [result] = await db
              .promise()
              .query(insertQuery, insertValues);
            if (result.affectedRows > 0) insertedCount++;
          }
        } catch (err) {
          console.error(
            `Error processing row for employeeID: ${employeeID}, day: ${day}`,
            err.message
          );
        }
      }

      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting uploaded file:', err);
      });

      res.json({
        message: 'Upload complete.',
        inserted: insertedCount,
        updated: updatedCount,
        records: processedRecords,
      });
    } catch (error) {
      console.error('Error processing Excel file:', error);
      res.status(500).json({ message: 'Error processing Excel file.' });
    }
  }
);

// GET all users with their official time status
router.get('/officialtime/users-status', authenticateToken, (req, res) => {
  const sql = `
    SELECT 
      u.employeeNumber,
      u.email,
      u.role,
      p.firstName,
      p.middleName,
      p.lastName,
      p.nameExtension,
      CASE 
        WHEN COUNT(ot.id) >= 7 THEN 1 
        ELSE 0 
      END as hasDefaultOfficialTime,
      COUNT(ot.id) as officialTimeDaysCount
    FROM users u
    LEFT JOIN person_table p ON u.employeeNumber = p.agencyEmployeeNum
    LEFT JOIN officialtime ot ON u.employeeNumber = ot.employeeID
    GROUP BY u.employeeNumber, u.email, u.role, p.firstName, p.middleName, p.lastName, p.nameExtension
    ORDER BY p.lastName, p.firstName
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching users with official time status:', err);
      return res.status(500).json({ error: err.message });
    }

    try {
      logAudit(req.user, 'View', 'Official Time Users Status', null, null);
    } catch (e) {
      console.error('Audit log error:', e);
    }

    // Format the results
    const formattedResults = results.map((row) => ({
      employeeNumber: row.employeeNumber,
      email: row.email,
      role: row.role,
      firstName: row.firstName || '',
      middleName: row.middleName || '',
      lastName: row.lastName || '',
      nameExtension: row.nameExtension || '',
      fullName: `${row.firstName || ''} ${row.middleName ? row.middleName + ' ' : ''}${row.lastName || ''}${row.nameExtension ? ' ' + row.nameExtension : ''}`.trim(),
      hasDefaultOfficialTime: row.hasDefaultOfficialTime === 1,
      officialTimeDaysCount: row.officialTimeDaysCount || 0,
    }));

    res.json(formattedResults);
  });
});

// POST set default official time for users who don't have it
router.post('/officialtime/set-default-for-users', authenticateToken, (req, res) => {
  const { employeeNumbers } = req.body; // Optional: if provided, only set for these users

  // Default official time values
  const defaultTimes = {
    officialTimeIN: '08:00:00 AM',
    officialBreaktimeIN: '00:00:00 AM',
    officialBreaktimeOUT: '00:00:00 PM',
    officialTimeOUT: '05:00:00 PM',
    officialHonorariumTimeIN: '00:00:00 AM',
    officialHonorariumTimeOUT: '00:00:00 PM',
    officialServiceCreditTimeIN: '00:00:00 AM',
    officialServiceCreditTimeOUT: '00:00:00 AM',
    officialOverTimeIN: '00:00:00 AM',
    officialOverTimeOUT: '00:00:00 PM',
    breaktime: '',
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // First, get all users or specific users
  let userQuery = 'SELECT employeeNumber FROM users';
  let queryParams = [];

  if (employeeNumbers && Array.isArray(employeeNumbers) && employeeNumbers.length > 0) {
    const placeholders = employeeNumbers.map(() => '?').join(',');
    userQuery += ` WHERE employeeNumber IN (${placeholders})`;
    queryParams = employeeNumbers;
  }

  db.query(userQuery, queryParams, (err, users) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ error: err.message });
    }

    let processedCount = 0;
    let insertedCount = 0;
    let errors = [];

    // Process each user
    const processUser = (user, callback) => {
      const employeeID = user.employeeNumber;

      // Check if user already has official time for all days
      const checkQuery = 'SELECT COUNT(*) as count FROM officialtime WHERE employeeID = ?';
      db.query(checkQuery, [employeeID], (checkErr, checkResult) => {
        if (checkErr) {
          errors.push(`Error checking official time for ${employeeID}: ${checkErr.message}`);
          return callback();
        }

        const existingCount = checkResult[0]?.count || 0;

        // If user already has all 7 days, skip
        if (existingCount >= 7) {
          processedCount++;
          return callback();
        }

        // Prepare values for all days
        const values = days.map((day) => [
          employeeID,
          day,
          defaultTimes.officialTimeIN,
          defaultTimes.officialBreaktimeIN,
          defaultTimes.officialBreaktimeOUT,
          defaultTimes.officialTimeOUT,
          defaultTimes.officialHonorariumTimeIN,
          defaultTimes.officialHonorariumTimeOUT,
          defaultTimes.officialServiceCreditTimeIN,
          defaultTimes.officialServiceCreditTimeOUT,
          defaultTimes.officialOverTimeIN,
          defaultTimes.officialOverTimeOUT,
          defaultTimes.breaktime,
        ]);

        const insertQuery = `
          INSERT INTO officialtime (
            employeeID,
            day,
            officialTimeIN,
            officialBreaktimeIN,
            officialBreaktimeOUT,
            officialTimeOUT,
            officialHonorariumTimeIN,
            officialHonorariumTimeOUT,
            officialServiceCreditTimeIN,
            officialServiceCreditTimeOUT,
            officialOverTimeIN,
            officialOverTimeOUT,
            breaktime
          )
          VALUES ?
          ON DUPLICATE KEY UPDATE
            officialTimeIN = VALUES(officialTimeIN),
            officialBreaktimeIN = VALUES(officialBreaktimeIN),
            officialBreaktimeOUT = VALUES(officialBreaktimeOUT),
            officialTimeOUT = VALUES(officialTimeOUT),
            officialHonorariumTimeIN = VALUES(officialHonorariumTimeIN),
            officialHonorariumTimeOUT = VALUES(officialHonorariumTimeOUT),
            officialServiceCreditTimeIN = VALUES(officialServiceCreditTimeIN),
            officialServiceCreditTimeOUT = VALUES(officialServiceCreditTimeOUT),
            officialOverTimeIN = VALUES(officialOverTimeIN),
            officialOverTimeOUT = VALUES(officialOverTimeOUT),
            breaktime = VALUES(breaktime)
        `;

        db.query(insertQuery, [values], (insertErr, insertResult) => {
          if (insertErr) {
            errors.push(`Error setting default official time for ${employeeID}: ${insertErr.message}`);
          } else {
            insertedCount += insertResult.affectedRows || 0;
          }
          processedCount++;
          callback();
        });
      });
    };

    // Process all users sequentially to avoid overwhelming the database
    let currentIndex = 0;
    const processNext = () => {
      if (currentIndex >= users.length) {
        try {
          logAudit(
            req.user,
            `Set default official time for ${processedCount} users (${insertedCount} records inserted)`,
            'Official Time',
            null,
            null
          );
        } catch (e) {
          console.error('Audit log error:', e);
        }

        res.json({
          message: 'Default official time set successfully',
          processed: processedCount,
          inserted: insertedCount,
          errors: errors.length > 0 ? errors : undefined,
        });
        return;
      }

      processUser(users[currentIndex], () => {
        currentIndex++;
        processNext();
      });
    };

    if (users.length === 0) {
      return res.json({
        message: 'No users found',
        processed: 0,
        inserted: 0,
      });
    }

    processNext();
  });
});

module.exports = router;




