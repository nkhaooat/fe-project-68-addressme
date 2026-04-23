'use client';

import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerMerchant, getMe } from '@/libs/auth';
import { setCredentials } from '@/redux/features/authSlice';
import { API_URL } from '@/libs/config';

interface ShopOption {
  _id: string;
  name: string;
  address: string;
}

export default function RegisterMerchantPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    telephone: '',
    password: '',
    confirmPassword: '',
    shopId: '',
  });
  const [shops, setShops] = useState<ShopOption[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    async function fetchShops() {
      try {
        const res = await fetch(`${API_URL}/shops?limit=100`);
        const data = await res.json();
        if (data.success) setShops(data.data);
      } catch {}
    }
    fetchShops();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
    if (!formData.shopId) {
      setError('Please select a shop');
      return;
    }

    setLoading(true);
    try {
      const res = await registerMerchant(
        formData.name,
        formData.email,
        formData.telephone,
        formData.password,
        formData.shopId
      );

      if (res.success && res.token) {
        const meRes = await getMe(res.token);
        if (meRes.success && meRes.data) {
          dispatch(setCredentials({ user: meRes.data, token: res.token }));
          router.push('/merchant');
        }
      } else {
        setError(res.message || 'Registration failed');
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
            🏪 Merchant Sign Up
          </h1>
          <p className="text-[#8A8177] text-center mb-8">
            Register to manage your shop on Dungeon Inn
          </p>

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[#A88C6B] text-sm font-bold mb-2">Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange}
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#403A36] rounded text-[#D4CFC6] focus:outline-none focus:border-[#E57A00]"
                placeholder="John Doe" required />
            </div>

            <div>
              <label className="block text-[#A88C6B] text-sm font-bold mb-2">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange}
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#403A36] rounded text-[#D4CFC6] focus:outline-none focus:border-[#E57A00]"
                placeholder="your@email.com" required />
            </div>

            <div>
              <label className="block text-[#A88C6B] text-sm font-bold mb-2">Telephone</label>
              <input type="tel" name="telephone" value={formData.telephone} onChange={handleChange}
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#403A36] rounded text-[#D4CFC6] focus:outline-none focus:border-[#E57A00]"
                placeholder="0812345678" required />
            </div>

            <div>
              <label className="block text-[#A88C6B] text-sm font-bold mb-2">Your Shop</label>
              <select name="shopId" value={formData.shopId} onChange={handleChange}
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#403A36] rounded text-[#D4CFC6] focus:outline-none focus:border-[#E57A00]">
                <option value="">— Select your shop —</option>
                {shops.map((shop) => (
                  <option key={shop._id} value={shop._id}>{shop.name} — {shop.address}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[#A88C6B] text-sm font-bold mb-2">Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange}
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#403A36] rounded text-[#D4CFC6] focus:outline-none focus:border-[#E57A00]"
                placeholder="••••••••" required />
            </div>

            <div>
              <label className="block text-[#A88C6B] text-sm font-bold mb-2">Confirm Password</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#403A36] rounded text-[#D4CFC6] focus:outline-none focus:border-[#E57A00]"
                placeholder="••••••••" required />
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-[#E57A00] text-[#1A110A] font-bold rounded hover:bg-[#c46a00] transition-colors disabled:opacity-50">
              {loading ? 'Creating Merchant Account...' : '🏪 Register as Merchant'}
            </button>
          </form>

          <p className="text-center mt-6 text-[#8A8177]">
            Already have an account?{' '}
            <Link href="/login" className="text-[#E57A00] hover:underline">Sign in</Link>
          </p>
          <p className="text-center mt-2 text-[#8A8177]">
            Customer?{' '}
            <Link href="/register" className="text-[#E57A00] hover:underline">Register here</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
