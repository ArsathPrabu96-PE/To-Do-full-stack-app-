// Minimal mock backend to accept health checks and todo posts for E2E testing
const http = require('http');
const PORT = 3000;
let todos = [];
let idCounter = 1;

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'GET' && url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  if (req.method === 'GET' && url === '/todos') {
    // optionally accept ?_probe=1
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ todos }));
    return;
  }

  if (req.method === 'POST' && url === '/todos') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const todo = {
          id: idCounter++,
          text: payload.text || payload.title || 'Untitled',
          completed: payload.completed || 0,
          date: payload.date || new Date().toISOString().slice(0,10),
          priority: payload.priority || 'medium',
          dueDate: payload.dueDate || null,
          category: payload.category || 'Personal'
        };
        todos.push(todo);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(todo));
      } catch (e) {
        res.writeHead(400);
        res.end('Invalid JSON');
      }
    });
    return;
  }

  // Fallback
  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Mock backend listening on http://127.0.0.1:${PORT}`);
});

// graceful shutdown
process.on('SIGINT', () => { server.close(() => process.exit(0)); });
process.on('SIGTERM', () => { server.close(() => process.exit(0)); });
