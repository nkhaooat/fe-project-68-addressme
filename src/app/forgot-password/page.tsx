'use client';

import { useState } from 'react';
import Link from 'next/link';
import { forgotPassword } from '@/libs/auth';

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
    <main className="min-h-screen bg-[#1A1A1A] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-[#2B2B2B] border border-[#403A36] rounded-lg p-8">
          <h1 className="text-3xl font-bold text-[#F0E5D8] text-center mb-2">
            Forgot Password
          </h1>
          <p className="text-[#8A8177] text-center mb-8">
            Enter your email and we&apos;ll send a reset link
          </p>

          {status === 'done' ? (
            <div className="text-center space-y-4">
              <div className="text-5xl mb-4">📬</div>
              <p className="text-[#A88C6B]">{message}</p>
              <p className="text-[#8A8177] text-sm mt-2">
                Check your inbox and follow the link within 15 minutes.
              </p>
              <Link
                href="/login"
                className="inline-block mt-4 text-[#E57A00] hover:underline text-sm"
              >
                ← Back to Login
              </Link>
            </div>
          ) : (
            <>
              {status === 'error' && (
                <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-6">
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[#A88C6B] text-sm font-bold mb-2">
                    Email Address
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

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full py-3 bg-[#E57A00] text-[#1A110A] font-bold rounded hover:bg-[#c46a00] transition-colors disabled:opacity-50"
                >
                  {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <p className="text-center mt-6 text-[#8A8177]">
                Remember it?{' '}
                <Link href="/login" className="text-[#E57A00] hover:underline">
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
