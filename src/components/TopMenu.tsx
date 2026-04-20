'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { logout } from '@/redux/features/authSlice';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { changePassword } from '@/libs/auth';
import { rebuildEmbedding } from '@/libs/shops';

export default function TopMenu() {
  const { user, isAuthenticated, token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [rebuildStatus, setRebuildStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Change Password modal state
  const [showChangePw, setShowChangePw] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwStatus, setPwStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [pwMessage, setPwMessage] = useState('');

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
  };

  const openChangePw = () => {
    setShowChangePw(true);
    setIsUserDropdownOpen(false);
    setCurrentPw('');
    setNewPw('');
    setConfirmPw('');
    setPwStatus('idle');
    setPwMessage('');
  };

  const handleChangePw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) {
      setPwStatus('error');
      setPwMessage('New passwords do not match.');
      return;
    }
    if (newPw.length < 6) {
      setPwStatus('error');
      setPwMessage('New password must be at least 6 characters.');
      return;
    }
    setPwStatus('loading');
    setPwMessage('');
    try {
      const res = await changePassword(currentPw, newPw, token ?? '');
      if (res.success) {
        setPwStatus('success');
        setPwMessage('Password changed successfully! 🎉');
        setTimeout(() => setShowChangePw(false), 2000);
      } else {
        setPwStatus('error');
        setPwMessage(res.message || 'Failed to change password.');
      }
    } catch {
      setPwStatus('error');
      setPwMessage('Something went wrong. Please try again.');
    }
  };

  const isAdminPage = pathname?.startsWith('/admin');

  const handleRebuildEmbedding = async () => {
    if (!token || rebuildStatus === 'loading') return;
    setRebuildStatus('loading');
    try {
      const res = await rebuildEmbedding(token);
      if (res.success) {
        setRebuildStatus('success');
        setTimeout(() => setRebuildStatus('idle'), 3000);
      } else {
        setRebuildStatus('error');
        setTimeout(() => setRebuildStatus('idle'), 3000);
        alert(res.message || 'Failed to rebuild embedding');
      }
    } catch {
      setRebuildStatus('error');
      setTimeout(() => setRebuildStatus('idle'), 3000);
      alert('Error rebuilding embedding index');
    }
  };

  return (
    <>
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
                          <hr className="border-[#403A36] my-1" />
                          <button
                            onClick={() => { setIsAdminDropdownOpen(false); handleRebuildEmbedding(); }}
                            disabled={rebuildStatus === 'loading'}
                            className="w-full text-left px-4 py-2 transition-colors text-[#D4CFC6] hover:text-[#E57A00] hover:bg-[#1A1A1A] disabled:opacity-50"
                          >
                            {rebuildStatus === 'loading' ? '⏳ Rebuilding...' : rebuildStatus === 'success' ? '✅ Rebuilt!' : '🔄 Rebuild Embedding'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* User name dropdown */}
                  <div className="flex items-center gap-3 ml-4 pl-4 border-l border-[#403A36]">
                    <div className="relative" ref={userDropdownRef}>
                      <button
                        onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                        className="flex items-center gap-1 text-[#A88C6B] hover:text-[#E57A00] transition-colors font-medium"
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
                        <div className="absolute top-full right-0 mt-2 w-48 bg-[#2B2B2B] border border-[#403A36] rounded-lg shadow-lg py-2 z-50">
                          <button
                            onClick={openChangePw}
                            className="w-full text-left px-4 py-2 text-[#D4CFC6] hover:text-[#E57A00] hover:bg-[#1A1A1A] transition-colors"
                          >
                            🔑 Change Password
                          </button>
                          <hr className="border-[#403A36] my-1" />
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-red-400 hover:text-red-300 hover:bg-[#1A1A1A] transition-colors"
                          >
                            🚪 Logout
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
                        <button
                          onClick={() => { closeMenu(); handleRebuildEmbedding(); }}
                          disabled={rebuildStatus === 'loading'}
                          className="py-2 pl-2 text-left text-[#D4CFC6] hover:text-[#E57A00] disabled:opacity-50"
                        >
                          {rebuildStatus === 'loading' ? '⏳ Rebuilding...' : rebuildStatus === 'success' ? '✅ Rebuilt!' : '🔄 Rebuild Embedding'}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-[#403A36] pt-4 mt-2">
                    <span className="text-[#A88C6B] block py-2">{user?.name}</span>
                    <button
                      onClick={() => { closeMenu(); openChangePw(); }}
                      className="text-[#D4CFC6] hover:text-[#E57A00] transition-colors font-medium py-2 block"
                    >
                      🔑 Change Password
                    </button>
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

      {/* Change Password Modal */}
      {showChangePw && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] px-4">
          <div className="bg-[#2B2B2B] border border-[#403A36] rounded-lg p-8 w-full max-w-md relative">
            {/* Close button */}
            <button
              onClick={() => setShowChangePw(false)}
              className="absolute top-4 right-4 text-[#8A8177] hover:text-[#D4CFC6] transition-colors text-xl"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold text-[#F0E5D8] mb-2">Change Password</h2>
            <p className="text-[#8A8177] text-sm mb-6">Update your account password</p>

            {pwStatus === 'success' ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-3">✅</div>
                <p className="text-[#A88C6B]">{pwMessage}</p>
              </div>
            ) : (
              <form onSubmit={handleChangePw} className="space-y-5">
                {pwStatus === 'error' && (
                  <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded">
                    {pwMessage}
                  </div>
                )}

                <div>
                  <label className="block text-[#A88C6B] text-sm font-bold mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#403A36] rounded text-[#D4CFC6] focus:outline-none focus:border-[#E57A00]"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#A88C6B] text-sm font-bold mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#403A36] rounded text-[#D4CFC6] focus:outline-none focus:border-[#E57A00]"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-[#A88C6B] text-sm font-bold mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#403A36] rounded text-[#D4CFC6] focus:outline-none focus:border-[#E57A00]"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={pwStatus === 'loading'}
                  className="w-full py-3 bg-[#E57A00] text-[#1A110A] font-bold rounded hover:bg-[#c46a00] transition-colors disabled:opacity-50"
                >
                  {pwStatus === 'loading' ? 'Saving...' : 'Save New Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
