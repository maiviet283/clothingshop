import { Head } from 'vite-react-ssg';
import { useLanguage } from '../providers/LanguageProvider';
import { SITE, absoluteUrl } from '../../lib/site';

interface SeoProps {
  title: string;
  description: string;
  /** Path-only canonical, e.g. "/ao/polo". */
  path: string;
  image?: string;
  type?: 'website' | 'product' | 'article';
  /** Optional JSON-LD structured data object. */
  jsonLd?: Record<string, unknown>;
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
  noindex = false,
}: SeoProps) {
  const { language } = useLanguage();
  const canonical = absoluteUrl(path);
  const ogImage = image || absoluteUrl('/og-default.svg');

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

      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Head>
  );
}
