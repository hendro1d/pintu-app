const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'pintu_db'
  });
  
  const [rows] = await conn.execute('SELECT id, name, logo_url, screenshot_url FROM apps');
  console.log(JSON.stringify(rows, null, 2));
  process.exit(0);
}

run();
