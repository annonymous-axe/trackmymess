import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const PALETTES = ['neon', 'teal', 'orange'];

  const [theme, setTheme] = useState(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      return savedTheme;
    }
    return 'system';
  });

  const [palette, setPaletteState] = useState(() => {
    const saved = localStorage.getItem('theme_palette');
    const initialPalette = PALETTES.includes(saved) ? saved : 'neon';
    return initialPalette;
  });

  const [resolvedTheme, setResolvedTheme] = useState('light');

  useEffect(() => {
    const getSystemTheme = () => {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    const updateResolvedTheme = () => {
      const newResolvedTheme = theme === 'system' ? getSystemTheme() : theme;
      setResolvedTheme(newResolvedTheme);

      // Apply theme to document
      if (newResolvedTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      }
    };

    updateResolvedTheme();

    // Listen for system theme changes
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => updateResolvedTheme();
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-palette', palette);
    localStorage.setItem('theme_palette', palette);
  }, [palette]);

  const changeTheme = (newTheme) => {
    if (['light', 'dark', 'system'].includes(newTheme)) {
      setTheme(newTheme);
      localStorage.setItem('theme', newTheme);
    }
  };

  const setPalette = (newPalette) => {
    if (PALETTES.includes(newPalette)) {
      setPaletteState(newPalette);
    }
  };

  const cyclePalette = () => {
    setPaletteState((prev) => {
      const idx = PALETTES.indexOf(prev);
      return PALETTES[(idx + 1) % PALETTES.length];
    });
  };

  const value = useMemo(() => ({
    theme,
    resolvedTheme,
    setTheme: changeTheme,
    isDark: resolvedTheme === 'dark',
    palette,
    setPalette,
    cyclePalette,
    availablePalettes: PALETTES,
  }), [theme, resolvedTheme, palette]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
