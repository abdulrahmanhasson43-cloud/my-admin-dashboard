import { useState, useCallback, useEffect, useMemo, type ReactNode } from 'react';
import { ThemeContext } from '@/context/theme-context-value';
import type { Theme } from '@/context/theme-context-value';

const STORAGE_KEY = 'vuno_theme';

function loadTheme(): Theme {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === 'dark' || raw === 'light') return raw;
  } catch {
    // ignore
  }
  return 'light';
}

/** Dark-mode CSS variable overrides. Applied to :root when theme is dark. */
const darkVars: Record<string, string> = {
  '--vuno-primary': '#F5F5F7',
  '--vuno-primary-light': '#E5E5EA',
  '--vuno-primary-dark': '#FFFFFF',
  '--vuno-bg': '#0A0A0C',
  '--vuno-bg-parchment': '#0A0A0C',
  '--vuno-surface': '#1C1C1E',
  '--vuno-surface-elevated': '#2C2C2E',
  '--vuno-surface-pearl': '#1C1C1E',
  '--vuno-ink': '#F5F5F7',
  '--vuno-text': '#F5F5F7',
  '--vuno-text-secondary': '#AEAEB2',
  '--vuno-text-muted': '#636366',
  '--vuno-border': '#38383A',
  '--vuno-border-light': '#2C2C2E',
  '--vuno-hairline': '#38383A',
  '--vuno-surface-tile-1': '#3A3A3C',
  '--vuno-surface-tile-2': '#3A3A3C',
  '--vuno-surface-tile-3': '#2C2C2E',
  '--vuno-surface-tile-dark': '#48484A',
  '--vuno-primary-on-dark': '#0A0A0C',
  // Keep semantic colors (success/warning/danger) the same — they're vibrant enough
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(loadTheme);

  const applyTheme = useCallback((t: Theme) => {
    const root = document.documentElement;
    if (t === 'dark') {
      root.setAttribute('data-theme', 'dark');
      // Apply dark variables to :root
      Object.entries(darkVars).forEach(([key, val]) => {
        root.style.setProperty(key, val);
      });
    } else {
      root.removeAttribute('data-theme');
      // Remove dark variables so the original :root values take over
      Object.keys(darkVars).forEach(key => {
        root.style.removeProperty(key);
      });
    }
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    try { localStorage.setItem(STORAGE_KEY, t); } catch { /* ignore */ }
    applyTheme(t);
  }, [applyTheme]);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  // Apply theme on mount and whenever it changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  const value = useMemo(() => ({ theme, toggleTheme, setTheme }), [theme, toggleTheme, setTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
