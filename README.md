# To-Do Full Stack App

Version: 1.2.4

A responsive full-stack To-Do application with offline-first features, a calendar view with colored indicators, and a subtle animated background glow for a modern UX.

This repository contains a lightweight Express backend (SQLite) and a vanilla JavaScript frontend. Key features include:

- Offline persistence: add tasks while offline; tasks are stored in localStorage under `offline_todos` and synced when the backend is available.
- Robust offline sync: health checks with backoff, inline Retry UI, and per-session sync of offline items.
- Calendar indicators: the Calendar shows per-day task counts and uses soft colored glows to indicate low/medium/high task density.
- Background glow: subtle animated radial glow overlay for improved visual polish.
- AI chatbot proxy (optional): server-side proxy to OpenAI (disabled unless `OPENAI_API_KEY` is set).

See `USER_MANUAL.md` for detailed instructions on running the app, offline behavior, and the calendar UI.

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

E2E / Offline sync (how to run)
-------------------------------
A short workflow to reproduce the offline->sync flow locally using the included scripts:

1. From the repository root start the static server (serves the built front-end):

```powershell
node scripts\start-static-server.js 8082
# then open http://127.0.0.1:8082
```

2. In a separate terminal you can optionally start the real backend (or skip and let the E2E test start the mock backend):

```powershell
cd backend
npm install
npm run start
```

3. Run the Puppeteer E2E test which simulates going offline, adding a todo, starting the mock backend, clicking Retry, and asserting the offline todo was synced:

```powershell
node scripts\e2e-offline-sync.test.js
```

The E2E script will print test progress to the console. If you prefer to step through the flow manually, open the static server URL, toggle your network (or stop the backend), create a todo while disconnected, then bring the backend back and click Retry in the header.

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
