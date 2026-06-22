import { ViteReactSSG } from 'vite-react-ssg';
import { routes } from './routes';
import { setupI18n } from './lib/i18n';
import './index.css';

/**
 * SSG / hydration entry. `ViteReactSSG` wires up the react-router data router,
 * pre-renders every route returned by getStaticPaths to static HTML at build
 * time, and hydrates on the client.
 */
export const createRoot = ViteReactSSG(
  { routes },
  () => {
    // Ensure i18next is initialised before the first (server) render so the
    // pre-rendered markup contains real, translated copy for crawlers.
    setupI18n();
  },
);
