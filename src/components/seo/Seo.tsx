import { Head } from 'vite-react-ssg';
import { useLanguage } from '../providers/LanguageProvider';
import { SITE, absoluteUrl } from '../../lib/site';

export interface BreadcrumbItem {
  name: string;
  /** Path-only, e.g. "/category/ao". Omit for the current page. */
  path?: string;
}

interface SeoProps {
  title: string;
  description: string;
  /** Path-only canonical, e.g. "/ao/polo". */
  path: string;
  image?: string;
  type?: 'website' | 'product' | 'article';
  /** Optional JSON-LD structured data object (or several). */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  /** Breadcrumb trail — emitted as BreadcrumbList structured data. */
  breadcrumbs?: BreadcrumbItem[];
  noindex?: boolean;
}

/**
 * Centralised document head. Renders on the server during SSG so the markup is
 * crawlable on first byte (title, meta description, OG/Twitter, canonical and
 * JSON-LD are all present in the static HTML).
 */
export function Seo({
  title,
  description,
  path,
  image,
  type = 'website',
  jsonLd,
  breadcrumbs,
  noindex = false,
}: SeoProps) {
  const { language } = useLanguage();
  const canonical = absoluteUrl(path);
  const ogImage = image || absoluteUrl('/og-default.svg');

  // Collect all structured-data blocks into one array of <script> payloads.
  const blocks: Record<string, unknown>[] = [];
  if (Array.isArray(jsonLd)) blocks.push(...jsonLd);
  else if (jsonLd) blocks.push(jsonLd);
  if (breadcrumbs && breadcrumbs.length > 0) {
    blocks.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((b, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: b.name,
        ...(b.path ? { item: absoluteUrl(b.path) } : {}),
      })),
    });
  }

  return (
    <Head>
      <html lang={language} />
      <title>{title}</title>
      <meta name="description" content={description} />
      {noindex ? (
        <meta name="robots" content="noindex,follow" />
      ) : (
        <meta name="robots" content="index,follow" />
      )}
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content={SITE.locales[language]} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {blocks.map((block, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(block)}
        </script>
      ))}
    </Head>
  );
}
