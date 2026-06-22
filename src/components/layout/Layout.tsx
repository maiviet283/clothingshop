import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ThemeProvider } from '../providers/ThemeProvider';
import { LanguageProvider } from '../providers/LanguageProvider';
import { CartProvider } from '../providers/CartProvider';
import { Header } from './Header';
import { Footer } from './Footer';
import { ScrollToTop } from './ScrollToTop';
import { CartDrawer } from '../cart/CartDrawer';
import { SearchOverlay } from '../search/SearchOverlay';

/** Inner shell — has access to providers above it. */
function Shell() {
  const { t } = useTranslation();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <a href="#main" className="skip-link">
        {t('nav.menu')}
      </a>
      <ScrollToTop />
      <Header onOpenSearch={() => setSearchOpen(true)} />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </>
  );
}

/**
 * Root layout element for every route. Providers live here so the entire tree
 * (including the SSG render) shares theme, language and cart state.
 */
export function Layout() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <CartProvider>
          <Shell />
        </CartProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
