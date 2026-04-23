'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { getPromotions, createPromotion, deletePromotion } from '@/libs/promotions';

interface Promotion {
  _id: string;
  code: string;
  name: string;
  discountType: 'flat' | 'percentage';
  discountValue: number;
  expiresAt: string;
  isActive: boolean;
  usageLimit: number | null;
  usedCount: number;
  createdAt: string;
}

export default function AdminPromotionsPage() {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<'flat' | 'percentage'>('flat');
  const [formValue, setFormValue] = useState('');
  const [formExpiry, setFormExpiry] = useState('');
  const [formLimit, setFormLimit] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (token && user?.role === 'admin') {
      fetchPromotions();
    }
  }, [token, user]);

  async function fetchPromotions() {
    try {
      const res = await getPromotions(token!);
      if (res.success) {
        setPromotions(res.data);
      } else {
        setError(res.message || 'Failed to load promotions');
      }
    } catch {
      setError('Error loading promotions');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const res = await createPromotion({
        code: formCode,
        name: formName,
        discountType: formType,
        discountValue: parseFloat(formValue),
        expiresAt: new Date(formExpiry).toISOString(),
        usageLimit: formLimit ? parseInt(formLimit) : undefined,
      }, token!);

      if (res.success) {
        setPromotions([res.data, ...promotions]);
        setShowForm(false);
        setFormCode('');
        setFormName('');
        setFormType('flat');
        setFormValue('');
        setFormExpiry('');
        setFormLimit('');
      } else {
        setFormError(res.message || 'Failed to create promotion');
      }
    } catch {
      setFormError('Error creating promotion');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to deactivate this promotion?')) return;

    try {
      const res = await deletePromotion(id, token!);
      if (res.success) {
        setPromotions(promotions.map((p) => p._id === id ? { ...p, isActive: false } : p));
      } else {
        alert(res.message || 'Failed to deactivate');
      }
    } catch {
      alert('Error deactivating promotion');
    }
  }

  if (user?.role !== 'admin') {
    return (
      <main className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-red-400 text-xl">Access Denied</div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-[#E57A00] text-xl">Loading promotions...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#1A1A1A] py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#F0E5D8]">Promotions</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-[#E57A00] text-[#1A110A] font-bold rounded hover:bg-[#c46a00] transition-colors"
          >
            {showForm ? 'Cancel' : '+ New Promotion'}
          </button>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Create Form */}
        {showForm && (
          <div className="bg-[#2B2B2B] border border-[#403A36] rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-[#F0E5D8] mb-4">Create Promotion</h2>
            {formError && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
                {formError}
              </div>
            )}
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#A88C6B] text-sm font-bold mb-2">Code</label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    placeholder="e.g. SUMMER50"
                    className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#403A36] rounded text-[#D4CFC6] focus:outline-none focus:border-[#E57A00] font-mono uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#A88C6B] text-sm font-bold mb-2">Name</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Summer Sale 50 Baht Off"
                    className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#403A36] rounded text-[#D4CFC6] focus:outline-none focus:border-[#E57A00]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#A88C6B] text-sm font-bold mb-2">Discount Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as 'flat' | 'percentage')}
                    className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#403A36] rounded text-[#D4CFC6] focus:outline-none focus:border-[#E57A00]"
                  >
                    <option value="flat">Flat (฿)</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#A88C6B] text-sm font-bold mb-2">
                    Discount Value {formType === 'flat' ? '(฿)' : '(%)'}
                  </label>
                  <input
                    type="number"
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    placeholder={formType === 'flat' ? '100' : '20'}
                    min="0"
                    max={formType === 'percentage' ? '100' : undefined}
                    className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#403A36] rounded text-[#D4CFC6] focus:outline-none focus:border-[#E57A00]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#A88C6B] text-sm font-bold mb-2">Expiry Date</label>
                  <input
                    type="date"
                    value={formExpiry}
                    onChange={(e) => setFormExpiry(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#403A36] rounded text-[#D4CFC6] focus:outline-none focus:border-[#E57A00]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#A88C6B] text-sm font-bold mb-2">
                    Usage Limit <span className="text-[#8A8177] font-normal">(blank = unlimited)</span>
                  </label>
                  <input
                    type="number"
                    value={formLimit}
                    onChange={(e) => setFormLimit(e.target.value)}
                    placeholder="Unlimited"
                    min="1"
                    className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#403A36] rounded text-[#D4CFC6] focus:outline-none focus:border-[#E57A00]"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-[#E57A00] text-[#1A110A] font-bold rounded hover:bg-[#c46a00] transition-colors disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create Promotion'}
              </button>
            </form>
          </div>
        )}

        {/* Promotions List */}
        <div className="space-y-4">
          {promotions.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[#8A8177] text-xl">No promotions yet</p>
            </div>
          ) : (
            promotions.map((promo) => (
              <div
                key={promo._id}
                className={`bg-[#2B2B2B] border rounded-lg p-6 ${
                  promo.isActive ? 'border-[#403A36]' : 'border-[#403A36]/50 opacity-60'
                }`}
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-mono font-bold text-[#E57A00]">{promo.code}</span>
                      {!promo.isActive && (
                        <span className="text-xs bg-red-900/50 text-red-400 px-2 py-0.5 rounded">Inactive</span>
                      )}
                    </div>
                    <p className="text-[#D4CFC6] font-medium">{promo.name}</p>
                    <p className="text-[#8A8177] text-sm mt-1">
                      {promo.discountType === 'flat' ? `฿${promo.discountValue} off` : `${promo.discountValue}% off`}
                      {' • '}
                      Expires: {new Date(promo.expiresAt).toLocaleDateString()}
                      {' • '}
                      Used: {promo.usedCount}{promo.usageLimit ? `/${promo.usageLimit}` : ' (unlimited)'}
                    </p>
                  </div>
                  <div>
                    {promo.isActive && (
                      <button
                        onClick={() => handleDelete(promo._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      >
                        Deactivate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
