import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Seo } from '../components/seo/Seo';
import styles from './NotFound.module.css';

/** Body of the 404 — reused by other pages when a param is invalid. */
export function NotFoundView() {
  const { t } = useTranslation();
  return (
    <div className={`container ${styles.wrap}`}>
      <p className={styles.code}>{t('notFound.code')}</p>
      <h1 className={styles.title}>{t('notFound.title')}</h1>
      <p className={styles.message}>{t('notFound.message')}</p>
      <div className={styles.actions}>
        <Link to="/" className="btn btn--primary">
          {t('notFound.cta')}
        </Link>
        <Link to="/shop" className="btn btn--outline">
          {t('notFound.shopCta')}
        </Link>
      </div>
    </div>
  );
}

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <>
      <Seo
        title={t('seo.notFoundTitle')}
        description={t('notFound.message')}
        path="/404"
        noindex
      />
      <NotFoundView />
    </>
  );
}
