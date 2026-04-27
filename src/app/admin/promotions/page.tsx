'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useToast } from '@/components/ToastContext';
import ConfirmDialog from '@/components/ConfirmDialog';
import { getPromotions, createPromotion, deletePromotion } from '@/libs/promotions';
import AccessDenied from '@/components/AccessDenied';
import { AdminPromotionsSkeleton, FadeIn } from '@/components/Skeletons';
import ErrorBanner from '@/components/ErrorBanner';

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
  const { addToast } = useToast();
  const [pendingDeactivate, setPendingDeactivate] = useState<string | null>(null);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<'flat' | 'percentage'>('flat');
  const [formValue, setFormValue] = useState('');
  const [formExpiry, setFormExpiry] = useState('');
  const [formLimit, setFormLimit] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (token && user?.role === 'admin') fetchPromotions();
  }, [token, user]);

  async function fetchPromotions() {
    try {
      const res = await getPromotions(token!);
      if (res.success) setPromotions(res.data);
      else setError(res.message || 'Failed to load promotions');
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
        code: formCode, name: formName, discountType: formType,
        discountValue: parseFloat(formValue),
        expiresAt: new Date(formExpiry).toISOString(),
        usageLimit: formLimit ? parseInt(formLimit) : undefined,
      }, token!);
      if (res.success) {
        setPromotions([res.data, ...promotions]);
        setShowForm(false);
        setFormCode(''); setFormName(''); setFormType('flat');
        setFormValue(''); setFormExpiry(''); setFormLimit('');
      } else {
        setFormError(res.message || 'Failed to create promotion');
      }
    } catch {
      setFormError('Error creating promotion');
    } finally {
      setSubmitting(false);
    }
  }

  function handleDelete(id: string) {
    setPendingDeactivate(id);
  }

  async function confirmDeactivate() {
    const id = pendingDeactivate!;
    setPendingDeactivate(null);
    try {
      const res = await deletePromotion(id, token!);
      if (res.success) setPromotions(promotions.map(p => p._id === id ? { ...p, isActive: false } : p));
      else addToast(res.message || 'Failed to deactivate');
    } catch {
      addToast('Error deactivating promotion');
    }
  }

  if (user?.role !== 'admin') return <AccessDenied />;
  if (loading) return <AdminPromotionsSkeleton />;

  return (<FadeIn>
    <>
    <main className="min-h-screen bg-dungeon-canvas py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-dungeon-header-text">Promotions</h1>
          <button onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-dungeon-accent text-dungeon-dark-text font-bold rounded hover:bg-dungeon-accent-dark transition-colors">
            {showForm ? 'Cancel' : '+ New Promotion'}
          </button>
        </div>

        {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

        {showForm && (
          <div className="bg-dungeon-surface border border-dungeon-outline rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-dungeon-header-text mb-4">Create Promotion</h2>
            {formError && <ErrorBanner message={formError} onDismiss={() => setFormError('')} />}
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-dungeon-sub-header text-sm font-bold mb-2">Code</label>
                  <input type="text" value={formCode} onChange={e => setFormCode(e.target.value.toUpperCase())}
                    placeholder="e.g. SUMMER50" required
                    className="w-full px-4 py-3 bg-dungeon-canvas border border-dungeon-outline rounded text-dungeon-primary focus:outline-none focus:border-dungeon-accent font-mono uppercase" />
                </div>
                <div>
                  <label className="block text-dungeon-sub-header text-sm font-bold mb-2">Name</label>
                  <input type="text" value={formName} onChange={e => setFormName(e.target.value)}
                    placeholder="e.g. Summer Sale 50 Baht Off" required
                    className="w-full px-4 py-3 bg-dungeon-canvas border border-dungeon-outline rounded text-dungeon-primary focus:outline-none focus:border-dungeon-accent" />
                </div>
                <div>
                  <label className="block text-dungeon-sub-header text-sm font-bold mb-2">Discount Type</label>
                  <select value={formType} onChange={e => setFormType(e.target.value as 'flat' | 'percentage')}
                    className="w-full px-4 py-3 bg-dungeon-canvas border border-dungeon-outline rounded text-dungeon-primary focus:outline-none focus:border-dungeon-accent">
                    <option value="flat">Flat (฿)</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-dungeon-sub-header text-sm font-bold mb-2">
                    Discount Value {formType === 'flat' ? '(฿)' : '(%)'}
                  </label>
                  <input type="number" value={formValue} onChange={e => setFormValue(e.target.value)}
                    placeholder={formType === 'flat' ? '100' : '20'} min="0" max={formType === 'percentage' ? '100' : undefined} required
                    className="w-full px-4 py-3 bg-dungeon-canvas border border-dungeon-outline rounded text-dungeon-primary focus:outline-none focus:border-dungeon-accent" />
                </div>
                <div>
                  <label className="block text-dungeon-sub-header text-sm font-bold mb-2">Expiry Date</label>
                  <input type="date" value={formExpiry} onChange={e => setFormExpiry(e.target.value)}
                    min={new Date().toISOString().split('T')[0]} required
                    className="w-full px-4 py-3 bg-dungeon-canvas border border-dungeon-outline rounded text-dungeon-primary focus:outline-none focus:border-dungeon-accent" />
                </div>
                <div>
                  <label className="block text-dungeon-sub-header text-sm font-bold mb-2">
                    Usage Limit <span className="text-dungeon-secondary font-normal">(blank = unlimited)</span>
                  </label>
                  <input type="number" value={formLimit} onChange={e => setFormLimit(e.target.value)}
                    placeholder="Unlimited" min="1"
                    className="w-full px-4 py-3 bg-dungeon-canvas border border-dungeon-outline rounded text-dungeon-primary focus:outline-none focus:border-dungeon-accent" />
                </div>
              </div>
              <button type="submit" disabled={submitting}
                className="w-full py-3 bg-dungeon-accent text-dungeon-dark-text font-bold rounded hover:bg-dungeon-accent-dark transition-colors disabled:opacity-50">
                {submitting ? 'Creating...' : 'Create Promotion'}
              </button>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {promotions.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-dungeon-secondary text-xl">No promotions yet</p>
            </div>
          ) : promotions.map(promo => (
            <div key={promo._id}
              className={`bg-dungeon-surface border rounded-lg p-6 ${promo.isActive ? 'border-dungeon-outline' : 'border-dungeon-outline/50 opacity-60'}`}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-mono font-bold text-dungeon-accent">{promo.code}</span>
                    {!promo.isActive && <span className="text-xs bg-red-900/50 text-red-400 px-2 py-0.5 rounded">Inactive</span>}
                  </div>
                  <p className="text-dungeon-primary font-medium">{promo.name}</p>
                  <p className="text-dungeon-secondary text-sm mt-1">
                    {promo.discountType === 'flat' ? `฿${promo.discountValue} off` : `${promo.discountValue}% off`}
                    {' · '} Expires: {new Date(promo.expiresAt).toLocaleDateString()}
                    {' · '} Used: {promo.usedCount}{promo.usageLimit ? `/${promo.usageLimit}` : ' (unlimited)'}
                  </p>
                </div>
                {promo.isActive && (
                  <button onClick={() => handleDelete(promo._id)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                    Deactivate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
    <ConfirmDialog
      open={pendingDeactivate !== null}
      title="Deactivate Promotion"
      message="Are you sure you want to deactivate this promotion?"
      confirmLabel="Deactivate"
      onConfirm={confirmDeactivate}
      onCancel={() => setPendingDeactivate(null)}
    />
    </>
  </FadeIn>);
}
