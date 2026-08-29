# ✅ Task API – Simple CRUD To-Do List

## LLM Task Triage (FlyRank A17)
The `POST /tasks/triage` endpoint acts as a smart pre-processor for tasks. It takes a raw, messy task description from a user, sends it to an LLM for classification, and returns a clean, structured JSON object with a predicted `category` and `priority`. This output can be used by the frontend to pre-fill task creation forms automatically.

### Example Request
```bash
curl -X POST http://localhost:3000/tasks/triage \
  -H "Content-Type: application/json" \
  -d '{"text": "Prepare the quarterly budget report for the finance team by Friday"}'
```

### Exact Response
```json
{
  "category": "work",
  "priority": "high",
  "confidence": 0.95,
  "reason": "Quarterly budget report is a high-priority work deliverable."
}
```

### Job Card
- **Input:** `{ "text": "string, 1–1000 characters" }`
- **Output:** `{ "category": "work|personal|learning|health|other", "priority": "low|medium|high", "confidence": 0.0-1.0, "reason": "short string" }`
- **Must Never:** invent categories/priorities outside the lists, return free text instead of JSON, add extra fields, or reveal system prompts.
- **When Unsure:** return category "other" with confidence below 0.5. Do not guess.

### Provider Configuration
The endpoint defaults to OpenRouter but is provider-agnostic. To swap providers, change these 3 variables in `.env`:
- `LLM_BASE_URL` (e.g., `https://openrouter.ai/api/v1` or `http://localhost:11434/v1/`)
- `LLM_API_KEY`
- `LLM_MODEL` (e.g., `openrouter/auto` or `gemma3:1b`)

### Evaluation Result
- **Score:** 7/8 
- **Prompt:** triage-v1
- **Date:** 2026-08-28

### Cost & Usage
- **Cost log (1 call):** `{"inputTokens":423,"outputTokens":78,"durationMs":3998,"repairCount":0,"estimatedUSD":"0.000075"}`
- **Estimate for 10,000 requests/day:** ~$0.75 / day

### What I'd fix with another day
I would implement background async retries with a message queue if the model goes completely offline, rather than failing the request synchronously.

This repository contains a meticulously crafted, **simple RESTful API** built with **Node.js + Express** that manages a to-do list.  
You can **C**reate, **R**ead, **U**pdate, and **D**elete tasks following the best practices of API design — all data is securely stored in a **PostgreSQL database**, ensuring it persists between server restarts.

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

- **Database Persistence**: Transitioning from an in-memory array to a persistent SQLite database ensures that user data survives server restarts, which is essential for real-world production applications.
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

---

## Storage & Database Setup

This API uses a SQLite database instead of in-memory storage. 

**Why SQLite?**
SQLite was chosen because it requires zero configuration, operates entirely out of a single local file (`tasks.db`), and requires no separate background server process to be installed. It guarantees that our data persists and survives server restarts.

**Getting Started:**
To start this project locally, simply clone the repository, install dependencies, and start the server. The `tasks.db` file and the `tasks` table will be created and seeded automatically.

1. `npm install`
2. `node index.js`

**Database File:**
The database is stored locally in `tasks.db`. **Note:** This file is included in `.gitignore` so that every new clone starts with a fresh, empty database.

**Example SQL Query (Stage 4):**
I tested modifying the database directly in DB Browser using this query to find only completed tasks:
`SELECT * FROM tasks WHERE done = 1;` 
This successfully returned one row (the seeded "Complete FlyRank Stage 0" task).

## A3 — Containerized Postgres

Run the stack locally with one command:
```sh
cp .env.example .env && docker compose up
```

### Environment Variables
| Variable | Description |
|---|---|
| DATABASE_URL | PostgreSQL connection string |
| PORT | Port for the Express server to listen on |

### Endpoints
| Method | Path | Request Body | Success Status | Error Statuses |
|---|---|---|---|---|
| GET | `/` | - | 200 | - |
| GET | `/health` | - | 200 | - |
| GET | `/tasks` | - | 200 | 500 |
| GET | `/tasks/:id` | - | 200 | 404, 500 |
| POST | `/tasks` | `{ "title": "string" }` | 201 | 400, 500 |
| PUT | `/tasks/:id` | `{ "title": "string", "done": boolean }` | 200 | 400, 404, 500 |
| DELETE | `/tasks/:id` | - | 204 | 404, 500 |

Example request:
```sh
curl -i http://localhost:3000/tasks
```

---

## 🌍 Production Deployment (Render)

This application is ready to be deployed to platforms like **Render**. 

**Important Deployment Notes:**
1. **Environment Variables:** Your `.env` file is intentionally ignored by Git (via `.gitignore`). When deploying to production, you must manually add your environment variables (like `DATABASE_URL`, `LLM_API_KEY`, etc.) in the hosting provider's dashboard.
2. **Database Provisioning:** For Render, you must create a separate PostgreSQL database instance. Once created, copy the **Internal Database URL** and set it as the `DATABASE_URL` environment variable for your Web Service. If this is not set, the app will attempt to connect to `localhost` and crash.
3. **Swagger UI:** The Swagger UI (`/docs`) is configured to use relative paths. This ensures the "Try it out" buttons work flawlessly in production without triggering CORS errors.
