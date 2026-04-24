'use client';

import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '@/redux/store';
import { updateProfile } from '@/libs/auth';
import { setCredentials } from '@/redux/features/authSlice';
import ErrorBanner from '@/components/ErrorBanner';

export default function ProfilePage() {
  const { user, token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [telephone, setTelephone] = useState(user?.telephone || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!user || !token) {
    router.push('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSaving(true);

    try {
      const res = await updateProfile({ name, email, telephone }, token);
      if (res.success) {
        dispatch(setCredentials({ user: res.data, token }));
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(res.message || 'Failed to update profile');
      }
    } catch {
      setError('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-dungeon-canvas py-8">
      <div className="max-w-lg mx-auto px-4">
        <h1 className="text-3xl font-bold text-dungeon-header-text mb-8 text-center">My Profile</h1>

        {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

        {/* Account info (read-only) */}
        <div className="bg-dungeon-surface border border-dungeon-outline rounded-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-dungeon-header-text mb-3">Account</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-dungeon-secondary">Role</span>
              <span className="text-dungeon-primary font-medium capitalize">{user.role}</span>
            </div>
            {user.role === 'merchant' && (
              <div className="flex justify-between">
                <span className="text-dungeon-secondary">Merchant Status</span>
                <span className={`font-medium ${user.merchantStatus === 'approved' ? 'text-green-400' : user.merchantStatus === 'rejected' ? 'text-red-400' : 'text-yellow-400'}`}>
                  {user.merchantStatus || 'N/A'}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-dungeon-secondary">Member since</span>
              <span className="text-dungeon-primary">{user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Editable profile form */}
        <form onSubmit={handleSubmit} className="bg-dungeon-surface border border-dungeon-outline rounded-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-dungeon-header-text mb-4">Edit Profile</h2>

          <div className="space-y-5">
            <div>
              <label className="block text-dungeon-sub-header text-sm font-bold mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-dungeon-canvas border border-dungeon-outline rounded text-dungeon-primary focus:outline-none focus:border-dungeon-accent"
                required
              />
            </div>

            <div>
              <label className="block text-dungeon-sub-header text-sm font-bold mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-dungeon-canvas border border-dungeon-outline rounded text-dungeon-primary focus:outline-none focus:border-dungeon-accent"
                required
              />
            </div>

            <div>
              <label className="block text-dungeon-sub-header text-sm font-bold mb-2">
                Telephone
              </label>
              <input
                type="tel"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                className="w-full px-4 py-3 bg-dungeon-canvas border border-dungeon-outline rounded text-dungeon-primary focus:outline-none focus:border-dungeon-accent"
                required
              />
            </div>
          </div>

          {success && (
            <div className="mt-4 bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded text-sm">
              Profile updated successfully
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full mt-6 py-3 bg-dungeon-accent text-dungeon-dark-text font-bold rounded hover:bg-dungeon-accent-dark transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        {/* Password change link */}
        <div className="text-center">
          <button
            onClick={() => router.push('/profile/password')}
            className="text-dungeon-accent hover:underline text-sm"
          >
            Change Password
          </button>
        </div>
      </div>
    </main>
  );
}
