// Minimal static file server used by Playwright's webServer.
// Serves apps/crx/e2e/fixtures/ on the configured port. Intentionally
// dependency-free so Playwright install is the only e2e dep.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_DIR = path.join(__dirname, 'fixtures');
const PORT = Number(process.env.PORT) || 4318;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  if (!req.url) {
    res.writeHead(400).end();
    return;
  }
  // Strip query/hash, default to /A1-static-form.html for root.
  let p = req.url.split('?')[0].split('#')[0];
  if (p === '/' || p === '') p = '/index.html';
  // Resolve relative to fixtures dir; reject traversal.
  const full = path.normalize(path.join(FIXTURE_DIR, p));
  if (!full.startsWith(FIXTURE_DIR)) {
    res.writeHead(403).end('forbidden');
    return;
  }
  fs.readFile(full, (err, data) => {
    if (err) {
      res.writeHead(404, { 'content-type': 'text/plain' }).end(`not found: ${p}`);
      return;
    }
    const mime = MIME[path.extname(full).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, {
      'content-type': mime,
      'cache-control': 'no-store',
      // Liberal CORS so cross-origin iframe tests can host content on the same port.
      'access-control-allow-origin': '*',
    });
    res.end(data);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`fixture server on http://127.0.0.1:${PORT}`);
});
