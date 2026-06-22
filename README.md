<div align="center">

# TORANO — Premium Menswear

A statically pre-rendered storefront for a men's clothing shop.
**Vite 7 · React 19 · TypeScript · SSG · i18n · SEO**

Live: **[clothingshop.vietdon.vn](https://clothingshop.vietdon.vn)** · **[clothingshop.maiviet283.workers.dev](https://clothingshop.maiviet283.workers.dev)**

</div>

---

Every route is **pre-rendered to static HTML at build time**, so SEO tags,
content and JSON-LD are present on the first byte (verifiable with `curl`) — and
the page then hydrates into a fully interactive SPA. Catalogue data is scraped
and normalized from [torano.vn](https://torano.vn).

## Highlights

- 🖥️ **SSG + SEO** — per-route `<title>`, meta description, canonical, Open
  Graph, Twitter card and JSON-LD baked into static HTML; auto `sitemap.xml` +
  `robots.txt` + a real pre-rendered `404.html`.
- 🌗 **Light / dark theme** — all design tokens centralized in
  [`src/index.css`](src/index.css), switched via `data-theme`, no flash on load
  (defaults to **light**).
- 🌐 **i18n (vi / en)** — every visible string comes from
  [`src/locales`](src/locales); **zero hard-coded copy**. Defaults to
  **Vietnamese**.
- 📱 **Responsive** — mobile-first, no horizontal overflow, dedicated mobile
  drawer.
- 🛍️ Product listing with filter + sort + load-more, product detail with variant
  (size/colour) selection, search overlay, client-side cart (localStorage).
- ✂️ Custom SVG logo + a hand-drawn icon set (no icon library, no dead assets).

---

## Engineering principles (must follow)

These are **non-negotiable rules** for any change to this codebase. The detailed
Vietnamese version lives in [CLAUDE.md](CLAUDE.md).

### 1. UI/UX works on every screen size
Mobile-first, tested from 320 px up. **No horizontal overflow** (grids use
`minmax(0, 1fr)`). Any `position: fixed` overlay/drawer is rendered outside
ancestors that have `transform` / `backdrop-filter` (they break fixed layout).
The look is intentional and editorial — angular, modern, restrained — not
"templated".

### 2. Light & dark theme — colours centralized in `src/index.css`
**All** colour / typography / spacing / shadow / motion values are CSS custom
properties declared once in [`src/index.css`](src/index.css). Components consume
them **only** through `var(--token)`. **Never hard-code a hex colour** in a
component stylesheet. Theme switches via `<html data-theme="light|dark">` and
must repaint reliably (we deliberately avoid `transition` on `var()`-based
`background-color`/`color`, which triggers a Chromium "stuck value" bug).

### 3. Internationalisation first — no hard-coded strings
There are exactly two locale files,
[`src/locales/vi.json`](src/locales/vi.json) and
[`src/locales/en.json`](src/locales/en.json), and they must stay **key-for-key
in sync**. **100% of user-facing text** — in the header, footer, body, every
page and every component — must come from `t('namespace.key')`. Hard-coding a
string anywhere is not allowed. Adding text = adding the key to **both** files.

### 4. SEO is mandatory — `curl` must return real data
Every route renders the [`Seo`](src/components/seo/Seo.tsx) component (title,
meta description, canonical, OG, Twitter, JSON-LD). Thanks to SSG, all of it is
in the static HTML — each URL returns rendered content, not an empty SPA shell.
Dynamic routes declare `getStaticPaths` in [`src/routes.tsx`](src/routes.tsx) so
the crawler pre-renders one `.html` per product / category.

> Additional house rules: handle edge cases (404, out-of-stock, empty lists,
> invalid input, `prefers-reduced-motion`); delete unused files/icons; keep the
> folder layout (`components/ pages/ routes/ types/ lib/ hooks/ locales/`); and
> **`npm run lint` + `npm run build` must both pass before committing**.

---

## Tech stack

| Area        | Choice                                              |
| ----------- | --------------------------------------------------- |
| Build / dev | Vite 7                                              |
| UI          | React 19 + TypeScript                               |
| SSG / SEO   | `vite-react-ssg` (pre-renders every route to HTML)  |
| Routing     | `react-router-dom` v6 (data routes)                 |
| i18n        | `i18next` + `react-i18next`                         |
| Styling     | Plain CSS + CSS Modules (no UI library)             |

## Project structure

```
scripts/            Scrape & build tooling (Node, not bundled)
  scrape.mjs          Scrape products from torano.vn -> src/data/products.json
  categorize.mjs      Derive a clean category tree + tag each product
  sitemap.mjs         Generate dist/sitemap.xml after build
public/             favicon.svg (logo), og-default.svg, robots.txt, _headers
src/
  data/             Normalized static data (products.json, categories.json)
  types/            Domain TypeScript types
  locales/          vi.json, en.json  ← the ONLY source of copy
  lib/              catalog, curated, format, i18n, site (pure logic)
  hooks/            useReveal, useMediaQuery
  components/       providers/ layout/ brand/ ui/ product/ collection/ cart/
                    search/ seo/
  pages/            Home, Shop, Category, Collection, ProductDetail, Search,
                    NotFound  (each renders its own <Seo>)
  routes.tsx        Route tree + getStaticPaths for SSG
  main.tsx          ViteReactSSG entry
```

## Scripts

```bash
npm install
npm run dev       # dev server (CSR + HMR)            http://localhost:5173
npm run build     # type-check + SSG build -> dist/   (+ sitemap.xml)
npm run preview   # serve the built site              http://localhost:4173
npm run lint      # ESLint (must be clean)
npm run scrape    # refresh src/data/*.json from torano.vn
```

Verify SEO is in the static HTML:

```bash
npm run build && npm run preview
curl -s http://localhost:4173/product/quan-jeans-basic-slim-eabj012 \
  | grep -iE '<title|name="description"|application/ld\+json'
```

---

## Deploy — Cloudflare Workers (Static Assets), auto-deploy on push

The pre-rendered `dist/` is deployed as a **Cloudflare Worker with static
assets** through the **Workers Builds** Git integration. Connect the repo once;
after that **every `git push` builds and deploys automatically**.

### One-time setup (Cloudflare dashboard)

1. Push this repo to GitHub / GitLab.
2. **Workers & Pages → Create → Import a repository →** select this repo.
3. Build settings:
   - **Build command:** `npm run build`
   - **Deploy command:** `npx wrangler deploy`
   - **Non-production branches command:** `npx wrangler versions upload`
4. **Save and Deploy.** (Node version is read from
   [`.node-version`](.node-version) = `22`; Wrangler v4 requires Node ≥ 22. If a
   build ever fails on Node, add a build variable `NODE_VERSION = 22`.)

### How the publish URL works

- **Production push** (your default branch) → Cloudflare builds and publishes to
  the Worker's URL: **`https://clothingshop.<account>.workers.dev`** (here
  [`clothingshop.maiviet283.workers.dev`](https://clothingshop.maiviet283.workers.dev)).
- **Custom domain** — added in *Worker → Settings → Domains & Routes*; Cloudflare
  auto-creates the proxied DNS record + SSL. Live at
  [`clothingshop.vietdon.vn`](https://clothingshop.vietdon.vn).
- **Other branches / PRs** → each push gets its own **preview version URL**
  (`https://<version>-clothingshop.<account>.workers.dev`) so you can review
  before promoting to production.

### Already configured in the repo

- [`wrangler.toml`](wrangler.toml) — Worker `name` + `[assets]` pointing at
  `./dist` with `not_found_handling = "404-page"`.
- [`.node-version`](.node-version) — pins build/deploy to Node 22.
- [`public/_headers`](public/_headers) — immutable long-cache for hashed assets,
  no-cache for HTML, baseline security headers.

> After pointing at a domain, set the production origin in
> [`src/lib/site.ts`](src/lib/site.ts) and `public/robots.txt` so canonical/OG
> URLs and the sitemap reference the right host.

### Manual deploy (optional)

```bash
npm run build
npx wrangler deploy        # needs Node 22 + `npx wrangler login`
```

---

## Notes

This is a **frontend showcase**: the cart/checkout are simulated client-side
(localStorage) — there is no real backend. Catalogue data belongs to
torano.vn and is used here for demonstration only.
