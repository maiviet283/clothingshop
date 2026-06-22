import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Logo } from '../brand/Logo';
import { useTheme } from '../providers/ThemeProvider';
import { useLanguage } from '../providers/LanguageProvider';
import { useCart } from '../providers/CartProvider';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { categories } from '../../lib/catalog';
import {
  BagIcon,
  ChevronDownIcon,
  CloseIcon,
  GlobeIcon,
  MenuIcon,
  MoonIcon,
  SearchIcon,
  SunIcon,
} from '../ui/Icon';
import styles from './Header.module.css';

interface HeaderProps {
  onOpenSearch: () => void;
}

export function Header({ onOpenSearch }: HeaderProps) {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const { count, open: openCart } = useCart();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  // Close the mobile drawer whenever the route changes (sync with the router).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDrawerOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  return (
    <>
    <header className={styles.header}>
      <div className="container">
        <div className={styles.bar}>
          <div className={styles.left}>
            <button
              type="button"
              className={`${styles.iconBtn} ${styles.menuBtn}`}
              aria-label={t('nav.openMenu')}
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen(true)}
            >
              <MenuIcon />
            </button>
          </div>

          <Link to="/" className={styles.brand} aria-label={t('brand.name')}>
            <Logo />
          </Link>

          <nav className={styles.nav} aria-label={t('nav.menu')}>
            {categories.map((cat) => (
              <div key={cat.key} className={styles.navItem}>
                <NavLink
                  to={`/category/${cat.key}`}
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
                  }
                >
                  {t(`category.${cat.key}`)}
                  {cat.subs.length > 0 && <ChevronDownIcon size={14} />}
                </NavLink>

                {cat.subs.length > 0 && (
                  <div className={styles.mega} role="menu">
                    <p className={styles.megaTitle}>{t(`category.${cat.key}`)}</p>
                    <div className={styles.megaList}>
                      {cat.subs.map((sub) => (
                        <Link
                          key={sub.key}
                          to={`/category/${cat.key}/${sub.key}`}
                          className={styles.megaLink}
                          role="menuitem"
                        >
                          {t(`subcategory.${sub.key}`)}
                          <span className={styles.megaCount}>{sub.count}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            <div className={styles.navItem}>
              <NavLink to="/collection/new" className={styles.navLink}>
                {t('nav.newArrivals')}
              </NavLink>
            </div>
            <div className={styles.navItem}>
              <NavLink to="/collection/sale" className={`${styles.navLink} ${styles.accentLink}`}>
                {t('nav.sale')}
              </NavLink>
            </div>
          </nav>

          <div className={styles.right}>
            <button
              type="button"
              className={styles.iconBtn}
              aria-label={t('search.open')}
              onClick={onOpenSearch}
            >
              <SearchIcon />
            </button>

            <button
              type="button"
              className={`${styles.iconBtn} ${styles.langBtn} ${styles.desktopAction}`}
              aria-label={t('language.toggle')}
              onClick={toggleLanguage}
            >
              {language === 'vi' ? 'VI' : 'EN'}
            </button>

            <button
              type="button"
              className={`${styles.iconBtn} ${styles.desktopAction}`}
              aria-label={t('theme.toggle')}
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>

            <button
              type="button"
              className={styles.iconBtn}
              aria-label={t('cart.open')}
              onClick={openCart}
            >
              <BagIcon />
              {count > 0 && <span className={styles.cartCount}>{count}</span>}
            </button>
          </div>
        </div>
      </div>

    </header>
    {/* Outside <header>: its backdrop-filter would break the fixed drawer layout */}
    {drawerOpen && (
      <MobileDrawer
        onClose={() => setDrawerOpen(false)}
        theme={theme}
        onToggleTheme={toggleTheme}
        language={language}
        onToggleLanguage={toggleLanguage}
      />
    )}
    </>
  );
}

interface MobileDrawerProps {
  onClose: () => void;
  theme: ReturnType<typeof useTheme>['theme'];
  onToggleTheme: () => void;
  language: ReturnType<typeof useLanguage>['language'];
  onToggleLanguage: () => void;
}

function MobileDrawer({
  onClose,
  theme,
  onToggleTheme,
  language,
  onToggleLanguage,
}: MobileDrawerProps) {
  const { t } = useTranslation();
  const trapRef = useFocusTrap<HTMLDivElement>();

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <>
      <div className={styles.overlay} onClick={onClose} aria-hidden="true" />
      <div ref={trapRef} className={styles.drawer} role="dialog" aria-modal="true" aria-label={t('nav.menu')}>
        <div className={styles.drawerHead}>
          <Logo size={28} />
          <button
            type="button"
            className={styles.iconBtn}
            aria-label={t('nav.closeMenu')}
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </div>

        <nav className={styles.drawerNav} aria-label={t('nav.menu')}>
          <Link to="/collection/new" className={styles.drawerTop}>
            {t('nav.newArrivals')}
          </Link>

          {categories.map((cat) => (
            <div key={cat.key} className={styles.drawerGroup}>
              <Link to={`/category/${cat.key}`} className={styles.drawerGroupTitle}>
                {t(`category.${cat.key}`)}
              </Link>
              {cat.subs.map((sub) => (
                <Link
                  key={sub.key}
                  to={`/category/${cat.key}/${sub.key}`}
                  className={styles.drawerLink}
                >
                  {t(`subcategory.${sub.key}`)}
                  <span className={styles.megaCount}>{sub.count}</span>
                </Link>
              ))}
            </div>
          ))}

          <Link to="/collection/sale" className={`${styles.drawerTop} ${styles.accentLink}`}>
            {t('nav.sale')}
          </Link>
          <Link to="/shop" className={styles.drawerTop}>
            {t('category.all')}
          </Link>
        </nav>

        <div className={styles.drawerActions}>
          <button
            type="button"
            className={styles.drawerActionBtn}
            onClick={onToggleLanguage}
          >
            <GlobeIcon size={18} />
            {language === 'vi' ? t('language.en') : t('language.vi')}
          </button>
          <button
            type="button"
            className={styles.drawerActionBtn}
            onClick={onToggleTheme}
          >
            {theme === 'dark' ? <SunIcon size={18} /> : <MoonIcon size={18} />}
            {theme === 'dark' ? t('theme.light') : t('theme.dark')}
          </button>
        </div>
      </div>
    </>
  );
}
