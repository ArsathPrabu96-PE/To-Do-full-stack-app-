# To-Do Full Stack App

Version: 1.2.0

This repository contains a personal portfolio front-end with an integrated To-Do app and a minimal Express + SQLite backend.

Quick start
-----------
1. Backend:
   ```powershell
   cd backend
   npm install
   npm run dev
   ```
2. Frontend:
   - Open `index.html` in a browser, or serve with a simple static server:
     ```powershell
     python -m http.server 5501
     ```
     then open `http://127.0.0.1:5501`.

Files of interest
- `index.html` – main front-end UI
- `style.css` – styles
- `js/modules/todo-app.js` – To-Do frontend logic
- `backend/server.js` – Express API server
- `backend/todos.db` – SQLite database file
- `USER_MANUAL.md` – detailed usage and troubleshooting
- `VERSION` – project version

If you run into connection issues, try `http://127.0.0.1:3000/health` to verify the backend is running.

License: MIT
