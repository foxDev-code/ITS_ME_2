import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), 'dist');
const port = Number(process.env.PORT || 4180);
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.woff2':'font/woff2','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.svg':'image/svg+xml','.glb':'model/gltf-binary','.wasm':'application/wasm','.mp3':'audio/mpeg','.m4a':'audio/mp4','.json':'application/json','.pdf':'application/pdf'};
export function resolveFile(url) {
  const file = path.resolve(root,'.'+decodeURIComponent(new URL(url,'http://localhost').pathname));
  if (file !== root && !file.startsWith(root+path.sep)) throw Error('Invalid path');
  return file === root ? path.join(root,'index.html') : file;
}
if (process.argv.includes('--check')) {
  const assert = await import('node:assert/strict');
  assert.default.equal(resolveFile('/'),path.join(root,'index.html'));
  assert.default.throws(()=>resolveFile('/%2e%2e%2fsecret'));
  console.log('Static server checks passed');
} else {
  const server = http.createServer(async (req,res) => {
    res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
    if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405,{'Allow':'GET, HEAD'}); res.end(); return; }
    try {
      const pathname = new URL(req.url,'http://localhost').pathname;
      const redirects = {'/index.html':'/','/about':'/about.html','/projects':'/projects.html','/contact':'/contact.html','/faq':'/faq.html'};
      if (redirects[pathname]) { res.writeHead(301,{'Location':redirects[pathname]}); res.end(); return; }
      const file=resolveFile(req.url);
      const bytes=await fs.readFile(file);
      const type = {'.txt':'text/plain; charset=utf-8','.xml':'application/xml; charset=utf-8'}[path.extname(file)] || mime[path.extname(file)] || 'application/octet-stream';
      res.writeHead(200,{'Content-Type':type,'Cache-Control':/\.(?:png|webp|jpg|woff2|glb|wasm|mp3|m4a)$/.test(file)?'public, max-age=86400':'no-cache'});
      res.end(req.method==='HEAD'?undefined:bytes);
    } catch {
      res.writeHead(404,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'});
      res.end(req.method==='HEAD'?undefined:await fs.readFile(path.join(root,'404.html')).catch(()=>'<h1>Page not found</h1><a href="/">Home</a>'));
    }
  });
  server.on('error', error => {
    if (error.code === 'EADDRINUSE' && !process.env.PORT) {
      console.log(`Port ${port} is busy; choosing an available port.`);
      server.listen(0, '127.0.0.1');
    } else {
      console.error(`Could not start portfolio: ${error.message}`);
      process.exitCode = 1;
    }
  });
  server.once('listening', () => {
    const url = `http://127.0.0.1:${server.address().port}/`;
    console.log(`Portfolio: ${url}\nKeep this window open while using the site.`);
    if (process.argv.includes('--open') && process.platform === 'win32') {
      execFile('powershell.exe', ['-NoProfile', '-Command', `Start-Process '${url}'`], error => {
        if (error) console.error(`Open ${url} in your browser. ${error.message}`);
      });
    }
  });
  server.listen(port, '127.0.0.1');
}
