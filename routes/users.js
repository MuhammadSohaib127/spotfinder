const express = require('express');
const router = express.Router();
const sql = require('mssql');
require('dotenv').config();

const config = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  server: process.env.SQL_SERVER,
  database: process.env.SQL_DATABASE,
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

// POST /users/register - register a new user
router.post('/register', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const { name, email, password } = req.body;
    await pool.request()
      .input('name', sql.VarChar, name)
      .input('email', sql.VarChar, email)
      .input('password', sql.VarChar, password)
      .query(`INSERT INTO Users (Name, Email, PasswordHash, CreatedAt, IsActive)
              VALUES (@name, @email, @password, GETDATE(), 1)`);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /users - get all users
router.get('/', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT UserID, Name, Email, CreatedAt, IsActive FROM Users');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;