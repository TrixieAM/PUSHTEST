// Migration script to add 'technical' role to users table
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('../db');
const fs = require('fs');
const path = require('path');

const sqlFile = path.join(__dirname, 'add_technical_role.sql');
const sql = fs.readFileSync(sqlFile, 'utf8');

db.query(sql, (err, result) => {
  if (err) {
    console.error('Error adding technical role:', err);
    process.exit(1);
  }
  
  console.log('✅ Successfully added technical role to users table');
  console.log('Result:', result);
  process.exit(0);
});
