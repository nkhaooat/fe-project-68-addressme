'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '@/redux/store';
import { getMerchantDashboard } from '@/libs/auth';
import { SkeletonPage } from '@/components/Skeleton';

interface ShopData {
  _id: string;
  name: string;
  address: string;
  telephone: string;
  openTime: string;
  closeTime: string;
  imageUrl: string;
}

export default function MerchantShopPage() {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const [shop, setShop] = useState<ShopData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [form, setForm] = useState({
    name: '', address: '', telephone: '', openTime: '', closeTime: '', imageUrl: ''
  });

  useEffect(() => {
    if (!token) { router.push('/login'); return; }
    if (user?.role !== 'merchant' || user?.merchantStatus !== 'approved') { router.push('/merchant'); return; }
    loadData();
  }, [token]);

  async function loadData() {
    try {
      const res = await getMerchantDashboard(token!);
      if (res.success && res.data?.shop) {
        const s = res.data.shop;
        setShop(s);
        setForm({
          name: s.name || '', address: s.address || '', telephone: s.telephone || '',
          openTime: s.openTime || '', closeTime: s.closeTime || '',
          imageUrl: s.imageUrl || ''
        });
      }
    } catch {}
    setLoading(false);
  }

  async function handleSave() {
    if (!shop) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/merchant/shop`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Shop updated successfully!' });
        setShop(data.data);
      } else {
        setMessage({ type: 'error', text: data.message || 'Update failed' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Connection error' });
    }
    setSaving(false);
  }

  if (loading) return <main className="min-h-screen bg-dungeon-canvas py-8 px-4"><SkeletonPage type="detail" /></main>;

  return (
    <main className="min-h-screen bg-dungeon-canvas py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-dungeon-header-text">Edit My Shop</h1>
          <button onClick={() => router.push('/merchant')} className="text-dungeon-secondary hover:text-dungeon-header-text text-sm transition-colors">
            Back to Dashboard
          </button>
        </div>

        <div className="bg-dungeon-surface border border-dungeon-outline rounded-xl p-6 space-y-4">
          {/* Shop ID (read-only) */}
          <div>
            <label className="block text-dungeon-secondary text-sm mb-1">Shop ID</label>
            <input value={shop?._id || ''} disabled className="w-full bg-dungeon-canvas border border-dungeon-outline rounded-lg px-4 py-3 text-dungeon-muted text-sm" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-dungeon-secondary text-sm mb-1">Shop Name</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="w-full bg-dungeon-canvas border border-dungeon-outline rounded-lg px-4 py-3 text-dungeon-header-text focus:outline-none focus:border-dungeon-accent transition-colors" />
            </div>
            <div>
              <label className="block text-dungeon-secondary text-sm mb-1">Telephone</label>
              <input value={form.telephone} onChange={e => setForm({...form, telephone: e.target.value})}
                className="w-full bg-dungeon-canvas border border-dungeon-outline rounded-lg px-4 py-3 text-dungeon-header-text focus:outline-none focus:border-dungeon-accent transition-colors" />
            </div>
          </div>

          <div>
            <label className="block text-dungeon-secondary text-sm mb-1">Address</label>
            <input value={form.address} onChange={e => setForm({...form, address: e.target.value})}
              className="w-full bg-dungeon-canvas border border-dungeon-outline rounded-lg px-4 py-3 text-dungeon-header-text focus:outline-none focus:border-dungeon-accent transition-colors" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-dungeon-secondary text-sm mb-1">Opening Time</label>
              <input type="time" value={form.openTime} onChange={e => setForm({...form, openTime: e.target.value})}
                className="w-full bg-dungeon-canvas border border-dungeon-outline rounded-lg px-4 py-3 text-dungeon-header-text focus:outline-none focus:border-dungeon-accent transition-colors" />
            </div>
            <div>
              <label className="block text-dungeon-secondary text-sm mb-1">Closing Time</label>
              <input type="time" value={form.closeTime} onChange={e => setForm({...form, closeTime: e.target.value})}
                className="w-full bg-dungeon-canvas border border-dungeon-outline rounded-lg px-4 py-3 text-dungeon-header-text focus:outline-none focus:border-dungeon-accent transition-colors" />
            </div>
          </div>

          <div>
            <label className="block text-dungeon-secondary text-sm mb-1">Image URL</label>
            <input value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})}
              className="w-full bg-dungeon-canvas border border-dungeon-outline rounded-lg px-4 py-3 text-dungeon-header-text focus:outline-none focus:border-dungeon-accent transition-colors" />
          </div>

          {message && (
            <div className={`p-3 rounded-lg text-center text-sm font-semibold ${message.type === 'success' ? 'bg-green-900/30 border border-green-700 text-green-400' : 'bg-red-900/30 border border-red-700 text-red-400'}`}>
              {message.text}
            </div>
          )}

          <button onClick={handleSave} disabled={saving}
            className="w-full py-3 bg-dungeon-accent text-dungeon-dark-text font-bold rounded-lg hover:bg-dungeon-accent-dark transition-colors disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </main>
  );
}
