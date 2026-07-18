# ✅ Task API – Near Perfect CRUD To-Do List

This repository contains a meticulously crafted, **near-perfect RESTful API** built with **Node.js + Express** that manages a to-do list.  
You can **C**reate, **R**ead, **U**pdate, and **D**elete tasks following the best practices of API design — all data is kept in memory (no database, so it resets when the server restarts).

---

## 🚀 Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/your-username/todo-api.git
cd todo-api

# 2. Install dependencies
npm install

# 3. Start the server
npm start
```

The server runs at **http://localhost:3000**  
Swagger UI (interactive docs) at **http://localhost:3000/docs**

---

## 📋 Endpoints

| Method | Path           | Description                         | Status Codes                |
| :----- | :------------- | :---------------------------------- | :-------------------------- |
| GET    | `/`            | API information                     | 200                         |
| GET    | `/health`      | Health check                        | 200                         |
| GET    | `/tasks`       | List all tasks                      | 200                         |
| GET    | `/tasks/:id`   | Get a single task by ID             | 200, 404                    |
| POST   | `/tasks`       | Create a new task                   | 201, 400                    |
| PUT    | `/tasks/:id`   | Update a task (title and/or done)   | 200, 400, 404               |
| DELETE | `/tasks/:id`   | Delete a task                       | 204, 404                    |

---

## 🤖 AI Remake

This repository also includes an `AI remake` folder. Unlike the rigorously coded main API, this alternative version was created entirely using **simple conversational prompts** based on my understanding and an **AI tool**. It demonstrates how a functional API can be rapidly scaffolded using artificial intelligence.

### Quick Start for AI Remake

```bash
cd "AI remake"
npm install
node aiindex.js
```

The Swagger UI for the AI Remake is available at **http://localhost:3000/api-docs**.

### Endpoints (AI Remake)

| Method | Path           | Description                         | Status Codes                |
| :----- | :------------- | :---------------------------------- | :-------------------------- |
| GET    | `/task`        | List all tasks                      | 200                         |
| GET    | `/task/:id`    | Get a single task by ID             | 200, 404                    |
| POST   | `/task`        | Create a new task                   | 201, 400, 409               |
| PUT    | `/task/:id`    | Update a task (title, status)       | 200, 400, 404               |
| DELETE | `/task/:id`    | Delete a task                       | 204, 404                    |

---

## 🧪 Example `curl` Commands

### Create a task
```bash
curl -i -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy milk"}'
```
**Response:** `201 Created` with the new task.

### Get all tasks
```bash
curl -i http://localhost:3000/tasks
```

### Get a specific task
```bash
curl -i http://localhost:3000/tasks/1
```

### Update a task
```bash
curl -i -X PUT http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"done": true}'
```

### Delete a task
```bash
curl -i -X DELETE http://localhost:3000/tasks/1
```

---

## 🖥️ Swagger UI Screenshot

![Swagger UI Screenshot](./assets/swagger-screenshot.png)

---

## 🧠 Lessons Learned

- **Contrasting Development Approaches**: Building an API meticulously by hand ensures a deep understanding of core principles, while using AI tools can rapidly scaffold functional prototypes. Both approaches offer immense value in modern development.
- **In-memory Storage Limits**: Managing data using a simple array is great for learning and prototyping, but it highlights the ephemeral nature of data—since it resets when the server restarts, a persistent database is essential for production environments.
- **Strict Data Validation**: The server must never implicitly trust client input. Enforcing strict type checks (e.g., verifying `id` is a number, `status` is a boolean) prevents bugs and ensures robust, reliable endpoints.
- **API Documentation**: Whether writing an OpenAPI specification by hand or utilizing tools to generate a `swagger.json`, maintaining clear documentation is critical for defining the API's contract and facilitating easy testing via Swagger UI.

---

## 🔧 Technologies Used

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [Swagger UI Express](https://www.npmjs.com/package/swagger-ui-express)

---

## 📦 Author

Santosh – [SKKammar](https://github.com/SKKammar)
