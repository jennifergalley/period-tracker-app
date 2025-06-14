// Centralized theme definitions and context
import React, { createContext, useContext, useState } from 'react';
import { useAppState } from './AppStateContext';

export const themes = {
  dark: {
    background: '#181a20',
    card: '#23242a',
    text: '#fff',
    accent: '#4db8ff',
    period: '#e53935',
    fertile: '#4db8ff',
    ovulation: '#f768e9',
    border: '#333',
    todayColor: '#FFD700',
    error: '#ff5c5c',
    inputBg: '#23242a',
    inputText: '#fff',
    legendText: '#bbb',
    fabText: '#181a20',
    modalBg: '#23242a',
    borderWidth: 1,
    datePicker: 'dark',
  },
  light: {
    background: '#fff',
    card: '#f5f5f5',
    text: '#181a20',
    accent: '#007aff',
    period: '#ff5c8a',
    fertile: '#4db8ff',
    ovulation: '#f48fb1',
    border: '#bbb', // slightly darker border for text inputs
    todayColor: '#0ef22e',
    error: '#ff5c5c',
    inputBg: '#f3f3f6', // subtle grey background for text inputs
    inputText: '#181a20',
    legendText: '#555',
    fabText: '#fff',
    modalBg: '#f5f5f5',
    borderWidth: 1,
    datePicker: 'light',
  },
  blue: {
    background: '#eaf6ff',
    card: '#b3d8fd',
    text: '#1a2636',
    accent: '#1976d2',
    period: '#1976d2',
    fertile: '#64b5f6',
    ovulation: '#00bcd4',
    border: '#90caf9',
    todayColor: '#f20e38',
    error: '#e53935',
    inputBg: '#e3f2fd',
    inputText: '#1a2636',
    legendText: '#1976d2',
    fabText: '#fff',
    modalBg: '#b3d8fd',
    borderWidth: 1,
    datePicker: 'light',
  },
  pink: {
    background: '#fff0f6',
    card: '#f8bbd0',
    text: '#880e4f',
    accent: '#e91e63',
    period: '#e91e63',
    fertile: '#f06292',
    ovulation: '#FF00FF',
    border: '#f48fb1',
    todayColor: '#00FFFF',
    error: '#d32f2f',
    inputBg: '#fce4ec',
    inputText: '#880e4f',
    legendText: '#ad1457',
    fabText: '#fff',
    modalBg: '#f8bbd0',
    borderWidth: 1,
    datePicker: 'light',
  },
  mint: {
    background: '#e6fff7',
    card: '#b2f2e9',
    text: '#134e4a',
    accent: '#16807a', // darker teal for better contrast on selected tab
    period: '#16968f',
    fertile: '#48cbbf',
    ovulation: '#a3f7bf',
    border: '#99e2b4',
    todayColor: '#0000FF',
    error: '#ff6f61',
    inputBg: '#d0f5ea',
    inputText: '#134e4a',
    legendText: '#134e4a', // darker for tab bar readability
    fabText: '#fff',
    modalBg: '#b2f2e9',
    borderWidth: 1,
    datePicker: 'light',
  },
  purple: {
    background: '#f3e8ff',
    card: '#d1b3ff',
    text: '#3d246c',
    accent: '#8f5cff',
    period: '#8f5cff',
    fertile: '#c77dff', // sky blue for strong contrast
    ovulation: '#ff7ce5', // bright magenta-pink for contrast
    border: '#b39ddb',
    todayColor: '#f42c4e',
    error: '#b91c1c',
    inputBg: '#ede9fe',
    inputText: '#3d246c',
    legendText: '#7c3aed',
    fabText: '#fff',
    modalBg: '#d1b3ff',
    borderWidth: 1,
    datePicker: 'light',
  },
  sunny: {
    background: '#fffbe6',
    card: '#ffe066',
    text: '#7c4700',
    accent: '#ff8c00', // darker orange for better contrast on selected tab
    period: '#ff7043',
    fertile: '#ff8c00', // teal for high contrast
    ovulation: '#ffb300', // strong orange for contrast
    border: '#ffd166',
    todayColor: '#0000CD',
    error: '#d84315',
    inputBg: '#fffde7',
    inputText: '#7c4700',
    legendText: '#7c4700', // darker for tab bar readability
    fabText: '#fff',
    modalBg: '#ffe066',
    borderWidth: 1,
    datePicker: 'light',
  },
  red: {
    background: '#181a20',
    card: '#23242a',
    text: '#fff',
    accent: '#ff1744',
    period: '#ff1744',
    fertile: '#fe9fff',
    ovulation: '#ff0083',
    border: '#333',
    todayColor: '#0eacf2',
    error: '#ff5252',
    inputBg: '#23242a',
    inputText: '#fff',
    legendText: '#ff1744',
    fabText: '#181a20',
    modalBg: '#23242a',
    borderWidth: 1,
    datePicker: 'dark',
  },
};

export type Theme = typeof themes.dark;

// Remove ThemeProvider and ThemeContext, and instead provide a hook that uses AppStateContext

export const useTheme = () => {
  const { themeName, setThemeName } = useAppState();
  const validThemeName = (themeName in themes ? themeName : 'dark') as keyof typeof themes;
  const theme = themes[validThemeName];
  return { theme, setThemeName, themeName: validThemeName };
};
