import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Logo } from '../brand/Logo';
import { FacebookIcon, InstagramIcon, YoutubeIcon } from '../ui/Icon';
import styles from './Footer.module.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Footer() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle');

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setStatus('error');
      return;
    }
    setStatus('ok');
    setEmail('');
  };

  const shopLinks = [
    { to: '/collection/new', label: t('footer.links.newArrivals') },
    { to: '/shop', label: t('category.all') },
    { to: '/collection/sale', label: t('footer.links.sale') },
    { to: '/category/ao', label: t('category.ao') },
    { to: '/category/quan', label: t('category.quan') },
  ];
  const helpLinks = [
    'sizeGuide',
    'shipping',
    'returns',
    'faq',
    'contact',
  ] as const;
  const aboutLinks = ['story', 'stores', 'careers', 'privacy'] as const;

  return (
    <footer className={styles.footer}>
      <div className={styles.newsletter}>
        <div className={`container ${styles.newsletterInner}`}>
          <div>
            <h2 className={styles.newsletterTitle}>{t('footer.newsletterTitle')}</h2>
            <p className={styles.newsletterDesc}>{t('footer.newsletterDesc')}</p>
          </div>
          <div>
            <form className={styles.form} onSubmit={onSubmit} noValidate>
              <label htmlFor="newsletter-email" className="visually-hidden">
                {t('footer.emailPlaceholder')}
              </label>
              <input
                id="newsletter-email"
                type="email"
                className={`${styles.input} ${status === 'error' ? styles.inputError : ''}`}
                placeholder={t('footer.emailPlaceholder')}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status !== 'idle') setStatus('idle');
                }}
                aria-invalid={status === 'error'}
              />
              <button type="submit" className="btn btn--primary">
                {t('footer.subscribe')}
              </button>
            </form>
            {status === 'ok' && (
              <p className={`${styles.feedback} ${styles.feedbackOk}`}>
                {t('footer.subscribed')}
              </p>
            )}
            {status === 'error' && (
              <p className={`${styles.feedback} ${styles.feedbackErr}`}>
                {t('footer.invalidEmail')}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className={`container ${styles.main}`}>
        <div className={styles.brandCol}>
          <Logo size={30} />
          <p className={styles.brandText}>{t('home.storyBody')}</p>
          <div className={styles.socials}>
            <a href="https://instagram.com" className={styles.social} aria-label="Instagram" target="_blank" rel="noreferrer noopener">
              <InstagramIcon />
            </a>
            <a href="https://facebook.com" className={styles.social} aria-label="Facebook" target="_blank" rel="noreferrer noopener">
              <FacebookIcon />
            </a>
            <a href="https://youtube.com" className={styles.social} aria-label="YouTube" target="_blank" rel="noreferrer noopener">
              <YoutubeIcon />
            </a>
          </div>
        </div>

        <nav className={styles.col} aria-label={t('footer.shopCol')}>
          <h3 className={styles.colTitle}>{t('footer.shopCol')}</h3>
          <ul className={styles.colList}>
            {shopLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className={styles.col} aria-label={t('footer.helpCol')}>
          <h3 className={styles.colTitle}>{t('footer.helpCol')}</h3>
          <ul className={styles.colList}>
            {helpLinks.map((k) => (
              <li key={k}>
                <Link to="/shop">{t(`footer.links.${k}`)}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className={styles.col} aria-label={t('footer.aboutCol')}>
          <h3 className={styles.colTitle}>{t('footer.aboutCol')}</h3>
          <ul className={styles.colList}>
            {aboutLinks.map((k) => (
              <li key={k}>
                <Link to="/shop">{t(`footer.links.${k}`)}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className={styles.col} aria-label={t('footer.followCol')}>
          <h3 className={styles.colTitle}>{t('footer.followCol')}</h3>
          <ul className={styles.colList}>
            <li><a href="https://instagram.com" target="_blank" rel="noreferrer noopener">Instagram</a></li>
            <li><a href="https://facebook.com" target="_blank" rel="noreferrer noopener">Facebook</a></li>
            <li><a href="https://youtube.com" target="_blank" rel="noreferrer noopener">YouTube</a></li>
            <li><a href="https://tiktok.com" target="_blank" rel="noreferrer noopener">TikTok</a></li>
          </ul>
        </nav>
      </div>

      <div className={`container ${styles.bottom}`}>
        <p>© {new Date().getFullYear()} {t('brand.name')}. {t('footer.rights')}</p>
        <p>{t('footer.madeWith')}</p>
      </div>
    </footer>
  );
}
