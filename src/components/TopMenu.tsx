'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { logout } from '@/redux/features/authSlice';
import { useRouter } from 'next/navigation';

export default function TopMenu() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logout());
    router.push('/');
  };

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

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
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
                  <Link
                    href="/admin/bookings"
                    className="text-[#E57A00] hover:text-[#c46a00] transition-colors font-medium"
                  >
                    Admin
                  </Link>
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
        </div>
      </div>
    </nav>
  );
}