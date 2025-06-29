import React, { createContext, useContext, useState, useEffect } from 'react';

export const themes = {
  light: {
    background: 'linear-gradient(135deg, #e0f7fa 0%, #f1f8e9 100%)',
    text: '#181818',
    gridColor: '#e0e0e0',
    containerBg: '#faf8f5',
    containerBorder: '#181818',
    inputBg: '#f5f3f0',
  },
  dark: {
    background: 'linear-gradient(135deg, #1a1625 0%, #1f1b2e 25%, #252136 50%, #2d2a3e 70%, #3d3551 85%, #8b5fbf 100%)',
    text: '#ffffff',
    gridColor: 'rgba(255, 255, 255, 0.05)',
    containerBg: '#1f1b32',
    containerBorder: '#4a4458',
    inputBg: '#1a1729',
    buttonHoverBg: '#2a2538',
  }
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const theme = isDarkMode ? themes.dark : themes.light;

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
} 