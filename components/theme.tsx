// Centralized theme definitions and context
import React, { createContext, useContext, useState } from 'react';

export const themes = {
  dark: {
    background: '#181a20',
    card: '#23242a',
    text: '#fff',
    accent: '#4db8ff',
    period: '#ff5c8a',
    fertile: '#4db8ff',
    ovulation: '#9b59b6',
    border: '#333',
    gold: '#ffd166',
    error: '#ff5c5c',
    inputBg: '#23242a',
    inputText: '#fff',
    legendText: '#bbb',
    fabText: '#181a20',
    modalBg: '#23242a',
    borderWidth: 1,
  },
  light: {
    background: '#fff',
    card: '#f5f5f5',
    text: '#181a20',
    accent: '#007aff',
    period: '#ff5c8a',
    fertile: '#4db8ff',
    ovulation: '#ffb6c1',
    border: '#bbb', // slightly darker border for text inputs
    gold: '#ffd166',
    error: '#ff5c5c',
    inputBg: '#f3f3f6', // subtle grey background for text inputs
    inputText: '#181a20',
    legendText: '#555',
    fabText: '#fff',
    modalBg: '#f5f5f5',
    borderWidth: 1,
  },
};

export type Theme = typeof themes.dark;

const ThemeContext = createContext<{theme: Theme, setThemeName: (name: keyof typeof themes) => void, themeName: keyof typeof themes}>({
  theme: themes.dark,
  setThemeName: () => {},
  themeName: 'dark',
});

export default function ThemeProvider (children: React.ReactNode) {
  const [themeName, setThemeName] = useState<keyof typeof themes>('dark');
  const theme = themes[themeName];
  return (
    <ThemeContext.Provider value={{ theme, setThemeName, themeName }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
