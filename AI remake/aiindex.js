const express = require('express');
const Database = require('better-sqlite3');

const app = express();
app.use(express.json());

// 1. Create a database file named tasks.db
const db = new Database('tasks.db');

// 2. Create a table named tasks if it does not already exist
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0
  )
`);

// 3. Seed exactly three example tasks if the table is completely empty
const countStmt = db.prepare('SELECT COUNT(*) AS count FROM tasks');
const countResult = countStmt.get();

if (countResult.count === 0) {
  const insertStmt = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
  insertStmt.run('Buy groceries', 0);
  insertStmt.run('Walk the dog', 0);
  insertStmt.run('Learn SQLite', 1);
}

// GET /tasks
app.get('/tasks', (req, res) => {
  const tasks = db.prepare('SELECT * FROM tasks').all();
  res.status(200).json(tasks);
});

// GET /tasks/:id
app.get('/tasks/:id', (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }
  res.status(200).json(task);
});

// POST /tasks
app.post('/tasks', (req, res) => {
  const { title } = req.body;
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: "Title is required and cannot be empty" });
  }
  
  const insertStmt = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
  const info = insertStmt.run(title.trim(), 0);
  
  const newTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(newTask);
});

// PUT /tasks/:id
app.put('/tasks/:id', (req, res) => {
  const { title, done } = req.body;
  
  if (title === undefined && done === undefined) {
    return res.status(400).json({ error: "Invalid body" });
  }
  
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  
  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }
  
  const newTitle = title !== undefined ? title : task.title;
  let newDone = task.done;
  
  if (done !== undefined) {
    if (typeof done === 'boolean') {
      newDone = done ? 1 : 0;
    } else if (typeof done === 'number' && (done === 0 || done === 1)) {
      newDone = done;
    } else {
      return res.status(400).json({ error: "Done must be a boolean or 0/1" });
    }
  }
  
  if (title !== undefined) {
    if (typeof newTitle !== 'string' || newTitle.trim() === '') {
      return res.status(400).json({ error: "Title must be a non-empty string" });
    }
  }
  
  const updateStmt = db.prepare('UPDATE tasks SET title = ?, done = ? WHERE id = ?');
  updateStmt.run(newTitle.trim(), newDone, req.params.id);
  
  const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  res.status(200).json(updatedTask);
});

// DELETE /tasks/:id
app.delete('/tasks/:id', (req, res) => {
  const deleteStmt = db.prepare('DELETE FROM tasks WHERE id = ?');
  const info = deleteStmt.run(req.params.id);
  
  if (info.changes === 0) {
    return res.status(404).json({ error: "Task not found" });
  }
  
  res.status(204).send();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
