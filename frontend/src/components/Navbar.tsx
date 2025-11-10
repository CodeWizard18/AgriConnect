import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Menu, 
  X, 
  ShoppingCart, 
  Sun, 
  Moon, 
  Globe,
  Leaf,
  User,
  LogOut
} from 'lucide-react';
export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const { user, logout } = useAuth();
  const { getTotalItems } = useCart();
  const { theme, language, toggleTheme, setLanguage } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    if (!user) return [];
    
      switch (user.role) {
      case 'customer':
        return [
          { path: '/customer/dashboard', label: 'Dashboard' },
          { path: '/customer/browse', label: 'Browse Products' },
          { path: '/customer/orders', label: 'My Orders' }
        ];
      case 'farmer':
        return [
          { path: '/farmer/dashboard', label: 'Dashboard' },
          { path: '/farmer/listings', label: 'My Listings' },
          { path: '/farmer/orders', label: 'Orders' }
        ];
      case 'admin':
        return [
          { path: '/admin/dashboard', label: 'Dashboard' },
          { path: '/admin/moderation', label: 'Moderation' },
          { path: '/admin/phone-orders', label: 'Phone Orders' },
          { path: '/admin/analytics', label: 'Analytics' }
        ];
      default:
        return [];
    }
  };

  const getRoleColor = () => {
    switch (user?.role) {
      case 'farmer': return 'text-green-600 dark:text-green-400';
      case 'customer': return 'text-blue-600 dark:text-blue-400';
      case 'admin': return 'text-orange-600 dark:text-orange-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const navLinks = getNavLinks();

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Leaf className="h-8 w-8 text-green-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                AgriConnect
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side icons */}
          <div className="hidden md:flex items-center space-x-4">
            {user?.role === 'customer' && (
              <Link to="/customer/cart" className="relative">
                <ShoppingCart className="h-6 w-6 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </Link>
            )}
            
            {/* Language Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
              >
                <Globe className="h-5 w-5" />
              </button>

              {showLanguageMenu && (
                <div className="absolute right-0 mt-2 w-24 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50">
                  <button
                    onClick={() => { setLanguage('en'); setShowLanguageMenu(false); }}
                    className={`block w-full text-left px-4 py-2 text-sm ${language === 'en' ? 'bg-gray-100 dark:bg-gray-700' : ''} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => { setLanguage('hi'); setShowLanguageMenu(false); }}
                    className={`block w-full text-left px-4 py-2 text-sm ${language === 'hi' ? 'bg-gray-100 dark:bg-gray-700' : ''} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200`}
                  >
                    हिन्दी
                  </button>
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            {/* Profile Menu */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                >
                  <User className="h-5 w-5" />
                  <span className={`text-sm font-medium ${getRoleColor()}`}>
                    {user.name}
                  </span>
                </button>
                
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-md text-base font-medium transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile Theme and Language Toggles */}
            <div className="flex items-center justify-between px-3 py-2">
              {/* Language Toggle */}
              <div className="relative">
                <button
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                >
                  <Globe className="h-5 w-5" />
                  <span className="text-sm">{language === 'en' ? 'EN' : 'हिं'}</span>
                </button>

                {showLanguageMenu && (
                  <div className="absolute left-0 mt-2 w-24 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50">
                    <button
                      onClick={() => { setLanguage('en'); setShowLanguageMenu(false); }}
                      className={`block w-full text-left px-4 py-2 text-sm ${language === 'en' ? 'bg-gray-100 dark:bg-gray-700' : ''} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => { setLanguage('hi'); setShowLanguageMenu(false); }}
                      className={`block w-full text-left px-4 py-2 text-sm ${language === 'hi' ? 'bg-gray-100 dark:bg-gray-700' : ''} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200`}
                    >
                      हिन्दी
                    </button>
                  </div>
                )}
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
              >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                <span className="text-sm">{theme === 'light' ? 'Dark' : 'Light'}</span>
              </button>
            </div>

            {user && (
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-md text-base font-medium transition-colors duration-200"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}