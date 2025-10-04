To-Do Full Stack App - User Manual

Version: 1.2.0

Overview
--------
This To-Do Full Stack App includes a front-end single-page portfolio with an integrated To-Do list, calendar, and a small DSA visualizer. The backend is a simple Express.js API using SQLite for persistence. This manual explains how to run the app, use the features, and resolve common issues.

Contents
--------
1. Quick start (development)
2. Front-end usage (how to add tasks, categories, filters, sorting)
3. Backend API (endpoints and payloads)
4. Troubleshooting
5. Maintenance & data

1) Quick start (development)
----------------------------
Requirements
- Node.js (v14+ recommended)
- npm
- A modern browser (Chrome, Edge, Firefox)

Running the backend
1. Open a terminal and change to the backend folder:
   cd c:\Users\Arshath Prabhu\OneDrive\Desktop\ToDo-list\backend
2. Install dependencies (only once):
   npm install
3. Start the server in development mode (nodemon) or production:
   npm run dev   # uses nodemon
   # or
   npm start

The server listens on port 3000 by default. If the app cannot reach the backend, try opening:
http://127.0.0.1:3000/health

Running the front-end
- Open `index.html` in your browser (served using Live Server on port 5501 or file://). For best results use a static file server:
  python -m http.server 5501
  then open http://127.0.0.1:5501

2) Front-end usage
------------------
Add a task
- Open the To-Do section in the page.
- Enter the task text in the "New task..." input.
- Optionally choose a priority, a due date, and type a category.
- Click Add Task. The task will be sent to the backend and appear in the list.

Custom categories
- Type a custom category in the category input when creating a task. The app saves it and the category filter will be updated automatically.

Filtering & Sorting
- Use the priority and category filters to narrow the visible tasks.
- Use Sort by Priority / Date / Category buttons to reorder tasks.

3) Backend API (summary)
------------------------
Base URL: http://127.0.0.1:3000/todos

GET /todos?date=YYYY-MM-DD
- Returns array of todos for the specified date.

POST /todos
- Body (JSON): { text, date (YYYY-MM-DD), priority (high|medium|low), dueDate (YYYY-MM-DD|null), category }
- Returns the created todo (201)

PUT /todos/:id
- Body: any updatable fields, e.g. { text } or { completed: true }

DELETE /todos/:id
- Deletes the specified todo

4) Troubleshooting
------------------
Problem: "ERR_CONNECTION_REFUSED" when adding tasks from browser
- Ensure backend is running and listening on 127.0.0.1:3000.
- Start backend: `npm run dev` in `backend/`.
- If PowerShell's Invoke-RestMethod can't reach the server but the server log shows requests, try using curl.exe or test from the browser at http://127.0.0.1:3000/health.
- If you still can't connect, check Windows Firewall and allow `node.exe` or open port 3000 for localhost.

Problem: Category not updating / only "Personal" appears
- The frontend collects the category from the input `#category-input` and sends it to the backend.
- The backend inserts category into the database and the frontend refreshes category filter options from the returned list.
- If custom categories aren't showing, ensure your frontend isn't being served from a different origin and that the backend /todos returns the category field.

5) Maintenance & data
---------------------
- Database: `backend/todos.db` (SQLite). You can inspect it with a SQLite viewer.
- To reset data: stop the backend, delete `backend/todos.db`, then restart the server to re-create the table.

Contact & Support
-----------------
If you provide the exact console/network error, I can help debug further.
