/** Global site configuration used for SEO, canonical URLs and structured data. */
export const SITE = {
  name: 'TORANO',
  /** Production origin — used to build absolute canonical / OG URLs. */
  url: 'https://torano-shop.demo',
  twitter: '@torano',
  locales: { vi: 'vi_VN', en: 'en_US' },
} as const;

export function absoluteUrl(path: string): string {
  if (!path.startsWith('/')) path = `/${path}`;
  return `${SITE.url}${path}`;
}
