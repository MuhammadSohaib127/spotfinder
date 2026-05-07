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

async function setup() {
  try {
    console.log('Connecting to Azure SQL...');
    const pool = await sql.connect(config);
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
      CREATE TABLE Users (
        UserID INT PRIMARY KEY IDENTITY(1,1),
        Name VARCHAR(100),
        Email VARCHAR(200),
        PasswordHash VARCHAR(255),
        CreatedAt DATETIME,
        IsActive BIT
      )
    `);
    console.log('Users table created successfully!');
    await sql.close();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

setup();