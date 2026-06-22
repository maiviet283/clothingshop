import { useMemo, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Seo } from '../components/seo/Seo';
import { ProductGrid } from '../components/product/ProductGrid';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { searchProducts } from '../lib/catalog';
import styles from './Search.module.css';

export default function Search() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const [draft, setDraft] = useState(query);

  const results = useMemo(() => searchProducts(query), [query]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = draft.trim();
    setParams(q ? { q } : {});
  };

  return (
    <>
      <Seo
        title={query ? `${t('search.resultsFor')} “${query}” — ${t('brand.name')}` : t('seo.searchTitle')}
        description={t('seo.homeDesc')}
        path={query ? `/search?q=${encodeURIComponent(query)}` : '/search'}
        noindex
      />

      <div className="container">
        <Breadcrumb
          items={[
            { label: t('breadcrumb.home'), to: '/' },
            { label: t('search.title') },
          ]}
        />

        <header className={styles.head}>
          <p className={styles.eyebrow}>{t('search.title')}</p>
          {query ? (
            <h1 className={styles.title}>
              {t('search.resultsFor')} <span>“{query}”</span>
            </h1>
          ) : (
            <h1 className={styles.title}>{t('search.title')}</h1>
          )}
          {query && (
            <p className={styles.meta}>{t('search.countOther', { count: results.length })}</p>
          )}

          <form className={styles.form} onSubmit={onSubmit} role="search">
            <label htmlFor="search-page-input" className="visually-hidden">
              {t('search.label')}
            </label>
            <input
              id="search-page-input"
              type="search"
              className={styles.input}
              placeholder={t('search.placeholder')}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <button type="submit" className="btn btn--primary">
              {t('search.submit')}
            </button>
          </form>
        </header>

        <div className={styles.body}>
          {query === '' ? (
            <div className={styles.empty}>
              <p className={styles.emptyHint}>{t('search.empty')}</p>
            </div>
          ) : results.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>{t('search.noResults')}</p>
              <p className={styles.emptyHint}>{t('search.noResultsHint')}</p>
            </div>
          ) : (
            <ProductGrid products={results} priorityCount={4} />
          )}
        </div>
      </div>
    </>
  );
}
