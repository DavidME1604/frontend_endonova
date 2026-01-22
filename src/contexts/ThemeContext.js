import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { lightTheme, darkTheme } from '../theme';

const ThemeContext = createContext();

const STORAGE_KEY = 'endonova-theme-mode';

// Detectar preferencia del sistema
const getSystemPreference = () => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

// Obtener modo guardado o preferencia del sistema
const getInitialMode = () => {
  if (typeof window !== 'undefined') {
    const savedMode = localStorage.getItem(STORAGE_KEY);
    if (savedMode === 'light' || savedMode === 'dark') {
      return savedMode;
    }
  }
  return getSystemPreference();
};

export const ThemeModeProvider = ({ children }) => {
  const [mode, setMode] = useState(getInitialMode);

  // Persistir en localStorage cuando cambia el modo
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  // Escuchar cambios en la preferencia del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      const savedMode = localStorage.getItem(STORAGE_KEY);
      // Solo actualizar si el usuario no ha elegido manualmente
      if (!savedMode) {
        setMode(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(() => (mode === 'dark' ? darkTheme : lightTheme), [mode]);

  const value = useMemo(
    () => ({
      mode,
      toggleTheme,
      isDarkMode: mode === 'dark',
    }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode debe usarse dentro de un ThemeModeProvider');
  }
  return context;
};

export default ThemeContext;
