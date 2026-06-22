import type { Product } from '../types';
import { newProducts, saleProducts } from './catalog';

interface CuratedCollection {
  titleKey: string;
  descKey: string;
  get: () => Product[];
}

/** Curated, non-taxonomy collections addressed by a known slug. */
export const CURATED: Record<string, CuratedCollection> = {
  sale: {
    titleKey: 'nav.sale',
    descKey: 'home.saleSubtitle',
    get: () => saleProducts(),
  },
  new: {
    titleKey: 'nav.newArrivals',
    descKey: 'home.featuredSubtitle',
    get: () => newProducts(48),
  },
};

export const CURATED_SLUGS = Object.keys(CURATED);
