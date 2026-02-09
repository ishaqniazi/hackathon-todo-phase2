'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiSkill } from '../services/api';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await apiSkill.logout();
      localStorage.removeItem('accessToken');
      apiSkill.removeToken();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local token even if server logout fails
      localStorage.removeItem('accessToken');
      apiSkill.removeToken();
      router.push('/login');
    }
  };

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-indigo-600">TodoApp</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/dashboard" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/dashboard" className="text-gray-700 hover:text-indigo-600 block px-3 py-2 rounded-md text-base font-medium">
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="text-gray-700 hover:text-indigo-600 block w-full text-left px-3 py-2 rounded-md text-base font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;