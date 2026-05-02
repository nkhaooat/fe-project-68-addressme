'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { userLogin, getMe } from '@/libs/auth';
import { setCredentials } from '@/redux/features/authSlice';
import ErrorBanner from '@/components/ErrorBanner';

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
          // Check if user has completed PDPA consent
          if (!meRes.data.pdpaConsentedAt) {
            router.push('/consent');
          } else {
            router.push('/');
          }
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
    <main className="min-h-screen bg-dungeon-canvas flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-dungeon-surface border border-dungeon-outline rounded-lg p-8">
          <h1 className="text-3xl font-bold text-dungeon-header-text text-center mb-2">
            Welcome Back
          </h1>
          <p className="text-dungeon-secondary text-center mb-8">
            Enter the Dungeon Inn
          </p>

          {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-dungeon-sub-header text-sm font-bold mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-dungeon-canvas border border-dungeon-outline rounded text-dungeon-primary focus:outline-none focus:border-dungeon-accent"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-dungeon-sub-header text-sm font-bold mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-dungeon-canvas border border-dungeon-outline rounded text-dungeon-primary focus:outline-none focus:border-dungeon-accent"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-dungeon-accent text-dungeon-dark-text font-bold rounded hover:bg-dungeon-accent-dark transition-colors disabled:opacity-50"
            >
              {loading ? 'Entering...' : 'Enter'}
            </button>
          </form>

          <div className="mt-6 space-y-2 text-center">
            <p className="text-dungeon-secondary">
              <Link href="/forgot-password" className="text-dungeon-accent hover:underline text-sm">
                Forgot Password?
              </Link>
            </p>
            <p className="text-dungeon-secondary">
              New here?{' '}
              <Link href="/register" className="text-dungeon-accent hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}