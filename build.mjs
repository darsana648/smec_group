// Assembles src/pages/*.html + shared partials into the static pages at the project root.
// Usage: node build.mjs   (or: npm run build — also compiles Tailwind)
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

const part = (n) => readFileSync(`src/partials/${n}.html`, 'utf8');
const [head, header, footer] = ['head', 'header', 'footer'].map(part);

for (const file of readdirSync('src/pages').filter((f) => f.endsWith('.html'))) {
  const raw = readFileSync(`src/pages/${file}`, 'utf8').replace(/\r\n/g, '\n'); // tolerate CRLF files
  const m = raw.match(/^---\n([\s\S]*?)\n---\n/);
  const meta = Object.fromEntries(
    (m ? m[1] : '').split('\n').filter(Boolean).map((l) => {
      const i = l.indexOf(':');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
  );
  const body = m ? raw.slice(m[0].length) : raw;
  const page = meta.page || file.replace('.html', '');

  const nav = header
    .replace(/\{\{cur:(\w+)\}\}/g, (_, p) => (p === page ? ' aria-current="page"' : ''))
    .replace(/\{\{curbtn:(\w+)\}\}/g, (_, p) => (p === page ? ' aria-current="page"' : ''));

  const scripts = (meta.scripts || '')
    .split(',').map((s) => s.trim()).filter(Boolean)
    .map((s) => `<script src="assets/js/${s}" defer></script>`).join('\n');

  const html =
    head.replace(/\{\{title\}\}/g, meta.title || 'Orrin').replace(/\{\{description\}\}/g, meta.description || '') +
    nav + body + footer.replace('{{scripts}}', scripts);

  writeFileSync(file, html);
  console.log('built', file);
}
