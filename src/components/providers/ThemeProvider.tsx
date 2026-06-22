import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { ThemeMode } from '../../types';

interface ThemeContextValue {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (t: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = 'torano-theme';

function resolveInitialTheme(): ThemeMode {
  if (typeof document !== 'undefined') {
    const current = document.documentElement.getAttribute('data-theme');
    if (current === 'light' || current === 'dark') return current;
  }
  if (typeof window !== 'undefined') {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') return stored;
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    } catch {
      /* ignore */
    }
  }
  return 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(resolveInitialTheme);

  const applyTheme = useCallback((t: ThemeMode) => {
    setThemeState(t);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', t);
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, t);
    } catch {
      /* ignore */
    }
  }, []);

  // Sync DOM on mount (covers the SSG hydration path).
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme: applyTheme,
      toggleTheme: () => applyTheme(theme === 'dark' ? 'light' : 'dark'),
    }),
    [theme, applyTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
