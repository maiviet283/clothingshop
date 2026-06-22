import type { RouteRecord } from 'vite-react-ssg';
import { Layout } from './components/layout/Layout';
import { categories, allProductHandles } from './lib/catalog';
import { CURATED_SLUGS } from './lib/curated';

/** Build the flat list of static paths the SSG crawler should pre-render. */
const categoryPaths = categories.map((c) => `category/${c.key}`);
const subcategoryPaths = categories.flatMap((c) =>
  c.subs.map((s) => `category/${c.key}/${s.key}`),
);
const productPaths = allProductHandles.map((h) => `product/${h}`);
const collectionPaths = CURATED_SLUGS.map((s) => `collection/${s}`);

/**
 * Route tree (react-router data routes extended with SSG `getStaticPaths`).
 * Pages are lazily imported so each route is its own chunk; the SSG build still
 * pre-renders every path returned by getStaticPaths to static HTML.
 */
export const routes: RouteRecord[] = [
  {
    path: '/',
    Component: Layout,
    children: [
      {
        index: true,
        lazy: async () => ({ Component: (await import('./pages/Home')).default }),
      },
      {
        path: 'shop',
        lazy: async () => ({ Component: (await import('./pages/Shop')).default }),
      },
      {
        path: 'category/:category',
        lazy: async () => ({ Component: (await import('./pages/Category')).default }),
        getStaticPaths: () => categoryPaths,
      },
      {
        path: 'category/:category/:sub',
        lazy: async () => ({ Component: (await import('./pages/Category')).default }),
        getStaticPaths: () => subcategoryPaths,
      },
      {
        path: 'collection/:slug',
        lazy: async () => ({ Component: (await import('./pages/Collection')).default }),
        getStaticPaths: () => collectionPaths,
      },
      {
        path: 'product/:handle',
        lazy: async () => ({ Component: (await import('./pages/ProductDetail')).default }),
        getStaticPaths: () => productPaths,
      },
      {
        path: 'search',
        lazy: async () => ({ Component: (await import('./pages/Search')).default }),
      },
      {
        // Pre-rendered to dist/404.html so static hosts (Cloudflare Pages)
        // serve a real 404 page for unknown URLs.
        path: '404',
        lazy: async () => ({ Component: (await import('./pages/NotFound')).default }),
      },
      {
        // Client-side catch-all for runtime navigation to unknown routes.
        path: '*',
        lazy: async () => ({ Component: (await import('./pages/NotFound')).default }),
      },
    ],
  },
];
