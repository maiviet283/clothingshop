/* Generates dist/sitemap.xml from the pre-rendered .html files. Postbuild step. */
import { readdir, writeFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join, relative } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, '../dist');
const ORIGIN = 'https://torano-shop.demo';

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'assets') continue;
      files.push(...(await walk(full)));
    } else if (e.name.endsWith('.html')) {
      files.push(full);
    }
  }
  return files;
}

function toUrl(file) {
  let rel = relative(DIST, file).replace(/\\/g, '/');
  rel = rel.replace(/index\.html$/, '').replace(/\.html$/, '');
  if (rel && !rel.endsWith('/')) rel = `${rel}`;
  const path = rel === '' ? '/' : `/${rel}`.replace(/\/+$/, '') || '/';
  return `${ORIGIN}${path === '/' ? '/' : path}`;
}

async function main() {
  try {
    await stat(DIST);
  } catch {
    console.error('dist/ not found — run the build first.');
    process.exit(1);
  }

  const files = await walk(DIST);
  const urls = [...new Set(files.map(toUrl))]
    // 404 / search aren't useful in a sitemap.
    .filter((u) => !u.endsWith('/404') && !u.endsWith('/search'))
    .sort();

  const now = new Date().toISOString().slice(0, 10);
  const body = urls
    .map(
      (u) =>
        `  <url><loc>${u}</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq>` +
        `<priority>${u === `${ORIGIN}/` ? '1.0' : '0.7'}</priority></url>`,
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
  await writeFile(resolve(DIST, 'sitemap.xml'), xml, 'utf8');
  console.log(`sitemap.xml written with ${urls.length} URLs.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
