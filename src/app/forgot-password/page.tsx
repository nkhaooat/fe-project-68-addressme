'use client';

import { useState } from 'react';
import Link from 'next/link';
import { forgotPassword } from '@/libs/auth';
import ErrorBanner from '@/components/ErrorBanner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const res = await forgotPassword(email);
      if (res.success) {
        setStatus('done');
        setMessage(res.message || 'If that email exists, a reset link has been sent.');
      } else {
        setStatus('error');
        setMessage(res.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Failed to send request. Please try again.');
    }
  };

  return (
    <main className="min-h-screen bg-dungeon-canvas flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-dungeon-surface border border-dungeon-outline rounded-lg p-8">
          <h1 className="text-3xl font-bold text-dungeon-header-text text-center mb-2">
            Forgot Password
          </h1>
          <p className="text-dungeon-secondary text-center mb-8">
            Enter your email and we&apos;ll send a reset link
          </p>

          {status === 'done' ? (
            <div className="text-center space-y-4">
              <div className="text-5xl mb-4">📬</div>
              <p className="text-dungeon-sub-header">{message}</p>
              <p className="text-dungeon-secondary text-sm mt-2">
                Check your inbox and follow the link within 15 minutes.
              </p>
              <Link
                href="/login"
                className="inline-block mt-4 text-dungeon-accent hover:underline text-sm"
              >
                ← Back to Login
              </Link>
            </div>
          ) : (
            <>
              {status === 'error' && <ErrorBanner message={message} />}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-dungeon-sub-header text-sm font-bold mb-2">
                    Email Address
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

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full py-3 bg-dungeon-accent text-dungeon-dark-text font-bold rounded hover:bg-dungeon-accent-dark transition-colors disabled:opacity-50"
                >
                  {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <p className="text-center mt-6 text-dungeon-secondary">
                Remember it?{' '}
                <Link href="/login" className="text-dungeon-accent hover:underline">
                  Back to Login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
