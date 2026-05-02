'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { userRegister, getMe } from '@/libs/auth';
import { setCredentials } from '@/redux/features/authSlice';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    telephone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const registerRes = await userRegister(
        formData.name,
        formData.email,
        formData.telephone,
        formData.password
      );

      if (registerRes.success && registerRes.token) {
        const meRes = await getMe(registerRes.token);
        
        if (meRes.success && meRes.data) {
          dispatch(setCredentials({ user: meRes.data, token: registerRes.token }));
          router.push('/consent');
        } else {
          setError('Account created but failed to get user info');
        }
      } else {
        setError(registerRes.message || 'Registration failed');
      }
    } catch {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-dungeon-canvas flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-dungeon-surface border border-dungeon-outline rounded-lg p-8">
          <h1 className="text-3xl font-bold text-dungeon-header-text text-center mb-2">
            Join Dungeon Inn
          </h1>
          <p className="text-dungeon-secondary text-center mb-8">
            Create your account to begin
          </p>

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-dungeon-sub-header text-sm font-bold mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-dungeon-canvas border border-dungeon-outline rounded text-dungeon-primary focus:outline-none focus:border-dungeon-accent"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-dungeon-sub-header text-sm font-bold mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-dungeon-canvas border border-dungeon-outline rounded text-dungeon-primary focus:outline-none focus:border-dungeon-accent"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-dungeon-sub-header text-sm font-bold mb-2">
                Telephone
              </label>
              <input
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-dungeon-canvas border border-dungeon-outline rounded text-dungeon-primary focus:outline-none focus:border-dungeon-accent"
                placeholder="0812345678"
                required
              />
            </div>

            <div>
              <label className="block text-dungeon-sub-header text-sm font-bold mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-dungeon-canvas border border-dungeon-outline rounded text-dungeon-primary focus:outline-none focus:border-dungeon-accent"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-dungeon-sub-header text-sm font-bold mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
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
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center mt-6 text-dungeon-secondary">
            Already have an account?{' '}
            <Link href="/login" className="text-dungeon-accent hover:underline">
              Sign in
            </Link>
          </p>
          <p className="text-center mt-2 text-dungeon-secondary">
            Shop owner?{' '}
            <Link href="/register/merchant" className="text-dungeon-accent hover:underline">
              Register as Merchant
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}