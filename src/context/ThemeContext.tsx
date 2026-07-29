import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Read stored theme from localStorage or document class
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
    return document.documentElement.classList.contains('dark') ? 'dark' : 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => {
      const nextTheme = prev === 'dark' ? 'light' : 'dark';
      toast.success(`Switched to ${nextTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}`);
      return nextTheme;
    });
  };

  const setTheme = (newTheme: Theme) => {
    if (newTheme !== theme) {
      setThemeState(newTheme);
      toast.success(`Switched to ${newTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}`);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === 'dark',
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
