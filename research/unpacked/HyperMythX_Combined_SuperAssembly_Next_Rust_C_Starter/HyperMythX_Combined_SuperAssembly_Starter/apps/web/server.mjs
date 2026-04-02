
import http from 'node:http';
import { DOMAIN_REGISTRY } from '../../packages/protocol/index.mjs';

const page = (title, body) => `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>body{font-family:Arial,sans-serif;max-width:900px;margin:40px auto;padding:0 16px}code{background:#f3f3f3;padding:2px 4px;border-radius:4px}</style></head><body><h1>${title}</h1>${body}</body></html>`;

const server = http.createServer((req, res) => {
  const host = (req.headers.host || 'localhost:3000').split(':')[0];
  const shell = DOMAIN_REGISTRY[host] || 'local-dev-shell';
  const links = Object.entries(DOMAIN_REGISTRY).map(([domain, view]) => `<li><code>${domain}</code> → ${view}</li>`).join('');
  const body = `
    <p>Resolved shell: <strong>${shell}</strong></p>
    <p>This starter keeps the VR Superbrain separate from the Desktop Agent execution shell.</p>
    <p>Use a hosts file or proxy later for domain testing. For now, local host falls back safely.</p>
    <h2>Locked domains</h2>
    <ul>${links}</ul>
  `;
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  res.end(page('HyperMythX Combined SuperAssembly Starter', body));
});

server.listen(3000, () => {
  console.log('web starter listening on http://localhost:3000');
});
