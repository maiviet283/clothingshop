import type { Language } from '../types';

// Non-breaking space (U+00A0) keeps the amount and the ₫ sign on one line.
const NBSP = String.fromCharCode(0xa0);

/** Format a VND price. Torano prices are whole VND integers. */
export function formatPrice(value: number, lang: Language = 'vi'): string {
  const locale = lang === 'en' ? 'en-US' : 'vi-VN';
  const formatted = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
  }).format(Math.round(value));
  return `${formatted}${NBSP}₫`;
}

/** Discount percentage from compare-at price; 0 when not on sale. */
export function discountPercent(price: number, compareAt: number): number {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

/** Resize a Haravan/hstatic CDN image to a target width for responsive loading. */
export function cdnImage(url: string, width: number): string {
  if (!url) return url;
  // hstatic supports _<w>x<h> style suffixes; swap our baked-in _1024x1024.
  return url.replace(/_(\d+)x(\d*)\./, `_${width}x.`);
}

/** Responsive srcset string from the CDN resizer. */
export function cdnSrcSet(url: string, widths: number[]): string {
  if (!url) return '';
  return widths.map((w) => `${cdnImage(url, w)} ${w}w`).join(', ');
}
