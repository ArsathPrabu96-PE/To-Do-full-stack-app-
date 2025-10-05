# To-Do Full Stack App

Version: 1.2.3

Overview
--------
A personal portfolio front-end with an integrated To-Do application and a minimal Express + SQLite backend. This repository contains the front-end UI, helper modules (calendar, todo), and a small server providing CRUD APIs and basic authentication (signup/login with JWT).

Quick start (recommended)
-------------------------
1) Backend (development)

```powershell
cd backend
npm install
npm run dev
```

2) Frontend (serve static files)

Open `index.html` in your browser, or serve the repository root with a static server for best results:

```powershell
python -m http.server 5501
# then open http://127.0.0.1:5501
```

Files of interest
- `index.html` – main front-end UI
- `style.css` – styles
- `js/modules/todo-app.js` – To-Do frontend logic
- `js/modules/auth.js` – Signup/login UI handlers
- `backend/server.js` – Express API server
- `backend/todos.db` – SQLite database file
- `USER_MANUAL.md` – full usage guide and troubleshooting (see below)
- `VERSION` – project version

Authentication (short)
----------------------
- Signup: `signup.html` performs a password strength check and redirects to `login.html` on success.
- Login: `login.html` stores a JWT token in `localStorage` on successful login. The main page header shows the logged-in email and a Logout button.

- Release notes (brief)
- ---------------------
- 1.2.3 — UI polish, chatbot LLM proxy, rate limiting, and tests (2025-10-05)

What's new in 1.2.3
-------------------
- Chatbot LLM proxy: The in-page chatbot now proxies messages to a server-side `/api/chat` endpoint. When `OPENAI_API_KEY` is set on the backend the server forwards messages to OpenAI and returns model replies. If no key is present the widget falls back to a local demo responder.
- Rate limiting: The `/api/chat` endpoint is protected by express-rate-limit to prevent abuse (configurable via `CHAT_RATE_LIMIT`).
- Tests: Added a unit/integration test that mocks the OpenAI API (using `nock`) so CI can run without secrets.
- UI polish: Improved todo-list visuals, added a Floating Add Button (FAB) to quickly focus the input, and slide-in/out animations for adding/removing tasks.
- Offline friendly: Frontend now shows demo todos and a clear actionable message when the backend is unreachable, so the UI remains usable for demos.

- 1.2.0 — Documentation rearranged and version bump.
- 1.2.1 — Added authentication (signup/login), logout UI, and improved error handling.

Full manual
-----------
For detailed instructions, troubleshooting steps, and the full API reference see `USER_MANUAL.md` in the repository root.

If you run into connection issues, first verify the backend health endpoint:

http://127.0.0.1:3000/health

License: MIT
