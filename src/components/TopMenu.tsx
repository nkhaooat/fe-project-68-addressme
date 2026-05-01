'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { logout } from '@/redux/features/authSlice';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

export default function TopMenu() {
  const { user, isAuthenticated, token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMobileAdminOpen, setIsMobileAdminOpen] = useState(false);

  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Close user dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/');
    setIsMenuOpen(false);
    setIsAdminDropdownOpen(false);
    setIsUserDropdownOpen(false);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setIsAdminDropdownOpen(false);
    setIsUserDropdownOpen(false);
    setIsMobileAdminOpen(false);
  };

  const isAdminPage = pathname?.startsWith('/admin');

  return (
    <>
      <nav className="w-full bg-dungeon-primary-header border-b border-dungeon-outline">
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
              <span className="hidden md:block text-2xl font-bold text-dungeon-accent">Dungeon Inn</span>
            </Link>

            {/* Desktop Navigation Links - hidden on mobile */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/shops"
                className="text-dungeon-primary hover:text-dungeon-accent transition-colors font-medium"
              >
                Shops
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    href="/mybookings"
                    className="text-dungeon-primary hover:text-dungeon-accent transition-colors font-medium"
                  >
                    My Bookings
                  </Link>
                  
                  {user?.role === 'merchant' && user?.merchantStatus === 'approved' && (
                    <Link
                      href="/merchant"
                      className={pathname === '/merchant' ? 'font-medium text-dungeon-accent' : 'font-medium text-dungeon-primary hover:text-dungeon-accent'}
                    >
                      Merchant Dashboard
                    </Link>
                  )}
                  {user?.role === 'merchant' && user?.merchantStatus !== 'approved' && (
                    <Link
                      href="/merchant"
                      className="font-medium text-yellow-400 hover:text-dungeon-accent"
                    >
                      Pending Approval
                    </Link>
                  )}
                  
                  {user?.role === 'admin' && (
                    <div className="relative">
                      <button
                        onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}
                        className={`flex items-center gap-1 font-medium transition-colors ${
                          isAdminPage ? 'text-dungeon-accent' : 'text-dungeon-primary hover:text-dungeon-accent'
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
                        <div className="absolute top-full right-0 mt-2 w-48 bg-dungeon-surface border border-dungeon-outline rounded-lg shadow-lg py-2 z-50">
                          <Link
                            href="/admin/bookings"
                            onClick={() => setIsAdminDropdownOpen(false)}
                            className={`block px-4 py-2 transition-colors ${
                              pathname === '/admin/bookings' 
                                ? 'text-dungeon-accent bg-dungeon-canvas' 
                                : 'text-dungeon-primary hover:text-dungeon-accent hover:bg-dungeon-canvas'
                            }`}
                          >
                            📋 Bookings
                          </Link>
                          <Link
                            href="/admin/shops"
                            onClick={() => setIsAdminDropdownOpen(false)}
                            className={`block px-4 py-2 transition-colors ${
                              pathname === '/admin/shops' 
                                ? 'text-dungeon-accent bg-dungeon-canvas' 
                                : 'text-dungeon-primary hover:text-dungeon-accent hover:bg-dungeon-canvas'
                            }`}
                          >
                            🏪 Shops
                          </Link>
                          <Link
                            href="/admin/services"
                            onClick={() => setIsAdminDropdownOpen(false)}
                            className={`block px-4 py-2 transition-colors ${
                              pathname === '/admin/services' 
                                ? 'text-dungeon-accent bg-dungeon-canvas' 
                                : 'text-dungeon-primary hover:text-dungeon-accent hover:bg-dungeon-canvas'
                            }`}
                          >
                            💆 Services
                          </Link>
                          <Link
                            href="/admin/promotions"
                            onClick={() => setIsAdminDropdownOpen(false)}
                            className={`block px-4 py-2 transition-colors ${
                              pathname === '/admin/promotions' 
                                ? 'text-dungeon-accent bg-dungeon-canvas' 
                                : 'text-dungeon-primary hover:text-dungeon-accent hover:bg-dungeon-canvas'
                            }`}
                          >
                            🏷️ Promotions
                          </Link>
                          <Link
                            href="/admin/merchants"
                            onClick={() => setIsAdminDropdownOpen(false)}
                            className={pathname === '/admin/merchants' ? 'block px-4 py-2 text-dungeon-accent bg-dungeon-canvas' : 'block px-4 py-2 text-dungeon-primary hover:text-dungeon-accent hover:bg-dungeon-canvas'}
                          >
                            Merchants
                          </Link>
                          <hr className="border-dungeon-outline my-1" />
                          <Link
                            href="/admin/settings"
                            onClick={() => setIsAdminDropdownOpen(false)}
                            className={pathname === '/admin/settings' ? 'block px-4 py-2 text-dungeon-accent bg-dungeon-canvas' : 'block px-4 py-2 text-dungeon-primary hover:text-dungeon-accent hover:bg-dungeon-canvas'}
                          >
                            Settings
                          </Link>
                        </div>
                      )}
                    </div>
                  )}

                  {/* User name dropdown */}
                  <div className="flex items-center gap-3 ml-4 pl-4 border-l border-dungeon-outline">
                    <div className="relative" ref={userDropdownRef}>
                      <button
                        onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                        className="flex items-center gap-1 text-dungeon-sub-header hover:text-dungeon-accent transition-colors font-medium"
                      >
                        {user?.name}
                        <svg
                          className={`w-3.5 h-3.5 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* User dropdown */}
                      {isUserDropdownOpen && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-dungeon-surface border border-dungeon-outline rounded-lg shadow-lg py-2 z-50">
                          <Link
                            href="/profile"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="block px-4 py-2 text-dungeon-primary hover:text-dungeon-accent hover:bg-dungeon-canvas transition-colors"
                          >
                            My Profile
                          </Link>
                          <Link
                            href="/profile/password"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="block px-4 py-2 text-dungeon-primary hover:text-dungeon-accent hover:bg-dungeon-canvas transition-colors"
                          >
                            Change Password
                          </Link>
                          <hr className="border-dungeon-outline my-1" />
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-red-400 hover:text-red-300 hover:bg-dungeon-canvas transition-colors"
                          >
                            Logout
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-dungeon-primary hover:text-dungeon-accent transition-colors font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 bg-dungeon-accent text-dungeon-dark-text font-bold rounded hover:bg-dungeon-accent-dark transition-colors"
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
              <span className={`block w-6 h-0.5 bg-dungeon-primary transition-transform duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-6 h-0.5 bg-dungeon-primary transition-opacity duration-300 ${isMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-6 h-0.5 bg-dungeon-primary transition-transform duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>

          {/* Mobile Dropdown Menu */}
          <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-[80vh] opacity-100 overflow-y-auto' : 'max-h-0 opacity-0'}`}>
            <div className="py-4 border-t border-dungeon-outline flex flex-col gap-4">
              <Link
                href="/shops"
                onClick={closeMenu}
                className="text-dungeon-primary hover:text-dungeon-accent transition-colors font-medium py-2"
              >
                Shops
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    href="/mybookings"
                    onClick={closeMenu}
                    className="text-dungeon-primary hover:text-dungeon-accent transition-colors font-medium py-2"
                  >
                    My Bookings
                  </Link>
                  
                  {user?.role === 'merchant' && user?.merchantStatus === 'approved' && (
                    <Link
                      href="/merchant"
                      onClick={closeMenu}
                      className="text-dungeon-primary hover:text-dungeon-accent transition-colors font-medium py-2"
                    >
                      Merchant Dashboard
                    </Link>
                  )}
                  {user?.role === 'merchant' && user?.merchantStatus !== 'approved' && (
                    <Link
                      href="/merchant"
                      onClick={closeMenu}
                      className="text-yellow-400 hover:text-dungeon-accent transition-colors font-medium py-2"
                    >
                      Pending Approval
                    </Link>
                  )}
                  
                  {user?.role === 'admin' && (
                    <div className="border-l-2 border-dungeon-accent pl-4">
                      <button
                        onClick={() => setIsMobileAdminOpen(!isMobileAdminOpen)}
                        className="flex items-center justify-between w-full text-dungeon-accent font-medium mb-2"
                      >
                        <span>Admin</span>
                        <svg
                          className={`w-4 h-4 transition-transform ${isMobileAdminOpen ? 'rotate-180' : ''}`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isMobileAdminOpen || isAdminPage ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="flex flex-col gap-2">
                          <Link
                            href="/admin/bookings"
                            onClick={closeMenu}
                            className={`py-2 pl-2 ${pathname === '/admin/bookings' ? 'text-dungeon-accent' : 'text-dungeon-primary hover:text-dungeon-accent'}`}
                          >
                            📋 Bookings
                          </Link>
                          <Link
                            href="/admin/shops"
                            onClick={closeMenu}
                            className={`py-2 pl-2 ${pathname === '/admin/shops' ? 'text-dungeon-accent' : 'text-dungeon-primary hover:text-dungeon-accent'}`}
                          >
                            🏪 Shops
                          </Link>
                          <Link
                            href="/admin/services"
                            onClick={closeMenu}
                            className={`py-2 pl-2 ${pathname === '/admin/services' ? 'text-dungeon-accent' : 'text-dungeon-primary hover:text-dungeon-accent'}`}
                          >
                            💆 Services
                          </Link>
                          <Link
                            href="/admin/promotions"
                            onClick={closeMenu}
                            className={`py-2 pl-2 ${pathname === '/admin/promotions' ? 'text-dungeon-accent' : 'text-dungeon-primary hover:text-dungeon-accent'}`}
                          >
                            🏷️ Promotions
                          </Link>
                          <Link
                            href="/admin/merchants"
                            onClick={closeMenu}
                            className={`py-2 pl-2 ${pathname === '/admin/merchants' ? 'text-dungeon-accent' : 'text-dungeon-primary hover:text-dungeon-accent'}`}
                          >
                            Merchants
                          </Link>
                          <Link
                            href="/admin/settings"
                            onClick={closeMenu}
                            className={`py-2 pl-2 ${pathname === '/admin/settings' ? 'text-dungeon-accent' : 'text-dungeon-primary hover:text-dungeon-accent'}`}
                          >
                            Settings
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-dungeon-outline pt-4 mt-2">
                    <span className="text-dungeon-sub-header block py-2">{user?.name}</span>
                    <Link
                      href="/profile"
                      onClick={closeMenu}
                      className="text-dungeon-primary hover:text-dungeon-accent transition-colors font-medium py-2 block"
                    >
                      My Profile
                    </Link>
                    <Link
                      href="/profile/password"
                      onClick={closeMenu}
                      className="text-dungeon-primary hover:text-dungeon-accent transition-colors font-medium py-2 block"
                    >
                      Change Password
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-red-400 hover:text-red-300 transition-colors font-medium py-2"
                    >
                      🚪 Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="text-dungeon-primary hover:text-dungeon-accent transition-colors font-medium py-2"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={closeMenu}
                    className="px-4 py-2 bg-dungeon-accent text-dungeon-dark-text font-bold rounded hover:bg-dungeon-accent-dark transition-colors text-center"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
