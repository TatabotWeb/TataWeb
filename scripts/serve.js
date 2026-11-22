// Servidor local para probar la página: node scripts/serve.js  →  http://localhost:8765
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PORT = Number(process.env.PORT) || 8765;
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon' };

http
  .createServer((req, res) => {
    let file;
    try {
      file = decodeURIComponent(req.url.split(/[?#]/)[0]);
    } catch {
      return res.writeHead(400).end();
    }
    if (file.endsWith('/')) file += 'index.html';
    const full = path.join(ROOT, file);
    if (!full.startsWith(ROOT)) return res.writeHead(403).end();
    fs.readFile(full, (err, body) => {
      if (err) return res.writeHead(404, { 'Content-Type': 'text/plain' }).end('404');
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(full)] ?? 'application/octet-stream' }).end(body);
    });
  })
  .listen(PORT, '127.0.0.1', () => console.log(`🧉 TataWeb en http://localhost:${PORT}`));
