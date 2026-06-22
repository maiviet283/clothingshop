import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { searchProducts } from '../../lib/catalog';
import { ProductCard } from '../product/ProductCard';
import { CloseIcon, SearchIcon } from '../ui/Icon';
import styles from './SearchOverlay.module.css';

interface SearchOverlayProps {
  onClose: () => void;
}

const MAX_PREVIEW = 8;

/** Rendered only while open (mounted by the parent), so state resets each time. */
export function SearchOverlay({ onClose }: SearchOverlayProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => searchProducts(query), [query]);

  // Focus the field shortly after the open animation begins.
  useEffect(() => {
    const id = window.setTimeout(() => inputRef.current?.focus(), 60);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = () => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  return (
    <>
      <div className={styles.overlay} onClick={onClose} aria-hidden="true" />
      <div className={styles.panel} role="dialog" aria-modal="true" aria-label={t('search.label')}>
        <div className="container">
          <div className={styles.searchRow}>
            <SearchIcon className={styles.icon} size={22} />
            <input
              ref={inputRef}
              type="search"
              className={styles.input}
              placeholder={t('search.placeholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              aria-label={t('search.label')}
            />
            <button type="button" className={styles.close} aria-label={t('search.close')} onClick={onClose}>
              <CloseIcon />
            </button>
          </div>

          <div className={styles.results}>
            {query.trim() === '' ? (
              <p className={styles.hint}>{t('search.empty')}</p>
            ) : results.length === 0 ? (
              <div className={styles.hint}>
                <p>{t('search.noResults')}</p>
              </div>
            ) : (
              <>
                <p className={styles.meta}>{t('search.countOther', { count: results.length })}</p>
                <div className={styles.grid}>
                  {results.slice(0, MAX_PREVIEW).map((product) => (
                    <ProductCard key={product.handle} product={product} />
                  ))}
                </div>
                {results.length > MAX_PREVIEW && (
                  <div className={styles.viewAll}>
                    <button type="button" className="btn btn--outline" onClick={submit}>
                      {t('common.viewAll')} ({results.length})
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
