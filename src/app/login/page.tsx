'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { userLogin, getMe } from '@/libs/auth';
import { setCredentials } from '@/redux/features/authSlice';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loginRes = await userLogin(email, password);
      
      if (loginRes.success && loginRes.token) {
        const meRes = await getMe(loginRes.token);
        
        if (meRes.success && meRes.data) {
          dispatch(setCredentials({ user: meRes.data, token: loginRes.token }));
          router.push('/');
        } else {
          setError('Failed to get user info');
        }
      } else {
        setError(loginRes.message || 'Invalid credentials');
      }
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#1A1A1A] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-[#2B2B2B] border border-[#403A36] rounded-lg p-8">
          <h1 className="text-3xl font-bold text-[#F0E5D8] text-center mb-2">
            Welcome Back
          </h1>
          <p className="text-[#8A8177] text-center mb-8">
            Enter the Dungeon Inn
          </p>

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[#A88C6B] text-sm font-bold mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#403A36] rounded text-[#D4CFC6] focus:outline-none focus:border-[#E57A00]"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-[#A88C6B] text-sm font-bold mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#403A36] rounded text-[#D4CFC6] focus:outline-none focus:border-[#E57A00]"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#E57A00] text-[#1A110A] font-bold rounded hover:bg-[#c46a00] transition-colors disabled:opacity-50"
            >
              {loading ? 'Entering...' : 'Enter'}
            </button>
          </form>

          <div className="mt-6 space-y-2 text-center">
            <p className="text-[#8A8177]">
              <Link href="/forgot-password" className="text-[#E57A00] hover:underline text-sm">
                Forgot Password?
              </Link>
            </p>
            <p className="text-[#8A8177]">
              New here?{' '}
              <Link href="/register" className="text-[#E57A00] hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}