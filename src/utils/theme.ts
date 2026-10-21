export type ThemePreference = 'escuro' | 'claro' | 'sistema';

export const THEME_KEY = 'devpath:theme';

export function readTheme(): ThemePreference {
  try {
    const value = window.localStorage.getItem(THEME_KEY);
    return value === 'claro' || value === 'sistema' ? value : 'escuro';
  } catch {
    return 'escuro';
  }
}

/** Aplica o tema no <html>. O escuro é o padrão. */
export function applyTheme(preference: ThemePreference) {
  const prefersLight = window.matchMedia?.('(prefers-color-scheme: light)').matches;
  const resolved = preference === 'sistema' ? (prefersLight ? 'light' : 'dark') : preference === 'claro' ? 'light' : 'dark';
  document.documentElement.dataset.theme = resolved;
}

export function saveTheme(preference: ThemePreference) {
  try {
    window.localStorage.setItem(THEME_KEY, preference);
  } catch {
    // preferência só nesta sessão
  }
  applyTheme(preference);
}
