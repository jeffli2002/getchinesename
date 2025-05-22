import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguageStore } from '@/store/index.js';
import { FiMenu, FiX } from 'react-icons/fi';

type Language = 'en' | 'fr';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, setLanguage } = useLanguageStore();
  const currentLanguage = (language || 'en') as Language;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 shadow-md sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-indigo-700">Chinese Name Generator</span>
            </Link>
          </div>

          {/* 桌面导航 */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
            <Link href="/" className="text-indigo-600 hover:text-indigo-800 font-medium">
              {currentLanguage === 'en' ? 'Home' : 'Accueil'}
            </Link>
            <Link href="#features" className="text-gray-600 hover:text-indigo-700 transition-colors duration-200">
              {currentLanguage === 'en' ? 'Features' : 'Fonctionnalités'}
            </Link>
            <Link href="#how-it-works" className="text-gray-600 hover:text-indigo-700 transition-colors duration-200">
              {currentLanguage === 'en' ? 'How It Works' : 'Comment ça marche'}
            </Link>
            <Link href="#testimonials" className="text-gray-600 hover:text-indigo-700 transition-colors duration-200">
              {currentLanguage === 'en' ? 'Testimonials' : 'Témoignages'}
            </Link>
            <Link href="#faq" className="text-gray-600 hover:text-indigo-700 transition-colors duration-200">
              {currentLanguage === 'en' ? 'FAQ' : 'FAQ'}
            </Link>
            <button
              onClick={() => setLanguage(currentLanguage === 'en' ? 'fr' : 'en')}
              className="ml-4 px-3 py-1 rounded-md bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors duration-200"
            >
              {currentLanguage === 'en' ? 'FR' : 'EN'}
            </button>
          </div>

          {/* 移动端菜单按钮 */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-indigo-700 hover:text-indigo-900 hover:bg-indigo-100 focus:outline-none"
            >
              {isMenuOpen ? (
                <FiX className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <FiMenu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* 移动端菜单 */}
      {isMenuOpen && (
        <div className="sm:hidden bg-white shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-indigo-700 bg-indigo-50"
              onClick={() => setIsMenuOpen(false)}
            >
              {currentLanguage === 'en' ? 'Home' : 'Accueil'}
            </Link>
            <Link
              href="#features"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-700 hover:bg-indigo-50"
              onClick={() => setIsMenuOpen(false)}
            >
              {currentLanguage === 'en' ? 'Features' : 'Fonctionnalités'}
            </Link>
            <Link
              href="#how-it-works"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-700 hover:bg-indigo-50"
              onClick={() => setIsMenuOpen(false)}
            >
              {currentLanguage === 'en' ? 'How It Works' : 'Comment ça marche'}
            </Link>
            <Link
              href="#testimonials"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-700 hover:bg-indigo-50"
              onClick={() => setIsMenuOpen(false)}
            >
              {currentLanguage === 'en' ? 'Testimonials' : 'Témoignages'}
            </Link>
            <Link
              href="#faq"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-700 hover:bg-indigo-50"
              onClick={() => setIsMenuOpen(false)}
            >
              {currentLanguage === 'en' ? 'FAQ' : 'FAQ'}
            </Link>
            <button
              onClick={() => {
                setLanguage(currentLanguage === 'en' ? 'fr' : 'en');
                setIsMenuOpen(false);
              }}
              className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-700 hover:bg-indigo-50"
            >
              {currentLanguage === 'en' ? 'Français' : 'English'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header; 