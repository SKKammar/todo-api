require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function init(retries = 5) {
  while (retries) {
    try {
      await pool.query('SELECT 1'); // test connection
      break;
    } catch (err) {
      retries -= 1;
      console.log(`Database not ready, retrying... (${retries} attempts left)`);
      if (retries === 0) throw err;
      await new Promise(res => setTimeout(res, 2000));
    }
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      done BOOLEAN NOT NULL DEFAULT false
    )
  `);

  const { rows } = await pool.query('SELECT COUNT(*) AS count FROM tasks');
  const count = parseInt(rows[0].count, 10);

  if (count === 0) {
    await pool.query(`
      INSERT INTO tasks (title, done) 
      VALUES 
        ('Buy groceries', false),
        ('Complete FlyRank Stage 0', true),
        ('Read up on SQL injection', false)
    `);
    console.log('Seeded database with 3 example tasks.');
  }

  console.log('Database ready.');
}

module.exports = { pool, init };
