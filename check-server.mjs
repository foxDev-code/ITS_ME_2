import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import { profile, projects } from './dist/profile.js';

const blocker = http.createServer();
await new Promise((resolve, reject) => {
  blocker.once('error', error => error.code === 'EADDRINUSE' ? resolve() : reject(error));
  blocker.listen(4180, '127.0.0.1', resolve);
});
const env = { ...process.env };
delete env.PORT;
const child = spawn(process.execPath, [fileURLToPath(new URL('./serve.mjs', import.meta.url))], { env });
const timeout = setTimeout(() => { child.kill(); blocker.close(); throw Error('Server check timed out'); }, 10000);
try {
  const url = await new Promise((resolve, reject) => {
    let output = '';
    child.stdout.on('data', chunk => {
      output += chunk;
      const match = output.match(/Portfolio: (http:\/\/[^\s]+)/);
      if (match) resolve(match[1]);
    });
    child.once('error', reject);
    child.once('exit', code => reject(Error(`Server exited: ${code}`)));
  });
  assert.notEqual(new URL(url).port, '4180');
  const response = await fetch(url);
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /id="root"/);
  assert.match(html, /Satyarth Mishra/);
  assert(!/s[eé]bastien|lempens|id="awards"/i.test(html));
  const credits = await readFile(new URL('./dist/assets/Credits-CJNmQ2tl.js', import.meta.url), 'utf8');
  assert(!/s[eé]bastien|lempens|Original acknowledgements/i.test(credits));
  assert(!html.includes('cookie-cta'));
  assert(!html.includes('intro-copy'));
  assert(html.includes('For the best experience') && html.includes('Turn your sound on / Switch to desktop'));
  assert(!html.includes('__CF$'));
  assert(!html.includes('class="profile-links"') && !html.includes('class="text-navigation"'));
  const contactHtml = await (await fetch(new URL('/contact.html',url))).text();
  assert(contactHtml.includes(profile.github) && contactHtml.includes(profile.linkedin));
  for (const sky of ['sunrise', 'sunshine']) {
    for (const size of ['', 'mobile/']) {
      for (const face of ['px', 'nx', 'py', 'ny', 'pz', 'nz']) {
        const image = await fetch(new URL(`/hdri/${sky}/${size}${face}.png`, url));
        assert.equal(image.status, 200, `${sky}/${size}${face}`);
        assert.deepEqual(Buffer.from(await image.arrayBuffer()).subarray(0, 8), Buffer.from([137,80,78,71,13,10,26,10]));
      }
    }
  }
  for (const project of projects) {
    const image = await fetch(new URL(project.image, url));
    assert.equal(image.status, 200, project.image);
    assert.match(image.headers.get('content-type'), /^image\//);
    if (project.url !== null) {
      const destination = new URL(project.url);
      assert.equal(destination.protocol, 'https:');
      assert(!['foxdev-portfolio.vercel.app', 'github.com'].includes(destination.hostname), 'Project buttons must open deployed apps');
    }
  }
  const resume = await fetch(new URL(profile.resume, url));
  assert.equal(resume.headers.get('content-type'), 'application/pdf');
  const pdf = Buffer.from(await resume.arrayBuffer());
  assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
  assert.deepEqual(pdf, await readFile(new URL('./dist' + profile.resume, import.meta.url)));
  const script = html.match(/src="(\/assets\/[^\"]+\.js)"/)[1];
  assert.equal((await fetch(new URL(script, url))).status, 200);
  assert.equal((await fetch(new URL('/missing-file', url))).status, 404);
  assert.match(await (await fetch(new URL('/missing-file', url))).text(), /This page isn’t here/);
  assert.equal((await fetch(new URL('/index.html',url),{redirect:'manual'})).status,301);
  assert.equal((await fetch(url,{method:'POST'})).status,405);
  assert.equal(response.headers.get('x-content-type-options'),'nosniff');
  const titles = new Set();
  for (const route of ['/', '/about.html','/projects.html','/contact.html','/faq.html','/privacy.html','/terms.html','/notes.html']) {
    const pageResponse = await fetch(new URL(route,url));
    assert.equal(pageResponse.status,200,route);
    const source = await pageResponse.text();
    assert.equal((source.match(/<h1[ >]/g)||[]).length,route==='/'?0:1,route+' heading');
    const title = source.match(/<title>(.*?)<\/title>/)[1];
    assert(!titles.has(title),'Unique page titles'); titles.add(title);
    assert.match(source,/property="og:image"/);
    const schema = JSON.parse(source.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
    assert.equal(schema['@context'],'https://schema.org');
    for (const [,link] of source.matchAll(/(?:href|src)="(\/[^"#]*)"/g)) {
      const linked = await fetch(new URL(link,url),{method:'HEAD'});
      assert.equal(linked.status,200,route+' links to '+link);
    }
  }
  assert.match(await (await fetch(new URL('/robots.txt',url))).text(),/OAI-SearchBot/);
  assert.match((await fetch(new URL('/sitemap.xml',url))).headers.get('content-type'),/xml/);
  assert.match(await (await fetch(new URL('/contact.html',url))).text(),/type="email"[^>]*required/);
  console.log('PASS: static page content, headings, metadata, JSON-LD, internal links, redirects, custom 404, method handling, robots and sitemap.');
  console.log(`PASS: busy-port fallback, personalized homepage, ${projects.length} project images, social links, PDF delivery, JavaScript asset, and missing-file response.`);
} finally {
  clearTimeout(timeout);
  const exited = once(child, 'exit');
  child.kill();
  await exited;
  blocker.close();
}
