import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      onClick={toggle}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative inline-flex items-center h-8 w-14 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 transition-colors"
    >
      <span
        className={`absolute top-0.5 left-0.5 h-7 w-7 rounded-full bg-white dark:bg-slate-900 shadow flex items-center justify-center transition-transform ${
          isDark ? 'translate-x-6' : 'translate-x-0'
        }`}
      >
        {isDark ? (
          <Moon className="h-4 w-4 text-brand-400" />
        ) : (
          <Sun className="h-4 w-4 text-amber-500" />
        )}
      </span>
    </button>
  );
}
