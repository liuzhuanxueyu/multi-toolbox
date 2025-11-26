import { useSettingsStore } from '../../store/settingsStore';
import { ThemeToggle } from '../ui/ThemeToggle';

export function Header() {
  const { theme } = useSettingsStore();

  return (
    <header className="h-16 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">
          个人助理工具箱
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        <span className="text-sm text-[var(--text-secondary)]">
          {theme === 'dark' ? '🌙' : theme === 'light' ? '☀️' : '🖥️'}
        </span>
      </div>
    </header>
  );
}

