import { useMemo, useState, type ReactNode } from 'react';
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
  const [sort, setSort] = useState<SortKey>('featured');
  const [onlySale, setOnlySale] = useState(false);
  const [onlyStock, setOnlyStock] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);

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
            onClick={() => {
              setOnlyStock((v) => !v);
              setVisible(PAGE_SIZE);
            }}
          >
            {t('collection.inStock')}
          </button>
          <button
            type="button"
            className={`${styles.chip} ${onlySale ? styles.chipActive : ''}`}
            aria-pressed={onlySale}
            onClick={() => {
              setOnlySale((v) => !v);
              setVisible(PAGE_SIZE);
            }}
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
              onChange={(e) => setSort(e.target.value as SortKey)}
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
