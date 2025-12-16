'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';
import db from '../lib/instantdb';
import SimulationDatePicker from './SimulationDatePicker';

export default function Navbar() {
  const pathname = usePathname();
  const { language, toggleLanguage, t } = useLanguage();
  const { user: authUser } = db.useAuth();
  
  // Check for demo mode
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  useEffect(() => {
    const demoMode = localStorage.getItem('demoMode') === 'true';
    setIsDemoMode(demoMode);
  }, []);
  
  const user = authUser || isDemoMode;

  const navItems = [
    { name: t('portfolio'), path: '/portfolio' },
    { name: t('trade'), path: '/trade' },
    { name: t('history'), path: '/history' },
  ];

  const handleLogout = () => {
    db.auth.signOut();
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center">
            <Link href="/portfolio" className="flex items-center space-x-2">
              <span className="text-2xl">📈</span>
              <span className="text-xl font-bold text-gray-900">
                RealPaperTrading
              </span>
            </Link>
          </div>

          {/* Navigation Links & Date Picker */}
          {user && (
            <div className="hidden md:flex items-center space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === item.path
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <div className="border-l border-gray-300 h-8"></div>
              <SimulationDatePicker />
            </div>
          )}

          {/* Right Side - Language Toggle & User Info */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="px-3 py-1 rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              {language === 'en' ? '🇱🇹 LT' : '🇬🇧 EN'}
            </button>

            {/* User Info & Logout */}
            {user && (
              <>
                <span className="text-sm text-gray-700">
                  {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  {t('logout')}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {user && (
          <div className="md:hidden pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === item.path
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}

