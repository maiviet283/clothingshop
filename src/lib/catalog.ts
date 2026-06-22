import type { Category, Product, SortKey } from '../types';
import productsData from '../data/products.json';
import categoriesData from '../data/categories.json';

export const products = productsData as unknown as Product[];
export const categories = categoriesData as unknown as Category[];

const byHandle = new Map(products.map((p) => [p.handle, p]));

export function getProduct(handle: string): Product | undefined {
  return byHandle.get(handle);
}

export function getCategory(key: string): Category | undefined {
  return categories.find((c) => c.key === key);
}

export function productsInCategory(key: string): Product[] {
  return products.filter((p) => p.category === key);
}

export function productsInSubcategory(category: string, sub: string): Product[] {
  return products.filter((p) => p.category === category && p.subcategory === sub);
}

/** Products that have a compare-at price (i.e. genuinely discounted). */
export function saleProducts(): Product[] {
  return products.filter((p) => p.compareAtPrice > p.minPrice);
}

/** Heuristic "new arrivals" — most recently published. */
export function newProducts(limit = 8): Product[] {
  return [...products]
    .sort((a, b) => publishedTime(b) - publishedTime(a))
    .slice(0, limit);
}

/** Curated featured set: prefer multi-image, in-stock, mixed categories. */
export function featuredProducts(limit = 8): Product[] {
  return [...products]
    .filter((p) => p.available && p.images.length >= 2)
    .sort((a, b) => b.images.length - a.images.length)
    .slice(0, limit);
}

export function relatedProducts(product: Product, limit = 4): Product[] {
  const sameSub = products.filter(
    (p) => p.handle !== product.handle && p.subcategory === product.subcategory,
  );
  const sameCat = products.filter(
    (p) =>
      p.handle !== product.handle &&
      p.category === product.category &&
      p.subcategory !== product.subcategory,
  );
  return [...sameSub, ...sameCat].slice(0, limit);
}

export function searchProducts(query: string): Product[] {
  const q = deaccent(query.trim().toLowerCase());
  if (!q) return [];
  const terms = q.split(/\s+/).filter(Boolean);
  return products
    .map((p) => ({ p, score: scoreMatch(p, terms) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.p);
}

function scoreMatch(p: Product, terms: string[]): number {
  const title = deaccent(p.title.toLowerCase());
  const type = deaccent(p.type.toLowerCase());
  const tags = deaccent(p.tags.join(' ').toLowerCase());
  let score = 0;
  for (const t of terms) {
    if (title.includes(t)) score += 3;
    else if (type.includes(t)) score += 2;
    else if (tags.includes(t)) score += 1;
    else return 0; // every term must match somewhere
  }
  return score;
}

export function sortProducts(list: Product[], sort: SortKey): Product[] {
  const arr = [...list];
  switch (sort) {
    case 'price-asc':
      return arr.sort((a, b) => a.minPrice - b.minPrice);
    case 'price-desc':
      return arr.sort((a, b) => b.minPrice - a.minPrice);
    case 'newest':
      return arr.sort((a, b) => publishedTime(b) - publishedTime(a));
    case 'discount':
      return arr.sort(
        (a, b) =>
          (b.compareAtPrice - b.minPrice) / (b.compareAtPrice || 1) -
          (a.compareAtPrice - a.minPrice) / (a.compareAtPrice || 1),
      );
    case 'featured':
    default:
      return arr;
  }
}

function publishedTime(p: Product): number {
  const t = p.publishedAt ? Date.parse(p.publishedAt) : NaN;
  return Number.isNaN(t) ? 0 : t;
}

export function deaccent(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

// Used by the SSG getStaticPaths hooks.
export const allProductHandles = products.map((p) => p.handle);
