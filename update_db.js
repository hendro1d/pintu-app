const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'pintu_db'
  });
  
  await conn.execute("UPDATE apps SET logo_url = REPLACE(logo_url, '/uploads/', '/api/uploads/') WHERE logo_url LIKE '%/uploads/%'");
  await conn.execute("UPDATE apps SET screenshot_url = REPLACE(screenshot_url, '/uploads/', '/api/uploads/') WHERE screenshot_url LIKE '%/uploads/%'");
  
  console.log('Database updated successfully');
  process.exit(0);
}

run();
