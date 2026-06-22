# TORANO — Frontend cửa hàng thời trang nam

Dự án frontend demo cho một shop quần áo nam, dữ liệu được cào từ
[torano.vn](https://torano.vn) (storefront Haravan). Trang web là **tĩnh hoàn
toàn (SSG)**: mọi route được pre-render ra HTML ở bước build nên SEO có sẵn ngay
khi `curl`, đồng thời vẫn là một SPA React đầy đủ tương tác sau khi hydrate.

> Tài liệu này là **giao kèo** của dự án. Khi thêm/sửa code, phải tuân thủ
> tuyệt đối các nguyên tắc bên dưới.

---

## Tech stack

| Hạng mục        | Lựa chọn                                            |
| --------------- | --------------------------------------------------- |
| Build / dev     | Vite 7                                               |
| UI              | React 19 + TypeScript                                |
| SSG / SEO       | `vite-react-ssg` (pre-render mọi route ra HTML tĩnh) |
| Routing         | `react-router-dom` v6 (data routes)                 |
| Đa ngôn ngữ     | `i18next` + `react-i18next`                          |
| Style           | CSS thuần + **CSS Modules** (không dùng UI lib)      |
| `<head>` / SEO  | `Head` của vite-react-ssg (bọc react-helmet-async)  |

---

## Lệnh

```bash
npm run dev      # Dev server (CSR, HMR nhanh) — http://localhost:5173
npm run build    # tsc -b + SSG build (ra dist/) + sinh sitemap.xml
npm run preview  # Serve thư mục dist/ đã build — http://localhost:4173
npm run lint     # ESLint (phải sạch 0 lỗi trước khi commit)
npm run scrape   # Cào lại dữ liệu từ torano.vn -> src/data/*.json
```

---

## 4 NGUYÊN TẮC BẮT BUỘC

### 1. UI/UX responsive trên mọi màn hình

- Mobile-first. Breakpoint dùng `min-width`: `640px`, `768px`, `900px`, `1024px`.
- **Không được tràn ngang.** Grid luôn dùng `minmax(0, 1fr)` để track co lại được.
- Mọi phần tử `position: fixed` (drawer, overlay) phải nằm **ngoài** mọi tổ tiên
  có `transform` / `backdrop-filter` / `filter` (chúng tạo containing block làm
  hỏng fixed). Vì lẽ này `MobileDrawer` được render là sibling của `<header>`.
- Header trên mobile chỉ giữ: menu, logo, tìm kiếm, giỏ hàng. Toggle
  **sáng/tối** và **ngôn ngữ** chuyển vào trong drawer.

### 2. Màu & theme tập trung ở `src/index.css`

- **Toàn bộ** color/typography/spacing/shadow/motion là CSS custom properties
  khai báo trong [`src/index.css`](src/index.css).
- Component **chỉ** được dùng qua `var(--token)`. **Cấm hard-code mã màu hex**
  trong file `*.module.css` của component.
- Theme đổi bằng `<html data-theme="light|dark">`. Light là mặc định; dark
  override token trong khối `[data-theme='dark']`.
- Chống FOUC: script nhỏ trong `index.html` set `data-theme` trước khi paint.
- Tông màu: nền giấy bone, mực ấm gần đen, **một** accent đồng thau (brass) —
  phong cách menswear góc cạnh, sang trọng. Bo góc gần như vuông (`--radius: 2px`).

### 3. Đa ngôn ngữ — KHÔNG hard-code chữ

- Chỉ có 2 file ngôn ngữ:
  [`src/locales/vi.json`](src/locales/vi.json) và
  [`src/locales/en.json`](src/locales/en.json). Hai file phải **đồng bộ key**.
- **TUYỆT ĐỐI 100% không viết chữ cứng** trong header/footer/body/bất kỳ
  component nào. Mọi chữ hiển thị phải qua `t('namespace.key')`.
- Thêm chữ mới = thêm key vào **cả hai** file `vi.json` và `en.json`.
- Mặc định tiếng Việt (`vi`). Sau khi mount, client nâng cấp theo
  `localStorage` / `navigator.language` (xem `LanguageProvider`).

### 4. SEO — `curl` ra data thật, không phải root rỗng

- Mỗi route render component [`Seo`](src/components/seo/Seo.tsx): set `<title>`,
  meta description, canonical, Open Graph, Twitter card và **JSON-LD**
  (`Store` / `CollectionPage` / `Product`).
- Nhờ SSG, tất cả thẻ trên có sẵn trong HTML tĩnh (kiểm chứng bằng
  `curl http://localhost:4173/product/<handle>`).
- Route động khai báo `getStaticPaths` trong [`src/routes.tsx`](src/routes.tsx)
  để crawler pre-render từng URL (mỗi sản phẩm/danh mục một file `.html`).
- `dist/sitemap.xml` + `public/robots.txt` được tạo tự động ở bước build.

---

## Cấu trúc thư mục

```
scripts/            # Công cụ cào & build (chạy bằng Node, không vào bundle)
  scrape.mjs        #   Cào sản phẩm từ torano.vn -> src/data/products.json
  categorize.mjs    #   Suy ra cây danh mục sạch + gắn category cho từng SP
  sitemap.mjs       #   Sinh dist/sitemap.xml sau khi build
public/             # favicon.svg (logo TORANO), og-default.svg, robots.txt
src/
  data/             # Dữ liệu tĩnh đã chuẩn hoá (products.json, categories.json)
  types/            # Kiểu TypeScript của domain (Product, Category, ...)
  locales/          # vi.json, en.json  ← nguồn chữ DUY NHẤT
  lib/              # Logic thuần, không UI
    catalog.ts      #   Truy vấn/lọc/sắp xếp/tìm kiếm sản phẩm
    curated.ts      #   Bộ sưu tập đặc biệt (sale, new)
    format.ts       #   Format giá VND, % giảm, resize ảnh CDN
    i18n.ts         #   Khởi tạo i18next
    site.ts         #   Cấu hình site (URL canonical, OG locale)
  hooks/            # useReveal (scroll reveal), useMediaQuery
  components/
    providers/      # Theme / Language / Cart context (+ hook cùng file)
    layout/         # Header, Footer, Layout, ScrollToTop
    brand/          # Logo (SVG monogram)
    ui/             # Icon (bộ icon SVG tự vẽ), Reveal, Breadcrumb
    product/        # ProductCard, ProductGrid
    collection/     # CollectionView (engine list + filter + sort + load more)
    cart/           # CartDrawer
    search/         # SearchOverlay
    seo/            # Seo
  pages/            # Home, Shop, Category, Collection, ProductDetail,
                    # Search, NotFound  (mỗi page tự render <Seo>)
  routes.tsx        # Cây route + getStaticPaths cho SSG
  main.tsx          # Entry ViteReactSSG (createRoot)
```

---

## Quy ước khi thêm tính năng

- **Trang mới**: tạo trong `src/pages/`, render `<Seo>` ở đầu, thêm route +
  (nếu route động) `getStaticPaths` trong `routes.tsx`.
- **Component mới**: tạo folder theo nhóm chức năng, kèm file `*.module.css`
  cùng tên. Chỉ dùng token màu từ `index.css`.
- **Icon mới**: thêm vào [`src/components/ui/Icon.tsx`](src/components/ui/Icon.tsx)
  (SVG `currentColor`, stroke 1.6). **Không** cài thư viện icon. Icon không dùng
  thì xoá.
- **Chữ mới**: thêm key vào `vi.json` **và** `en.json`. Không bao giờ hard-code.
- **Edge cases**: handle 404 (param sai → `NotFoundView`), hết hàng, không có
  ảnh, list rỗng, lỗi nhập liệu (vd. email newsletter), `prefers-reduced-motion`.
- Trước khi commit: `npm run lint` **và** `npm run build` phải xanh.

---

## Nguồn dữ liệu

Dữ liệu cào một lần từ endpoint công khai của Haravan
(`/collections/all/products.json`) rồi chuẩn hoá. Danh mục **không** lấy theo
collection marketing lộn xộn của shop, mà suy ra từ `product_type` qua bộ luật
trong `scripts/categorize.mjs` (Áo / Quần / Phụ kiện + các danh mục con).
Chạy `npm run scrape` để cào lại.

Đây là dự án **demo frontend**; giỏ hàng/thanh toán chỉ mô phỏng phía client
(lưu `localStorage`), không có backend thật.
