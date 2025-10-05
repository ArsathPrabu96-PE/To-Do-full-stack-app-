Release notes
---------------------

- 1.2.4 — Offline resilience, calendar indicators, visual polish, and docs (2025-10-06)

What's new in 1.2.4
-------------------
- Offline resilience and sync improvements:
  - The frontend now detects offline/online state and shows a Connection indicator in the header. When the app cannot reach the backend it displays an actionable message with a Retry button and populates demo todos so the UI remains interactive.
  - Requests to the backend use a short timeout to avoid long hanging requests when offline. Offline-created todos are saved in localStorage under the key `offline_todos` and are synced automatically when connectivity is restored or when the user clicks Retry.
  - The sync logic is robust: only items that successfully POST to the server are removed from the local offline queue. Partial failures are preserved for later retry.

- Calendar visual indicators and background glow:
  - The calendar now marks dates that have tasks using color-coded badges. Badges reflect task counts (low/medium/high density) and are visible in the calendar view and legend.
  - A subtle animated background glow was added to improve contrast and modernize the visual feel. This is purely cosmetic and can be disabled by overriding the `.app-glow` / `body::before` styles in `style.css`.

- UI polish and accessibility fixes:
  - Buttons received animated ripple and hover states; the Retry button is keyboard-focusable and includes ARIA labels for screen readers.
  - Fixed a frontend ReferenceError around `formattedDate` when saving offline tasks so offline flows no longer throw exceptions.

- Testing & developer tools:
  - Added an end-to-end offline->sync Puppeteer script (`scripts/e2e-offline-sync.test.js`) and a simple static server (`scripts/start-static-server.js`) to reproduce the offline flow locally.
  - A mock backend script (`scripts/mock-backend.js`) can be used by the E2E test to simulate coming back online.

- 1.2.3 — UI polish, chatbot LLM proxy, rate limiting, and tests (2025-10-05)
- 1.2.2 — Docs reorganized and version sync (2025-10-05)

giTo-Do Full Stack App - User Manual

Version: 1.2.4

Quick start (development)
-------------------------
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
- For development use the included static server helper and the E2E script, or serve `index.html` with any static server.
- Quick: from project root run the Node static server (requires Node installed):
  node scripts\start-static-server.js 8082
  then open http://127.0.0.1:8082

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
6. E2E & developer tools

2) Front-end usage
------------------
Add a task
- Open the To-Do section in the page.
- Enter the task text in the "New task..." input.
- Optionally choose a priority, a due date, and type a category.
- Click Add Task. If you're online the task will be sent to the backend and appear in the list. If you're offline it will be saved locally and synced when connectivity is restored.

Offline tips
- When offline the header will show "Disconnected". The app populates demo todos to keep the UI usable.
- Create tasks while offline — they will be saved to localStorage under `offline_todos` with the payload shape matching the server POST. Click Retry when connectivity is restored to attempt sync.

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

6) E2E & developer tools
------------------------
- Reproduce offline->sync flow locally:
  1. From the repository root start the static server (port 8082):
     node scripts\start-static-server.js 8082
  2. Open a separate terminal and (optionally) start the real backend: `cd backend && npm install && npm run start`.
     If you'd rather use the mock backend that the E2E script uses, skip starting the real backend.
  3. Run the Puppeteer test to simulate adding an offline todo and coming back online:
     node scripts\e2e-offline-sync.test.js
  4. The test will start a browser, simulate offline/online behavior, add a todo while offline, start the mock backend, click Retry and assert the offline todo was synced.

Contact & Support
-----------------
If you provide the exact console/network error, I can help debug further.

7) Authentication (signup / login / logout)
-----------------------------------------
- Signup: Open `signup.html` and fill in email and password. The page performs a client-side password strength check and shows a 3D spinner while the request is processed. On success the page redirects to `login.html`.
- Login: Open `login.html`, enter your credentials and log in. On successful login a JWT token is saved to `localStorage` and you'll be redirected to the main page. The header shows your email and a Logout button when logged in.
- Logout: Click the Logout button in the top-right header to clear the token and return to the login page.

Notes:
- Password resets / forgot-password is a UI placeholder that currently prompts for an email; implementing a secure reset flow requires a backend email/send mechanism which is not included by default.
