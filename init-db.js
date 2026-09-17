const mysql = require('mysql2/promise');

async function initializeDB() {
  console.log('Connecting to MySQL...');
  
  try {
    // 1. Connect without database to create the database if it doesn't exist
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '', // default XAMPP password is empty
      port: 3306
    });

    console.log('Creating database pintu_db if not exists...');
    await connection.query('CREATE DATABASE IF NOT EXISTS pintu_db;');
    
    console.log('Using pintu_db...');
    await connection.query('USE pintu_db;');

    console.log('Creating table apps if not exists...');
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS apps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        url VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        logo_url VARCHAR(255),
        screenshot_url VARCHAR(255),
        status VARCHAR(50) DEFAULT 'UNKNOWN',
        latency INT DEFAULT 0,
        last_checked DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await connection.query(createTableQuery);

    console.log('Database and table initialization completed successfully.');
    await connection.end();
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}

initializeDB();
