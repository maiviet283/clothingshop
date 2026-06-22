# TORANO — Premium Menswear (frontend demo)

A statically pre-rendered (SSG) storefront for a men's clothing shop, built with
**Vite 7 + React 19 + TypeScript**. Catalogue data is scraped and normalized
from [torano.vn](https://torano.vn).

Every route is pre-rendered to static HTML at build time, so SEO meta, content
and JSON-LD are present on first byte (`curl`-able) — while the page hydrates
into a fully interactive SPA.

## Features

- 🖥️ **SSG + SEO** — per-route `<title>`, meta description, canonical, Open
  Graph, Twitter card and JSON-LD baked into static HTML; auto `sitemap.xml`.
- 🌗 **Light / dark theme** — all design tokens centralized in `src/index.css`,
  switched via `data-theme`, no flash on load.
- 🌐 **i18n (vi / en)** — every string comes from `src/locales/*.json`; zero
  hard-coded copy.
- 📱 **Responsive** — mobile-first, no horizontal overflow, dedicated mobile
  drawer.
- 🛍️ Product listing with filter + sort + load-more, product detail with
  variant selection, search overlay, and a client-side cart (localStorage).
- ✂️ Custom SVG logo + hand-drawn icon set (no icon library).

## Quick start

```bash
npm install
npm run dev       # http://localhost:5173 (dev, CSR + HMR)
npm run build     # static build -> dist/ (+ sitemap.xml)
npm run preview   # serve the built site -> http://localhost:4173
```

Verify SEO on a built page:

```bash
npm run build
npm run preview
curl -s http://localhost:4173/product/quan-jeans-basic-slim-eabj012 | grep -i '<title\|description\|application/ld'
```

## Re-scrape data

```bash
npm run scrape    # refresh src/data/products.json + categories.json
```

## Deploy — Cloudflare Pages (auto-deploy on push)

This repo is wired for Cloudflare Pages **Git integration**: connect it once,
then every `git push` triggers an automatic build + deploy. No secrets, no CI
files needed — `wrangler.toml` already declares the output dir.

**One-time setup in the Cloudflare dashboard:**

1. Push this repo to GitHub (or GitLab).
2. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** →
   **Connect to Git** → pick this repository.
3. In the build settings, enter:
   - **Framework preset:** `None` (it's a custom Vite SSG build)
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `/` (leave default)
4. (Node version) Cloudflare reads [`.node-version`](.node-version) = `20`
   automatically. If needed, also add an env var `NODE_VERSION = 20`.
5. **Save and Deploy.**

From then on: push to the production branch → Cloudflare builds & publishes;
push to any other branch / open a PR → you get a **preview deployment** URL.

What's already configured for you:
- [`wrangler.toml`](wrangler.toml) — sets `pages_build_output_dir = "dist"`.
- [`.node-version`](.node-version) — pins the build to Node 20.
- [`public/_headers`](public/_headers) — long-cache hashed assets, no-cache HTML,
  basic security headers.
- `dist/404.html` — a real pre-rendered 404 page Cloudflare serves for unknown
  URLs (with `noindex`).
- `dist/sitemap.xml` + `public/robots.txt`.

> Update the production origin in [`src/lib/site.ts`](src/lib/site.ts) and
> `public/robots.txt` to your real Pages domain so canonical/OG URLs and the
> sitemap point at the right host.

## Project conventions

See [CLAUDE.md](CLAUDE.md) for the architecture and the four mandatory rules
(responsive UI, centralized theme tokens, no-hardcoded-strings i18n, SSG SEO).
