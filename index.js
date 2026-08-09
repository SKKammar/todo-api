const express = require('express');
const Database = require('better-sqlite3');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');

const app = express();
app.use(express.json());

try {
  const openapiDocument = JSON.parse(fs.readFileSync('./openapi.json', 'utf8'));
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));
} catch (err) {
  console.error("Failed to load openapi.json for Swagger UI:", err.message);
}

app.get('/', (req, res) => {
  res.status(200).json({
    name: "Task API",
    version: "1.0.0",
    endpoints: [
      "GET /",
      "GET /health",
      "GET /tasks",
      "GET /tasks/:id",
      "POST /tasks",
      "PUT /tasks/:id",
      "DELETE /tasks/:id"
    ]
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: "OK" });
});

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

app.get('/tasks', (req, res) => {
  const tasks = db.prepare('SELECT * FROM tasks').all();
  res.status(200).json(tasks.map(t => ({ ...t, done: !!t.done })));
});

app.get('/tasks/:id', (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  res.status(200).json({ ...task, done: !!task.done });
});

app.post('/tasks', (req, res) => {
  const { title } = req.body;
  
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required and must be a non-empty string' });
  }

  const info = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)').run(title, 0);
  const newTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(info.lastInsertRowid);
  
  res.status(201).json({ ...newTask, done: !!newTask.done });
});

app.put('/tasks/:id', (req, res) => {
  const { title, done } = req.body;
  
  if (title === undefined && done === undefined) {
    return res.status(400).json({ error: 'Invalid body' });
  }

  const existingTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  
  if (!existingTask) {
    return res.status(404).json({ error: 'Task not found' });
  }

  let newTitle = existingTask.title;
  let newDone = existingTask.done;

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Title must be a non-empty string' });
    }
    newTitle = title.trim();
  }

  if (done !== undefined) {
    if (typeof done !== 'boolean') {
      return res.status(400).json({ error: 'Done must be a boolean' });
    }
    newDone = done ? 1 : 0;
  }

  db.prepare('UPDATE tasks SET title = ?, done = ? WHERE id = ?').run(newTitle, newDone, req.params.id);
  
  const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  res.status(200).json({ ...updatedTask, done: !!updatedTask.done });
});

app.delete('/tasks/:id', (req, res) => {
  const info = db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  
  if (info.changes === 0) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  res.status(204).send();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
