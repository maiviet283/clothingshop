import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { I18nextProvider } from 'react-i18next';
import type { Language } from '../../types';
import {
  DEFAULT_LANGUAGE,
  getInitialLanguage,
  persistLanguage,
  setupI18n,
} from '../../lib/i18n';

interface LanguageContextValue {
  language: Language;
  setLanguage: (l: Language) => void;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Start from the deterministic default so SSG markup matches first hydration.
  const i18n = useMemo(() => setupI18n(DEFAULT_LANGUAGE), []);
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);

  // After mount, upgrade from the SSR default to the stored preference.
  useEffect(() => {
    const preferred = getInitialLanguage();
    if (preferred !== language) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLanguageState(preferred);
      void i18n.changeLanguage(preferred);
    }
    document.documentElement.setAttribute('lang', preferred);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLanguage = useCallback(
    (l: Language) => {
      setLanguageState(l);
      void i18n.changeLanguage(l);
      persistLanguage(l);
      document.documentElement.setAttribute('lang', l);
    },
    [i18n],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      toggleLanguage: () => setLanguage(language === 'vi' ? 'en' : 'vi'),
    }),
    [language, setLanguage],
  );

  return (
    <I18nextProvider i18n={i18n}>
      <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
    </I18nextProvider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
