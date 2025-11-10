import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function LanguageToggle() {
  const [showMenu, setShowMenu] = useState(false);
  const { language, setLanguage } = useTheme();

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-full shadow-lg transition-colors duration-200"
        >
          <Globe className="h-5 w-5" />
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-2 w-24 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50">
            <button
              onClick={() => { setLanguage('en'); setShowMenu(false); }}
              className={`block w-full text-left px-4 py-2 text-sm ${language === 'en' ? 'bg-gray-100 dark:bg-gray-700' : ''} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200`}
            >
              English
            </button>
            <button
              onClick={() => { setLanguage('hi'); setShowMenu(false); }}
              className={`block w-full text-left px-4 py-2 text-sm ${language === 'hi' ? 'bg-gray-100 dark:bg-gray-700' : ''} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200`}
            >
              हिन्दी
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
