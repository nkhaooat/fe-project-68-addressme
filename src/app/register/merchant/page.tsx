'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [shopSearchQuery, setShopSearchQuery] = useState('');
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [filteredShops, setFilteredShops] = useState<ShopOption[]>([]);
  const [selectedShopName, setSelectedShopName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const shopDropdownRef = useRef<HTMLDivElement>(null);
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

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (shopDropdownRef.current && !shopDropdownRef.current.contains(e.target as Node)) {
        setIsShopDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleShopSearch(query: string) {
    setShopSearchQuery(query);
    setFormData(f => ({ ...f, shopId: '' }));
    setSelectedShopName('');
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      const filtered = shops.filter(s =>
        s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q)
      );
      setFilteredShops(filtered.slice(0, 10));
    } else {
      setFilteredShops(shops.slice(0, 10));
    }
    setIsShopDropdownOpen(true);
  }

  function handleSelectShop(shop: ShopOption) {
    setFormData(f => ({ ...f, shopId: shop._id }));
    setSelectedShopName(shop.name);
    setShopSearchQuery(shop.name);
    setIsShopDropdownOpen(false);
  }

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
    <main className="min-h-screen bg-dungeon-canvas flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-dungeon-surface border border-dungeon-outline rounded-lg p-8">
          <h1 className="text-3xl font-bold text-dungeon-header-text text-center mb-2">
            Merchant Sign Up
          </h1>
          <p className="text-dungeon-secondary text-center mb-8">
            Register to manage your shop on Dungeon Inn
          </p>

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-dungeon-sub-header text-sm font-bold mb-2">Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange}
                className="w-full px-4 py-3 bg-dungeon-canvas border border-dungeon-outline rounded text-dungeon-primary focus:outline-none focus:border-dungeon-accent"
                placeholder="John Doe" required />
            </div>

            <div>
              <label className="block text-dungeon-sub-header text-sm font-bold mb-2">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange}
                className="w-full px-4 py-3 bg-dungeon-canvas border border-dungeon-outline rounded text-dungeon-primary focus:outline-none focus:border-dungeon-accent"
                placeholder="your@email.com" required />
            </div>

            <div>
              <label className="block text-dungeon-sub-header text-sm font-bold mb-2">Telephone</label>
              <input type="tel" name="telephone" value={formData.telephone} onChange={handleChange}
                className="w-full px-4 py-3 bg-dungeon-canvas border border-dungeon-outline rounded text-dungeon-primary focus:outline-none focus:border-dungeon-accent"
                placeholder="0812345678" required />
            </div>

            {/* Shop search bar */}
            <div ref={shopDropdownRef} className="relative">
              <label className="block text-dungeon-sub-header text-sm font-bold mb-2">Your Shop</label>
              <div className="relative">
                <input
                  type="text"
                  value={shopSearchQuery}
                  onChange={(e) => handleShopSearch(e.target.value)}
                  onFocus={() => {
                    if (!formData.shopId) {
                      setFilteredShops(shops.slice(0, 10));
                      setIsShopDropdownOpen(true);
                    }
                  }}
                  placeholder="Search for a shop..."
                  className="w-full bg-dungeon-canvas border border-dungeon-outline rounded px-4 py-3 text-dungeon-primary focus:outline-none focus:border-dungeon-accent"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!formData.shopId) {
                      setFilteredShops(shops.slice(0, 10));
                      setIsShopDropdownOpen(!isShopDropdownOpen);
                    }
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dungeon-secondary hover:text-dungeon-primary"
                >
                  <svg className={`w-5 h-5 transition-transform ${isShopDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Dropdown */}
              {isShopDropdownOpen && !formData.shopId && (
                <div className="absolute z-10 w-full mt-1 bg-dungeon-canvas border border-dungeon-outline rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredShops.length > 0 ? (
                    filteredShops.map(shop => (
                      <button
                        key={shop._id}
                        type="button"
                        onClick={() => handleSelectShop(shop)}
                        className="w-full text-left px-4 py-2 text-dungeon-primary hover:bg-dungeon-surface hover:text-dungeon-accent transition-colors"
                      >
                        {shop.name}
                        <span className="text-dungeon-secondary text-sm ml-2">- {shop.address}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-dungeon-secondary">No shops found</div>
                  )}
                </div>
              )}

              {/* Selected shop badge */}
              {formData.shopId && selectedShopName && (
                <div className="mt-2 flex items-center gap-2 bg-dungeon-canvas border border-dungeon-outline rounded px-3 py-2">
                  <span className="text-dungeon-accent font-semibold">{selectedShopName}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(f => ({ ...f, shopId: '' }));
                      setSelectedShopName('');
                      setShopSearchQuery('');
                      setFilteredShops(shops.slice(0, 10));
                      setIsShopDropdownOpen(true);
                    }}
                    className="text-dungeon-secondary hover:text-red-400 ml-auto"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-dungeon-sub-header text-sm font-bold mb-2">Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange}
                className="w-full px-4 py-3 bg-dungeon-canvas border border-dungeon-outline rounded text-dungeon-primary focus:outline-none focus:border-dungeon-accent"
                placeholder="Min 6 characters" required />
            </div>

            <div>
              <label className="block text-dungeon-sub-header text-sm font-bold mb-2">Confirm Password</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                className="w-full px-4 py-3 bg-dungeon-canvas border border-dungeon-outline rounded text-dungeon-primary focus:outline-none focus:border-dungeon-accent"
                placeholder="Re-enter password" required />
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-dungeon-accent text-dungeon-dark-text font-bold rounded hover:bg-dungeon-accent-dark transition-colors disabled:opacity-50">
              {loading ? 'Creating Merchant Account...' : 'Register as Merchant'}
            </button>
          </form>

          <p className="text-center mt-6 text-dungeon-secondary">
            Already have an account?{' '}
            <Link href="/login" className="text-dungeon-accent hover:underline">Sign in</Link>
          </p>
          <p className="text-center mt-2 text-dungeon-secondary">
            Customer?{' '}
            <Link href="/register" className="text-dungeon-accent hover:underline">Register here</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
