import 'dotenv/config';
import Database from 'better-sqlite3';

const db = new Database('tasks.db');

const pool = {
  query: async (sql, params = []) => {
    const sqliteSql = sql.replace(/\$\d+/g, '?');
    const mappedParams = params.map(p => typeof p === 'boolean' ? (p ? 1 : 0) : p);
    
    const stmt = db.prepare(sqliteSql);
    
    if (sqliteSql.trim().toUpperCase().startsWith('SELECT') || sqliteSql.trim().toUpperCase().includes('RETURNING')) {
      const rows = stmt.all(...mappedParams);
      const mappedRows = rows.map(row => {
        if ('done' in row) return { ...row, done: !!row.done };
        return row;
      });
      return { rows: mappedRows, rowCount: mappedRows.length };
    } else {
      const info = stmt.run(...mappedParams);
      return { rows: [], rowCount: info.changes };
    }
  }
};

async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      done INTEGER NOT NULL DEFAULT 0
    )
  `);

  const { rows } = await pool.query('SELECT COUNT(*) AS count FROM tasks');
  const count = parseInt(rows[0].count, 10);

  if (count === 0) {
    await pool.query(`
      INSERT INTO tasks (title, done) 
      VALUES 
        ('Buy groceries', 0),
        ('Complete FlyRank Stage 0', 1),
        ('Read up on SQL injection', 0)
    `);
    console.log('Seeded database with 3 example tasks.');
  }

  console.log('Database ready (using SQLite).');
}

export { pool, init };
