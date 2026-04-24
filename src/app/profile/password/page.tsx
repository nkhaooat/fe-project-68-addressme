'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '@/redux/store';
import { changePassword } from '@/libs/auth';
import ErrorBanner from '@/components/ErrorBanner';

export default function ChangePasswordPage() {
  const { token } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  if (!token) {
    router.push('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) {
      setStatus('error');
      setMessage('New passwords do not match');
      return;
    }
    if (newPw.length < 6) {
      setStatus('error');
      setMessage('New password must be at least 6 characters');
      return;
    }

    setStatus('loading');
    setMessage('');
    try {
      const res = await changePassword(currentPw, newPw, token);
      if (res.success) {
        setStatus('success');
        setMessage('Password changed successfully');
        setTimeout(() => router.push('/profile'), 2000);
      } else {
        setStatus('error');
        setMessage(res.message || 'Failed to change password');
      }
    } catch {
      setStatus('error');
      setMessage('Something went wrong');
    }
  };

  return (
    <main className="min-h-screen bg-dungeon-canvas py-8">
      <div className="max-w-lg mx-auto px-4">
        <h1 className="text-3xl font-bold text-dungeon-header-text mb-8 text-center">Change Password</h1>

        {status === 'error' && message && (
          <ErrorBanner message={message} onDismiss={() => { setStatus('idle'); setMessage(''); }} />
        )}

        {status === 'success' ? (
          <div className="bg-dungeon-surface border border-dungeon-outline rounded-lg p-8 text-center">
            <div className="text-4xl mb-3">{'\u2705'}</div>
            <p className="text-dungeon-sub-header">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-dungeon-surface border border-dungeon-outline rounded-lg p-6 space-y-5">
            <div>
              <label className="block text-dungeon-sub-header text-sm font-bold mb-2">Current Password</label>
              <input
                type="password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                className="w-full px-4 py-3 bg-dungeon-canvas border border-dungeon-outline rounded text-dungeon-primary focus:outline-none focus:border-dungeon-accent"
                required
              />
            </div>
            <div>
              <label className="block text-dungeon-sub-header text-sm font-bold mb-2">New Password</label>
              <input
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                className="w-full px-4 py-3 bg-dungeon-canvas border border-dungeon-outline rounded text-dungeon-primary focus:outline-none focus:border-dungeon-accent"
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-dungeon-sub-header text-sm font-bold mb-2">Confirm New Password</label>
              <input
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                className="w-full px-4 py-3 bg-dungeon-canvas border border-dungeon-outline rounded text-dungeon-primary focus:outline-none focus:border-dungeon-accent"
                required
              />
            </div>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-3 bg-dungeon-accent text-dungeon-dark-text font-bold rounded hover:bg-dungeon-accent-dark transition-colors disabled:opacity-50"
            >
              {status === 'loading' ? 'Saving...' : 'Save New Password'}
            </button>
          </form>
        )}

        <div className="text-center mt-4">
          <button onClick={() => router.push('/profile')} className="text-dungeon-accent hover:underline text-sm">
            Back to Profile
          </button>
        </div>
      </div>
    </main>
  );
}
