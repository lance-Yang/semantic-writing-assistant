import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface ThemeToggleProps {
  onClick?: () => void;
}

export const SimpleThemeToggle: React.FC<ThemeToggleProps> = ({ onClick }) => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const nextTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'auto' : 'light';
    setTheme(nextTheme);
    onClick?.();
  };

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4 text-yellow-500" />;
      case 'dark':
        return <Moon className="h-4 w-4 text-blue-400" />;
      case 'auto':
        return <Monitor className="h-4 w-4 text-slate-500" />;
      default:
        return <Sun className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getThemeColor = () => {
    switch (theme) {
      case 'light':
        return 'bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200/60 dark:border-yellow-800/60';
      case 'dark':
        return 'bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200/60 dark:border-blue-800/60';
      case 'auto':
        return 'bg-gradient-to-r from-slate-100 to-gray-100 dark:from-slate-900/20 dark:to-gray-900/20 border-slate-200/60 dark:border-slate-800/60';
      default:
        return 'bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200/60 dark:border-yellow-800/60';
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className={`p-2.5 rounded-xl ${getThemeColor()} backdrop-blur-sm border hover:shadow-md transition-all duration-300 group interactive-hover interactive-press`}
      title={`当前主题: ${theme === 'light' ? '浅色' : theme === 'dark' ? '深色' : '跟随系统'}`}
    >
      <div className="transform group-hover:scale-110 transition-transform duration-200">
        {getIcon()}
      </div>
    </button>
  );
};