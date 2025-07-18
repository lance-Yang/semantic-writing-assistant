import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Palette, Sun, Moon, Monitor, Check } from 'lucide-react';
import { useTheme, themeColors } from '../../contexts/ThemeContext';

interface ThemeSelectorProps {
  onClick?: () => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ onClick }) => {
  const { themeConfig, setDarkMode, setColorTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  // Calculate dropdown position when opened
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8, // 8px gap
        left: rect.right - 320 // 320px is dropdown width, align to right
      });
    }
  }, [isOpen]);

  const toggleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
    onClick?.();
  };

  const selectColorTheme = (colorTheme: keyof typeof themeColors) => {
    setColorTheme(colorTheme);
    setIsOpen(false);
  };

  const selectDarkMode = (mode: 'light' | 'dark' | 'auto') => {
    setDarkMode(mode);
    setIsOpen(false);
  };

  const getDarkModeIcon = (mode: 'light' | 'dark' | 'auto') => {
    switch (mode) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      case 'auto':
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getColorPreview = (colorTheme: keyof typeof themeColors) => {
    const config = themeColors[colorTheme];
    const primaryRgb = config.cssVars['--theme-primary'];
    const accentRgb = config.cssVars['--theme-accent'];
    
    return (
      <div className="flex space-x-1">
        <div 
          className="w-3 h-3 rounded-full border border-white/20"
          style={{ backgroundColor: `rgb(${primaryRgb})` }}
        />
        <div 
          className="w-3 h-3 rounded-full border border-white/20"
          style={{ backgroundColor: `rgb(${accentRgb})` }}
        />
      </div>
    );
  };

  const getCurrentThemeColor = () => {
    const config = themeColors[themeConfig.colorTheme];
    const primaryRgb = config.cssVars['--theme-primary'];
    
    switch (themeConfig.darkMode) {
      case 'light':
        return `bg-gradient-to-r from-white/80 to-slate-50/80 border-slate-200/60 shadow-sm`;
      case 'dark':
        return `bg-gradient-to-r from-slate-800/80 to-slate-900/80 border-slate-700/60 shadow-lg`;
      case 'auto':
        return `bg-gradient-to-r from-slate-100/80 to-slate-200/80 dark:from-slate-800/80 dark:to-slate-900/80 border-slate-300/60 dark:border-slate-700/60`;
      default:
        return `bg-gradient-to-r from-white/80 to-slate-50/80 border-slate-200/60 shadow-sm`;
    }
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={toggleOpen}
        className={`p-2.5 rounded-xl ${getCurrentThemeColor()} backdrop-blur-sm border hover:shadow-md transition-all duration-300 group interactive-hover interactive-press`}
        title="主题设置"
      >
        <div className="transform group-hover:scale-110 transition-transform duration-200">
          <Palette className="h-4 w-4" style={{ color: `rgb(${themeColors[themeConfig.colorTheme].cssVars['--theme-primary']})` }} />
        </div>
      </button>

      {/* Portal-based dropdown */}
      {isOpen && createPortal(
        <div 
          className="fixed w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-[9999] overflow-hidden"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`
          }}
        >
          {/* Color Themes Section */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">颜色主题</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(themeColors).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => selectColorTheme(key as keyof typeof themeColors)}
                  className={`p-3 rounded-lg border transition-all duration-200 hover:shadow-md ${
                    themeConfig.colorTheme === key
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {config.name}
                    </span>
                    {themeConfig.colorTheme === key && (
                      <Check className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {config.description}
                    </span>
                    {getColorPreview(key as keyof typeof themeColors)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Dark Mode Section */}
          <div className="p-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">明暗模式</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { mode: 'light' as const, label: '浅色' },
                { mode: 'dark' as const, label: '深色' },
                { mode: 'auto' as const, label: '跟随系统' }
              ].map(({ mode, label }) => (
                <button
                  key={mode}
                  onClick={() => selectDarkMode(mode)}
                  className={`p-3 rounded-lg border transition-all duration-200 hover:shadow-md flex flex-col items-center space-y-2 ${
                    themeConfig.darkMode === mode
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                  }`}
                >
                  <div className={`${themeConfig.darkMode === mode ? 'text-blue-500' : 'text-slate-500 dark:text-slate-400'}`}>
                    {getDarkModeIcon(mode)}
                  </div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Overlay to close dropdown */}
      {isOpen && createPortal(
        <div 
          className="fixed inset-0 z-[9998]" 
          onClick={() => setIsOpen(false)}
        />,
        document.body
      )}
    </div>
  );
};