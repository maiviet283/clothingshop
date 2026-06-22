import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Product, SortKey } from '../../types';
import { sortProducts } from '../../lib/catalog';
import { ProductGrid } from '../product/ProductGrid';
import { Breadcrumb, type Crumb } from '../ui/Breadcrumb';
import { ChevronDownIcon } from '../ui/Icon';
import styles from './CollectionView.module.css';

interface CollectionViewProps {
  title: string;
  description?: string;
  products: Product[];
  crumbs: Crumb[];
  /** Optional sub-navigation (e.g. subcategory chips) rendered under the title. */
  subnav?: ReactNode;
}

const SORT_OPTIONS: SortKey[] = ['featured', 'price-asc', 'price-desc', 'newest', 'discount'];
const PAGE_SIZE = 12;

export function CollectionView({
  title,
  description,
  products,
  crumbs,
  subnav,
}: CollectionViewProps) {
  const { t } = useTranslation();
  // Filters/sort live in the URL so a filtered view is shareable and survives
  // navigating to a product and back. Pagination (load-more) stays local.
  const [params, setParams] = useSearchParams();

  const sortParam = params.get('sort') as SortKey | null;
  const sort: SortKey = sortParam && SORT_OPTIONS.includes(sortParam) ? sortParam : 'featured';
  const onlySale = params.get('sale') === '1';
  const onlyStock = params.get('stock') === '1';

  const [visible, setVisible] = useState(PAGE_SIZE);

  /** Merge a param patch into the URL (replace history, drop empty values). */
  const patchParams = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(patch)) {
      if (value == null || value === '') next.delete(key);
      else next.set(key, value);
    }
    setParams(next, { replace: true });
    setVisible(PAGE_SIZE);
  };

  // Reset pagination when the underlying product set changes (e.g. category nav,
  // where the route component is reused across params and isn't remounted).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(PAGE_SIZE);
  }, [products]);

  const filtered = useMemo(() => {
    let list = products;
    if (onlySale) list = list.filter((p) => p.compareAtPrice > p.minPrice);
    if (onlyStock) list = list.filter((p) => p.available);
    return sortProducts(list, sort);
  }, [products, sort, onlySale, onlyStock]);

  const shown = filtered.slice(0, visible);

  return (
    <div className="container">
      <Breadcrumb items={crumbs} />

      <header className={styles.head}>
        <h1 className={styles.title}>{title}</h1>
        {description && <p className={styles.desc}>{description}</p>}
        {subnav && <div className={styles.subnav}>{subnav}</div>}
      </header>

      <div className={styles.toolbar}>
        <span className={styles.count}>
          {t('collection.showing', {
            shown: shown.length,
            total: filtered.length,
            unit: t('common.products'),
          })}
        </span>

        <div className={styles.controls}>
          <button
            type="button"
            className={`${styles.chip} ${onlyStock ? styles.chipActive : ''}`}
            aria-pressed={onlyStock}
            onClick={() => patchParams({ stock: onlyStock ? null : '1' })}
          >
            {t('collection.inStock')}
          </button>
          <button
            type="button"
            className={`${styles.chip} ${onlySale ? styles.chipActive : ''}`}
            aria-pressed={onlySale}
            onClick={() => patchParams({ sale: onlySale ? null : '1' })}
          >
            {t('collection.onSale')}
          </button>

          <div className={styles.selectWrap}>
            <label htmlFor="sort" className="visually-hidden">
              {t('collection.sortLabel')}
            </label>
            <select
              id="sort"
              className={styles.select}
              value={sort}
              onChange={(e) =>
                patchParams({ sort: e.target.value === 'featured' ? null : e.target.value })
              }
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {t(`sort.${opt}`)}
                </option>
              ))}
            </select>
            <ChevronDownIcon className={styles.selectIcon} size={16} />
          </div>
        </div>
      </div>

      <div className={styles.body}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>{t('collection.empty')}</p>
            <p>{t('collection.emptyHint')}</p>
          </div>
        ) : (
          <>
            <ProductGrid products={shown} />
            {visible < filtered.length && (
              <div className={styles.loadMore}>
                <button
                  type="button"
                  className="btn btn--outline"
                  onClick={() => setVisible((v) => v + PAGE_SIZE)}
                >
                  {t('common.loadMore')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
