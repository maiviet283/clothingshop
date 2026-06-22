import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import type { Language } from '../types';
import vi from '../locales/vi.json';
import en from '../locales/en.json';

export const LANGUAGES: Language[] = ['vi', 'en'];
export const DEFAULT_LANGUAGE: Language = 'vi';
const STORAGE_KEY = 'torano-lang';

/**
 * Resolve the initial language. On the server (SSG) and the very first client
 * paint we use the default so the pre-rendered HTML is deterministic and
 * crawler-friendly; the client then upgrades from localStorage after mount.
 */
export function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Language | null;
    if (stored && LANGUAGES.includes(stored)) return stored;
    const nav = window.navigator.language.slice(0, 2);
    if (nav === 'en') return 'en';
  } catch {
    /* localStorage unavailable */
  }
  return DEFAULT_LANGUAGE;
}

export function persistLanguage(lang: Language): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* ignore */
  }
}

/** Initialise a singleton i18next instance (idempotent across HMR / hydration). */
export function setupI18n(language: Language = DEFAULT_LANGUAGE): typeof i18n {
  if (!i18n.isInitialized) {
    void i18n.use(initReactI18next).init({
      resources: {
        vi: { translation: vi },
        en: { translation: en },
      },
      lng: language,
      fallbackLng: DEFAULT_LANGUAGE,
      supportedLngs: LANGUAGES,
      interpolation: { escapeValue: false },
      returnNull: false,
      react: { useSuspense: false },
    });
  } else if (i18n.language !== language) {
    void i18n.changeLanguage(language);
  }
  return i18n;
}

export default i18n;
