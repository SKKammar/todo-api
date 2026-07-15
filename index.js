// ============================================================
// DEPENDENCIES
// ============================================================
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./openapi.json');

const app = express();
const port = 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// ============================================================
// STAGE 0 & 1: Hello server + Root & Health endpoints
// ============================================================

// GET /  – describes the API
app.get('/', (req, res) => {
  res.json({
    name: 'Task API',
    version: '1.0',
    endpoints: ['/tasks']
  });
});

// GET /health – health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ============================================================
// STAGE 2: In-memory "database" + Read endpoints
// ============================================================

// Pre-filled tasks (our "database")
let tasks = [
  { id: 1, title: 'Learn Node.js', done: false },
  { id: 2, title: 'Build a CRUD API', done: false },
  { id: 3, title: 'Write README', done: true }
];
let nextId = 4; // auto-increment ID for new tasks

// GET /tasks – list all tasks
app.get('/tasks', (req, res) => {
  res.json(tasks);
});

// GET /tasks/:id – get a single task by ID
app.get('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const task = tasks.find(t => t.id === id);
  if (!task) {
    return res.status(404).json({ error: `Task ${id} not found` });
  }
  res.json(task);
});

// ============================================================
// STAGE 3: Create (POST) with validation
// ============================================================

// POST /tasks – create a new task
app.post('/tasks', (req, res) => {
  const { title } = req.body;

  // Validation: title must be a non-empty string
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({
      error: 'Title is required and must be a non-empty string'
    });
  }

  const newTask = {
    id: nextId++,
    title: title.trim(),
    done: false
  };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// ============================================================
// STAGE 4: Update (PUT) & Delete (DELETE)
// ============================================================

// PUT /tasks/:id – replace title and/or done status
app.put('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const task = tasks.find(t => t.id === id);
  if (!task) {
    return res.status(404).json({ error: `Task ${id} not found` });
  }

  const { title, done } = req.body;

  // Validate title if provided
  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({
        error: 'Title must be a non-empty string'
      });
    }
    task.title = title.trim();
  }

  // Validate done if provided
  if (done !== undefined) {
    if (typeof done !== 'boolean') {
      return res.status(400).json({
        error: 'Done must be a boolean (true or false)'
      });
    }
    task.done = done;
  }

  res.json(task);
});

// DELETE /tasks/:id – remove a task
app.delete('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) {
    return res.status(404).json({ error: `Task ${id} not found` });
  }

  tasks.splice(index, 1);
  res.status(204).send(); // No Content – empty body
});

// ============================================================
// STAGE 5: Swagger UI at /docs
// ============================================================

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ============================================================
// START THE SERVER
// ============================================================

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
  console.log(`📖 Swagger UI available at http://localhost:${port}/docs`);
});
