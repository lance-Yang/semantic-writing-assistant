import React, { createContext, useContext, useEffect, useState } from 'react';

type DarkMode = 'light' | 'dark' | 'auto';
type ColorTheme = 'default' | 'tech' | 'nature' | 'business' | 'sunset' | 'ocean';

interface ThemeConfig {
  darkMode: DarkMode;
  colorTheme: ColorTheme;
}

interface ThemeContextType {
  themeConfig: ThemeConfig;
  setDarkMode: (mode: DarkMode) => void;
  setColorTheme: (theme: ColorTheme) => void;
  isDark: boolean;
  // Legacy support for existing components
  theme: DarkMode;
  setTheme: (theme: DarkMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme color configurations
export const themeColors = {
  default: {
    name: '默认',
    description: '经典蓝色主题',
    primary: 'blue',
    accent: 'indigo',
    cssVars: {
      '--theme-primary': '59 130 246', // blue-500
      '--theme-primary-dark': '37 99 235', // blue-600
      '--theme-accent': '99 102 241', // indigo-500
      '--theme-accent-dark': '79 70 229', // indigo-600
      '--theme-bg': '248 250 252', // slate-50
      '--theme-bg-dark': '15 23 42', // slate-900
    }
  },
  tech: {
    name: '科技感',
    description: '青色科技风格',
    primary: 'cyan',
    accent: 'teal',
    cssVars: {
      '--theme-primary': '6 182 212', // cyan-500
      '--theme-primary-dark': '8 145 178', // cyan-600
      '--theme-accent': '20 184 166', // teal-500
      '--theme-accent-dark': '13 148 136', // teal-600
      '--theme-bg': '240 253 255', // cyan-50
      '--theme-bg-dark': '8 47 73', // custom dark cyan
    }
  },
  nature: {
    name: '自然',
    description: '绿色自然主题',
    primary: 'green',
    accent: 'emerald',
    cssVars: {
      '--theme-primary': '34 197 94', // green-500
      '--theme-primary-dark': '22 163 74', // green-600
      '--theme-accent': '16 185 129', // emerald-500
      '--theme-accent-dark': '5 150 105', // emerald-600
      '--theme-bg': '240 253 244', // green-50
      '--theme-bg-dark': '20 83 45', // custom dark green
    }
  },
  business: {
    name: '商务',
    description: '深灰商务风格',
    primary: 'slate',
    accent: 'gray',
    cssVars: {
      '--theme-primary': '100 116 139', // slate-500
      '--theme-primary-dark': '71 85 105', // slate-600
      '--theme-accent': '107 114 128', // gray-500
      '--theme-accent-dark': '75 85 99', // gray-600
      '--theme-bg': '248 250 252', // slate-50
      '--theme-bg-dark': '30 41 59', // slate-800
    }
  },
  sunset: {
    name: '日落',
    description: '橙红渐变主题',
    primary: 'orange',
    accent: 'red',
    cssVars: {
      '--theme-primary': '249 115 22', // orange-500
      '--theme-primary-dark': '234 88 12', // orange-600
      '--theme-accent': '239 68 68', // red-500
      '--theme-accent-dark': '220 38 38', // red-600
      '--theme-bg': '255 247 237', // orange-50
      '--theme-bg-dark': '124 45 18', // custom dark orange
    }
  },
  ocean: {
    name: '海洋',
    description: '蓝绿海洋主题',
    primary: 'sky',
    accent: 'blue',
    cssVars: {
      '--theme-primary': '14 165 233', // sky-500
      '--theme-primary-dark': '2 132 199', // sky-600
      '--theme-accent': '59 130 246', // blue-500
      '--theme-accent-dark': '37 99 235', // blue-600
      '--theme-bg': '240 249 255', // sky-50
      '--theme-bg-dark': '12 74 110', // custom dark sky
    }
  }
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(() => {
    const savedDarkMode = localStorage.getItem('darkMode') as DarkMode;
    const savedColorTheme = localStorage.getItem('colorTheme') as ColorTheme;
    
    // Migration from old theme system
    const oldTheme = localStorage.getItem('theme') as DarkMode;
    
    return {
      darkMode: savedDarkMode || oldTheme || 'auto',
      colorTheme: savedColorTheme || 'default'
    };
  });

  const [isDark, setIsDark] = useState(false);

  const setDarkMode = (mode: DarkMode) => {
    setThemeConfig(prev => ({ ...prev, darkMode: mode }));
  };

  const setColorTheme = (theme: ColorTheme) => {
    setThemeConfig(prev => ({ ...prev, colorTheme: theme }));
  };

  // Legacy support
  const setTheme = (theme: DarkMode) => {
    setDarkMode(theme);
  };

  useEffect(() => {
    const updateTheme = () => {
      let shouldBeDark = false;

      if (themeConfig.darkMode === 'dark') {
        shouldBeDark = true;
      } else if (themeConfig.darkMode === 'light') {
        shouldBeDark = false;
      } else {
        // auto mode - check system preference
        shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      // Use requestAnimationFrame to ensure DOM updates are batched properly
      requestAnimationFrame(() => {
        setIsDark(shouldBeDark);
        
        // Apply dark mode class
        if (shouldBeDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }

        // Apply color theme CSS variables
        const colorConfig = themeColors[themeConfig.colorTheme];
        const root = document.documentElement;
        
        Object.entries(colorConfig.cssVars).forEach(([key, value]) => {
          root.style.setProperty(key, value);
        });

        // Add theme class for additional styling
        document.documentElement.className = document.documentElement.className
          .replace(/theme-\w+/g, '') + ` theme-${themeConfig.colorTheme}`;
      });
    };

    // Save to localStorage
    localStorage.setItem('darkMode', themeConfig.darkMode);
    localStorage.setItem('colorTheme', themeConfig.colorTheme);
    
    updateTheme();

    // Listen for system theme changes in auto mode
    if (themeConfig.darkMode === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', updateTheme);
      return () => mediaQuery.removeEventListener('change', updateTheme);
    }
  }, [themeConfig]);

  const value: ThemeContextType = {
    themeConfig,
    setDarkMode,
    setColorTheme,
    isDark,
    // Legacy support
    theme: themeConfig.darkMode,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};