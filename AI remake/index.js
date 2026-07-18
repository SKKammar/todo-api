const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const app = express();
app.use(express.json());

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

let tasks = [];

// Create a task
app.post('/tasks1', (req, res) => {
    const { id, title, status } = req.body;
    if (id === undefined || title === undefined || status === undefined) {
        return res.status(400).json({ error: 'id, title, and status are required' });
    }
    if (typeof status !== 'boolean') {
        return res.status(400).json({ error: 'status must be a boolean' });
    }
    if (typeof title !== 'string') {
        return res.status(400).json({ error: 'title must be a string' });
    }
    // Check for primary key constraint (id must be unique)
    if (tasks.find(t => t.id === id)) {
        return res.status(409).json({ error: 'Task with this id already exists' });
    }
    
    const newTask = { id, title, status };
    tasks.push(newTask);
    res.status(201).json(newTask);
});

// Read details from a task
app.get('/tasks1/:id', (req, res) => {
    // using loose equality in case id is sent as a string in params but stored as a number
    const task = tasks.find(t => t.id == req.params.id);
    if (!task) {
        return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
});

// Read all tasks
app.get('/tasks1', (req, res) => {
    res.json(tasks);
});

// Update a task (title, status)
app.put('/tasks1/:id', (req, res) => {
    const task = tasks.find(t => t.id == req.params.id);
    if (!task) {
        return res.status(404).json({ error: 'Task not found' });
    }
    
    const { title, status } = req.body;
    if (title !== undefined) {
        if (typeof title !== 'string') {
            return res.status(400).json({ error: 'title must be a string' });
        }
        task.title = title;
    }
    if (status !== undefined) {
        if (typeof status !== 'boolean') {
            return res.status(400).json({ error: 'status must be a boolean' });
        }
        task.status = status;
    }
    res.json(task);
});

// Delete a task
app.delete('/tasks1/:id', (req, res) => {
    const taskIndex = tasks.findIndex(t => t.id == req.params.id);
    if (taskIndex === -1) {
        return res.status(404).json({ error: 'Task not found' });
    }
    tasks.splice(taskIndex, 1);
    res.status(204).send();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Swagger UI is available at http://localhost:${PORT}/api-docs`);
});
