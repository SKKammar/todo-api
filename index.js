require('dotenv').config();
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const { pool, init } = require('./db');

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

app.get('/tasks', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM tasks');
    res.status(200).json(rows.map(t => ({ ...t, done: !!t.done })));
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/tasks/:id', async (req, res) => {
  if (!/^\d+$/.test(req.params.id)) return res.status(404).json({ error: 'Task not found' });

  try {
    const { rows } = await pool.query('SELECT * FROM tasks WHERE id = $1', [req.params.id]);
    const task = rows[0];
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.status(200).json({ ...task, done: !!task.done });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/tasks', async (req, res) => {
  const { title } = req.body;
  
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required and must be a non-empty string' });
  }

  try {
    const { rows } = await pool.query(
      'INSERT INTO tasks (title, done) VALUES ($1, $2) RETURNING *', 
      [title, false]
    );
    const newTask = rows[0];
    
    res.status(201).json({ ...newTask, done: !!newTask.done });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.put('/tasks/:id', async (req, res) => {
  if (!/^\d+$/.test(req.params.id)) return res.status(404).json({ error: 'Task not found' });

  const { title, done } = req.body;
  
  if (title === undefined && done === undefined) {
    return res.status(400).json({ error: 'Invalid body' });
  }

  try {
    const { rows: existingRows } = await pool.query('SELECT * FROM tasks WHERE id = $1', [req.params.id]);
    const existingTask = existingRows[0];
    
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
      newDone = done;
    }

    const { rows: updatedRows } = await pool.query(
      'UPDATE tasks SET title = $1, done = $2 WHERE id = $3 RETURNING *',
      [newTitle, newDone, req.params.id]
    );
    
    const updatedTask = updatedRows[0];
    res.status(200).json({ ...updatedTask, done: !!updatedTask.done });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.delete('/tasks/:id', async (req, res) => {
  if (!/^\d+$/.test(req.params.id)) return res.status(404).json({ error: 'Task not found' });

  try {
    const { rowCount } = await pool.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
    
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

const PORT = process.env.PORT || 3000;
init()
  .then(() => app.listen(PORT, () => console.log(`Server is running on port ${PORT}`)))
  .catch(err => { 
    console.error('DB init failed:', err); 
    process.exit(1); 
  });
