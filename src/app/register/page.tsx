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
          router.push('/');
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
    <main className="min-h-screen bg-[#1A1A1A] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-[#2B2B2B] border border-[#403A36] rounded-lg p-8">
          <h1 className="text-3xl font-bold text-[#F0E5D8] text-center mb-2">
            Join Dungeon Inn
          </h1>
          <p className="text-[#8A8177] text-center mb-8">
            Create your account to begin
          </p>

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[#A88C6B] text-sm font-bold mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#403A36] rounded text-[#D4CFC6] focus:outline-none focus:border-[#E57A00]"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-[#A88C6B] text-sm font-bold mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#403A36] rounded text-[#D4CFC6] focus:outline-none focus:border-[#E57A00]"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-[#A88C6B] text-sm font-bold mb-2">
                Telephone
              </label>
              <input
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#403A36] rounded text-[#D4CFC6] focus:outline-none focus:border-[#E57A00]"
                placeholder="0812345678"
                required
              />
            </div>

            <div>
              <label className="block text-[#A88C6B] text-sm font-bold mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#403A36] rounded text-[#D4CFC6] focus:outline-none focus:border-[#E57A00]"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-[#A88C6B] text-sm font-bold mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
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
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center mt-6 text-[#8A8177]">
            Already have an account?{' '}
            <Link href="/login" className="text-[#E57A00] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}