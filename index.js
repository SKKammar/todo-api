const express = require('express');
const Database = require('better-sqlite3');

const app = express();
app.use(express.json());

// ==========================================
// STAGE 0: Create database & seed data
// ==========================================
const db = new Database('tasks.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0
  )
`);

const checkEmpty = db.prepare('SELECT COUNT(*) AS count FROM tasks').get();

if (checkEmpty.count === 0) {
  const insertTask = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
  insertTask.run('Buy groceries', 0);
  insertTask.run('Complete FlyRank Stage 0', 1);
  insertTask.run('Read up on SQL injection', 0);
  console.log('Seeded database with 3 example tasks.');
}

// ==========================================
// STAGE 1: Read from the database
// ==========================================
app.get('/tasks', (req, res) => {
  const tasks = db.prepare('SELECT * FROM tasks').all();
  res.status(200).json(tasks);
});

app.get('/tasks/:id', (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  res.status(200).json(task);
});

// ==========================================
// STAGE 2: Create new tasks
// ==========================================
app.post('/tasks', (req, res) => {
  const { title } = req.body;
  
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required and must be a non-empty string' });
  }

  // Insert the task and get the metadata (like the newly generated ID)
  const info = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)').run(title, 0);
  
  // Fetch the newly created task to return it
  const newTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(info.lastInsertRowid);
  
  res.status(201).json(newTask);
});

// ==========================================
// STAGE 3: Update and delete
// ==========================================
app.put('/tasks/:id', (req, res) => {
  const { title, done } = req.body;
  
  // Basic validation
  if (!title || typeof title !== 'string' || title.trim() === '' || typeof done !== 'boolean') {
    return res.status(400).json({ error: 'Invalid body' });
  }

  // Convert boolean to 1 or 0 for SQLite
  const doneInt = done ? 1 : 0;
  
  const info = db.prepare('UPDATE tasks SET title = ?, done = ? WHERE id = ?').run(title, doneInt, req.params.id);
  
  // info.changes tells us how many rows were updated. If 0, the ID didn't exist.
  if (info.changes === 0) {
    return res.status(404).json({ error: 'Task not found' });
  }

  // Fetch the updated task to return it
  const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  res.status(200).json(updatedTask);
});

app.delete('/tasks/:id', (req, res) => {
  const info = db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  
  if (info.changes === 0) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  res.status(204).send();
});

// ==========================================
// Server Initialization
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
