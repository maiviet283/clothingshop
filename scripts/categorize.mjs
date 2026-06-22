/* Derives the category tree from product types and tags each product. Run after scrape.mjs. */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = resolve(__dirname, '../src/data');

/* Ordered keyword rules (first match wins) mapping product type -> category/subcategory. */
const RULES = [
  { cat: 'phu-kien', sub: 'that-lung', kw: ['that lung'] },
  // Bottoms (checked before tops; "short"/"quan" prefixes are unambiguous).
  { cat: 'quan', sub: 'short', kw: ['short'] },
  { cat: 'quan', sub: 'jeans', kw: ['quan jeans', 'jeans'] },
  { cat: 'quan', sub: 'khaki', kw: ['quan khaki', 'quan kaki'] },
  { cat: 'quan', sub: 'gio', kw: ['quan gio', 'jogger', 'quan dui'] },
  { cat: 'quan', sub: 'ni', kw: ['quan ni'] },
  { cat: 'quan', sub: 'au', kw: ['quan au', 'smart pant', 'sidetab', 'quan '] },
  // Tops.
  { cat: 'ao', sub: 'polo', kw: ['polo'] },
  { cat: 'ao', sub: 'so-mi', kw: ['so mi'] },
  { cat: 'ao', sub: 'tshirt', kw: ['t shirt', 'tshirt', 'phong'] },
  { cat: 'ao', sub: 'blazer', kw: ['blazer'] },
  { cat: 'ao', sub: 'ni-hoodie', kw: ['hoodie', 'ao ni', 'ni hoodie'] },
  { cat: 'ao', sub: 'len', kw: ['len'] },
  { cat: 'ao', sub: 'khoac', kw: ['khoac', 'phao', 'lop', 'da lon', 'lot bong', 'lot long', 'gio', 'da', 'nhung'] },
];

const CATEGORIES = [
  {
    key: 'ao',
    subs: ['polo', 'tshirt', 'so-mi', 'ni-hoodie', 'len', 'blazer', 'khoac'],
  },
  {
    key: 'quan',
    subs: ['au', 'jeans', 'khaki', 'short', 'ni', 'gio'],
  },
  { key: 'set', subs: ['set-bo'] },
  { key: 'phu-kien', subs: ['that-lung'] },
];

function deaccent(s) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase();
}

function classify(p) {
  // Classify on `type` (clean), falling back to title. Tags are excluded because
  // Haravan size tags like "size_aopolothun" pollute keyword matching.
  const hay = deaccent(p.type || p.title || '');
  for (const rule of RULES) {
    if (rule.kw.some((k) => hay.includes(k))) {
      return { category: rule.cat, subcategory: rule.sub };
    }
  }
  return { category: 'ao', subcategory: 'tshirt' };
}

async function main() {
  const products = JSON.parse(await readFile(resolve(DATA, 'products.json'), 'utf8'));

  const counts = {};
  for (const p of products) {
    const { category, subcategory } = classify(p);
    p.category = category;
    p.subcategory = subcategory;
    counts[category] = (counts[category] || 0) + 1;
  }

  // Only keep subcategories that actually have products.
  const subUsed = new Set(products.map((p) => `${p.category}/${p.subcategory}`));
  const categories = CATEGORIES.map((c) => ({
    key: c.key,
    count: products.filter((p) => p.category === c.key).length,
    subs: c.subs
      .filter((s) => subUsed.has(`${c.key}/${s}`))
      .map((s) => ({
        key: s,
        count: products.filter((p) => p.category === c.key && p.subcategory === s).length,
      })),
  })).filter((c) => c.count > 0);

  await writeFile(resolve(DATA, 'products.json'), JSON.stringify(products, null, 2), 'utf8');
  await writeFile(resolve(DATA, 'categories.json'), JSON.stringify(categories, null, 2), 'utf8');

  console.log('Categorized', products.length, 'products');
  console.log('Top-level counts:', counts);
  console.log('Tree:', JSON.stringify(categories.map((c) => `${c.key}(${c.count}):[${c.subs.map((s) => s.key + ':' + s.count).join(',')}]`), null, 0));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
