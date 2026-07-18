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
    const { id1, title, status } = req.body;
    if (!id1 || !title || !status) {
        return res.status(400).json({ error: 'id1, title, and status are required' });
    }
    const newTask = { id1, title, status };
    tasks.push(newTask);
    res.status(201).json(newTask);
});

// Read details from task1
app.get('/tasks1/:id1', (req, res) => {
    const task = tasks.find(t => t.id1 === req.params.id1);
    if (!task) {
        return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
});

// Read all tasks (helpful for testing)
app.get('/tasks1', (req, res) => {
    res.json(tasks);
});

// Update a task (title, status)
app.put('/tasks1/:id1', (req, res) => {
    const task = tasks.find(t => t.id1 === req.params.id1);
    if (!task) {
        return res.status(404).json({ error: 'Task not found' });
    }
    const { title, status } = req.body;
    if (title !== undefined) task.title = title;
    if (status !== undefined) task.status = status;
    res.json(task);
});

// Delete a task
app.delete('/tasks1/:id1', (req, res) => {
    const taskIndex = tasks.findIndex(t => t.id1 === req.params.id1);
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
