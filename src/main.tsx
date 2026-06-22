import { ViteReactSSG } from 'vite-react-ssg';
import { routes } from './routes';
import { setupI18n } from './lib/i18n';
import './index.css';

/* SSG / hydration entry: pre-renders every route to static HTML, then hydrates. */
export const createRoot = ViteReactSSG(
  { routes },
  () => {
    // Init i18next before the first render so the markup is translated.
    setupI18n();
  },
);
