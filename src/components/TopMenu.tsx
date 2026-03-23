'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { logout } from '@/redux/features/authSlice';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';

export default function TopMenu() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/');
    setIsMenuOpen(false);
    setIsAdminDropdownOpen(false);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setIsAdminDropdownOpen(false);
  };

  const isAdminPage = pathname?.startsWith('/admin');

  return (
    <nav className="w-full bg-[#2C1E18] border-b border-[#403A36]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Dungeon Inn"
              width={40}
              height={40}
              className="w-10 h-10 object-contain"
            />
            {/* Show title only on desktop (md and up) */}
            <span className="hidden md:block text-2xl font-bold text-[#E57A00]">Dungeon Inn</span>
          </Link>

          {/* Desktop Navigation Links - hidden on mobile */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/shops"
              className="text-[#D4CFC6] hover:text-[#E57A00] transition-colors font-medium"
            >
              Shops
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  href="/mybookings"
                  className="text-[#D4CFC6] hover:text-[#E57A00] transition-colors font-medium"
                >
                  My Bookings
                </Link>
                
                {user?.role === 'admin' && (
                  <div className="relative">
                    <button
                      onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}
                      className={`flex items-center gap-1 font-medium transition-colors ${
                        isAdminPage ? 'text-[#E57A00]' : 'text-[#D4CFC6] hover:text-[#E57A00]'
                      }`}
                    >
                      Admin
                      <svg
                        className={`w-4 h-4 transition-transform ${isAdminDropdownOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* Admin Dropdown */}
                    {isAdminDropdownOpen && (
                      <div className="absolute top-full right-0 mt-2 w-48 bg-[#2B2B2B] border border-[#403A36] rounded-lg shadow-lg py-2 z-50">
                        <Link
                          href="/admin/bookings"
                          onClick={() => setIsAdminDropdownOpen(false)}
                          className={`block px-4 py-2 transition-colors ${
                            pathname === '/admin/bookings' 
                              ? 'text-[#E57A00] bg-[#1A1A1A]' 
                              : 'text-[#D4CFC6] hover:text-[#E57A00] hover:bg-[#1A1A1A]'
                          }`}
                        >
                          📋 Bookings
                        </Link>
                        <Link
                          href="/admin/shops"
                          onClick={() => setIsAdminDropdownOpen(false)}
                          className={`block px-4 py-2 transition-colors ${
                            pathname === '/admin/shops' 
                              ? 'text-[#E57A00] bg-[#1A1A1A]' 
                              : 'text-[#D4CFC6] hover:text-[#E57A00] hover:bg-[#1A1A1A]'
                          }`}
                        >
                          🏪 Shops
                        </Link>
                        <Link
                          href="/admin/services"
                          onClick={() => setIsAdminDropdownOpen(false)}
                          className={`block px-4 py-2 transition-colors ${
                            pathname === '/admin/services' 
                              ? 'text-[#E57A00] bg-[#1A1A1A]' 
                              : 'text-[#D4CFC6] hover:text-[#E57A00] hover:bg-[#1A1A1A]'
                          }`}
                        >
                          💆 Services
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-[#403A36]">
                  <span className="text-[#A88C6B]">{user?.name}</span>
                  <button
                    onClick={handleLogout}
                    className="text-red-400 hover:text-red-300 transition-colors font-medium"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-[#D4CFC6] hover:text-[#E57A00] transition-colors font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-[#E57A00] text-[#1A110A] font-bold rounded hover:bg-[#c46a00] transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 focus:outline-none"
            aria-label="Toggle menu"
          >
            <span className={`block w-6 h-0.5 bg-[#D4CFC6] transition-transform duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-6 h-0.5 bg-[#D4CFC6] transition-opacity duration-300 ${isMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-0.5 bg-[#D4CFC6] transition-transform duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="py-4 border-t border-[#403A36] flex flex-col gap-4">
            <Link
              href="/shops"
              onClick={closeMenu}
              className="text-[#D4CFC6] hover:text-[#E57A00] transition-colors font-medium py-2"
            >
              Shops
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  href="/mybookings"
                  onClick={closeMenu}
                  className="text-[#D4CFC6] hover:text-[#E57A00] transition-colors font-medium py-2"
                >
                  My Bookings
                </Link>
                
                {user?.role === 'admin' && (
                  <div className="border-l-2 border-[#E57A00] pl-4">
                    <p className="text-[#E57A00] font-medium mb-2">Admin</p>
                    <div className="flex flex-col gap-2">
                      <Link
                        href="/admin/bookings"
                        onClick={closeMenu}
                        className={`py-2 pl-2 ${pathname === '/admin/bookings' ? 'text-[#E57A00]' : 'text-[#D4CFC6] hover:text-[#E57A00]'}`}
                      >
                        📋 Bookings
                      </Link>
                      <Link
                        href="/admin/shops"
                        onClick={closeMenu}
                        className={`py-2 pl-2 ${pathname === '/admin/shops' ? 'text-[#E57A00]' : 'text-[#D4CFC6] hover:text-[#E57A00]'}`}
                      >
                        🏪 Shops
                      </Link>
                      <Link
                        href="/admin/services"
                        onClick={closeMenu}
                        className={`py-2 pl-2 ${pathname === '/admin/services' ? 'text-[#E57A00]' : 'text-[#D4CFC6] hover:text-[#E57A00]'}`}
                      >
                        💆 Services
                      </Link>
                    </div>
                  </div>
                )}

                <div className="border-t border-[#403A36] pt-4 mt-2">
                  <span className="text-[#A88C6B] block py-2">{user?.name}</span>
                  <button
                    onClick={handleLogout}
                    className="text-red-400 hover:text-red-300 transition-colors font-medium py-2"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="text-[#D4CFC6] hover:text-[#E57A00] transition-colors font-medium py-2"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={closeMenu}
                  className="px-4 py-2 bg-[#E57A00] text-[#1A110A] font-bold rounded hover:bg-[#c46a00] transition-colors text-center"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
