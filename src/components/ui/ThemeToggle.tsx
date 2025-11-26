import { useEffect } from 'react';
import { useSettingsStore } from '../../store/settingsStore';

export function ThemeToggle() {
  const { theme, setTheme } = useSettingsStore();

  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', systemDark);
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
  }, [theme]);

  const cycleTheme = () => {
    const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return (
    <button
      onClick={cycleTheme}
      className="px-3 py-1.5 rounded-lg bg-[var(--border-color)] text-[var(--text-primary)] text-sm hover:opacity-80 transition-opacity"
    >
      {theme === 'light' && '浅色'}
      {theme === 'dark' && '深色'}
      {theme === 'system' && '跟随系统'}
    </button>
  );
}

