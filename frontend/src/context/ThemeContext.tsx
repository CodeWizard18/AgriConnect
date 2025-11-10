import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n from '../i18n/i18n.js';

interface ThemeContextType {
  theme: 'light' | 'dark';
  language: 'en' | 'hi';
  toggleTheme: () => void;
  setLanguage: (lang: 'en' | 'hi') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [language, setLanguageState] = useState<'en' | 'hi'>('en');

  useEffect(() => {
    const storedTheme = localStorage.getItem('agriconnect_theme') as 'light' | 'dark';
    const storedLanguage = localStorage.getItem('agriconnect_language') as 'en' | 'hi';

    if (storedTheme) setTheme(storedTheme);
    if (storedLanguage) {
      setLanguageState(storedLanguage);
      i18n.changeLanguage(storedLanguage);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('agriconnect_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('agriconnect_language', language);
  }, [language]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setLanguage = (lang: 'en' | 'hi') => {
    setLanguageState(lang);
    i18n.changeLanguage(lang);
  };

  return (
    <ThemeContext.Provider value={{ theme, language, toggleTheme, setLanguage }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
