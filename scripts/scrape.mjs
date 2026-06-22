/* Scraper for torano.vn: pulls public catalog JSON -> src/data/products.json. Run: node scripts/scrape.mjs */
import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, '../src/data');
const BASE = 'https://torano.vn';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJSON(url, attempt = 1) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.json();
  } catch (err) {
    if (attempt <= 3) {
      await sleep(800 * attempt);
      return getJSON(url, attempt + 1);
    }
    throw err;
  }
}

/** Strip HTML to a plain-text excerpt. */
function htmlToText(html, max = 320) {
  if (!html) return '';
  const text = String(html)
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, '') + '…';
}

function normalizeImg(src) {
  if (!src) return '';
  let u = src.startsWith('//') ? `https:${src}` : src;
  // Upgrade Haravan thumbnails to a large variant for crisp display.
  u = u.replace(/_(grande|large|medium|small|compact|thumb|\d+x\d*|x\d+)\./i, '_1024x1024.');
  return u;
}

function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

async function fetchAllProducts() {
  const all = [];
  for (let page = 1; page <= 12; page++) {
    const url = `${BASE}/collections/all/products.json?limit=50&page=${page}`;
    const data = await getJSON(url);
    const products = data.products || [];
    if (products.length === 0) break;
    all.push(...products);
    process.stdout.write(`  page ${page}: ${products.length} products (total ${all.length})\n`);
    if (products.length < 50) break;
    await sleep(400);
  }
  return all;
}

function normalizeProduct(p) {
  const variants = (p.variants || []).map((v) => ({
    id: String(v.id),
    title: v.title,
    sku: v.sku || '',
    price: toNumber(v.price),
    compareAtPrice: toNumber(v.compare_at_price),
    available: v.available !== false,
    option1: v.option1 || null,
    option2: v.option2 || null,
    option3: v.option3 || null,
  }));

  const prices = variants.map((v) => v.price).filter((n) => n > 0);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const compares = variants.map((v) => v.compareAtPrice).filter((n) => n > 0);
  const compareAtPrice = compares.length ? Math.max(...compares) : 0;

  const images = (p.images || []).map((img) => normalizeImg(img.src)).filter(Boolean);

  const options = (p.options || []).map((o) => ({
    name: typeof o === 'string' ? o : o.name,
    values: typeof o === 'string' ? [] : o.values || [],
  }));

  return {
    id: String(p.id),
    handle: p.handle,
    title: p.title,
    vendor: p.vendor || 'TORANO',
    type: p.product_type || '',
    tags: Array.isArray(p.tags) ? p.tags : String(p.tags || '').split(',').map((t) => t.trim()).filter(Boolean),
    excerpt: htmlToText(p.body_html),
    minPrice,
    maxPrice,
    compareAtPrice: compareAtPrice > maxPrice ? compareAtPrice : 0,
    available: variants.some((v) => v.available),
    images,
    image: images[0] || '',
    options,
    variants,
    createdAt: p.created_at || null,
    publishedAt: p.published_at || null,
  };
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  console.log('Fetching products…');
  const rawProducts = await fetchAllProducts();

  const products = rawProducts.map(normalizeProduct).filter((p) => p.image && p.minPrice > 0);

  // Derive a clean category list from product_type (more reliable than the
  // store's messy, overlapping marketing collections).
  const typeCount = new Map();
  for (const p of products) {
    if (!p.type) continue;
    typeCount.set(p.type, (typeCount.get(p.type) || 0) + 1);
  }

  await writeFile(resolve(OUT_DIR, 'products.json'), JSON.stringify(products, null, 2), 'utf8');

  console.log(`\nDone.`);
  console.log(`  products: ${products.length}`);
  console.log(`  types:    ${[...typeCount.entries()].map(([k, v]) => `${k}(${v})`).join(', ')}`);
}

main().catch((err) => {
  console.error('Scrape failed:', err);
  process.exit(1);
});
