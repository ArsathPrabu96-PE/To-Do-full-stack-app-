// Lightweight static server for serving the project during E2E tests
// Uses only built-in modules to avoid additional dependencies.
const http = require('http');
const fs = require('fs');
const path = require('path');
const port = process.env.STATIC_PORT || process.env.PORT || 8080;
const root = path.resolve(__dirname, '..');

const mime = {
	'.html': 'text/html',
	'.js': 'application/javascript',
	'.css': 'text/css',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.json': 'application/json',
	'.woff2': 'font/woff2',
};

const server = http.createServer((req, res) => {
	let reqPath = decodeURIComponent(req.url.split('?')[0]);
	if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
	const filePath = path.join(root, reqPath);

	fs.stat(filePath, (err, stats) => {
		if (err || !stats.isFile()) {
			res.statusCode = 404;
			res.end('Not found');
			return;
		}

		const ext = path.extname(filePath).toLowerCase();
		const type = mime[ext] || 'application/octet-stream';
		res.setHeader('Content-Type', type);
		const stream = fs.createReadStream(filePath);
		stream.pipe(res);
		stream.on('error', () => {
			res.statusCode = 500;
			res.end('Server error');
		});
	});
});

server.listen(port, '127.0.0.1', () => {
	console.log(`Static server running at http://127.0.0.1:${port}`);
});
