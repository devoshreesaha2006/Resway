import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml' };
const server = createServer(async (req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const candidate = normalize(join(root, pathname === '/' ? 'index.html' : pathname));
  if (!candidate.startsWith(root)) { res.writeHead(403).end('Forbidden'); return; }
  try {
    const body = await readFile(candidate);
    res.writeHead(200, { 'content-type': mime[extname(candidate)] || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('Not found');
  }
});
const port = Number(process.env.PORT || 4173);
server.listen(port, '127.0.0.1', () => console.log(`NEXORA is available at http://localhost:${port}`));
