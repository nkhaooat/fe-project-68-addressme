'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { resetPassword } from '@/libs/auth';
import ErrorBanner from '@/components/ErrorBanner';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing reset token.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setStatus('error');
      setMessage('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setStatus('error');
      setMessage('Password must be at least 6 characters.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const res = await resetPassword(token, password);
      if (res.success) {
        setStatus('done');
        setMessage(res.message || 'Password reset successfully!');
        setTimeout(() => router.push('/login'), 3000);
      } else {
        setStatus('error');
        setMessage(res.message || 'Reset failed. The link may have expired.');
      }
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <main className="min-h-screen bg-dungeon-canvas flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-dungeon-surface border border-dungeon-outline rounded-lg p-8">
          <h1 className="text-3xl font-bold text-dungeon-header-text text-center mb-2">
            Reset Password
          </h1>
          <p className="text-dungeon-secondary text-center mb-8">
            Choose a new password for your account
          </p>

          {status === 'done' ? (
            <div className="text-center space-y-4">
              <div className="text-5xl mb-4">✅</div>
              <p className="text-dungeon-sub-header">{message}</p>
              <p className="text-dungeon-secondary text-sm">Redirecting to login...</p>
            </div>
          ) : (
            <>
              {status === 'error' && <ErrorBanner message={message} />}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-dungeon-sub-header text-sm font-bold mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-dungeon-canvas border border-dungeon-outline rounded text-dungeon-primary focus:outline-none focus:border-dungeon-accent"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-dungeon-sub-header text-sm font-bold mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full px-4 py-3 bg-dungeon-canvas border border-dungeon-outline rounded text-dungeon-primary focus:outline-none focus:border-dungeon-accent"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading' || !token}
                  className="w-full py-3 bg-dungeon-accent text-dungeon-dark-text font-bold rounded hover:bg-dungeon-accent-dark transition-colors disabled:opacity-50"
                >
                  {status === 'loading' ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>

              <p className="text-center mt-6 text-dungeon-secondary">
                <Link href="/login" className="text-dungeon-accent hover:underline">
                  ← Back to Login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-dungeon-canvas flex items-center justify-center">
        <p className="text-dungeon-secondary">Loading...</p>
      </main>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
