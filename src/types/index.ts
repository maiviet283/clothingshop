/* Domain types for the catalogue. These mirror the normalized JSON produced by
   scripts/scrape.mjs + scripts/categorize.mjs. */

export interface Variant {
  id: string;
  title: string;
  sku: string;
  price: number;
  compareAtPrice: number;
  available: boolean;
  option1: string | null;
  option2: string | null;
  option3: string | null;
}

export interface ProductOption {
  name: string;
  values: string[];
}

export interface Product {
  id: string;
  handle: string;
  title: string;
  vendor: string;
  type: string;
  tags: string[];
  excerpt: string;
  minPrice: number;
  maxPrice: number;
  /** Original price when on sale; 0 when not discounted. */
  compareAtPrice: number;
  available: boolean;
  images: string[];
  image: string;
  options: ProductOption[];
  variants: Variant[];
  createdAt: string | null;
  publishedAt: string | null;
  category: CategoryKey;
  subcategory: string;
}

export type CategoryKey = 'ao' | 'quan' | 'phu-kien' | 'set';

export interface SubCategory {
  key: string;
  count: number;
}

export interface Category {
  key: CategoryKey;
  count: number;
  subs: SubCategory[];
}

export type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'newest' | 'discount';

export type ThemeMode = 'light' | 'dark';
export type Language = 'vi' | 'en';
