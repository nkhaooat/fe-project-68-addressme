'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { getMerchants, approveMerchant, rejectMerchant } from '@/libs/auth';

interface MerchantUser {
  _id: string;
  name: string;
  email: string;
  telephone: string;
  merchantStatus: 'pending' | 'approved' | 'rejected';
  merchantShop: { _id: string; name: string; address: string } | null;
  createdAt: string;
}

export default function AdminMerchantsPage() {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [merchants, setMerchants] = useState<MerchantUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    fetchMerchants();
  }, [token, statusFilter]);

  async function fetchMerchants() {
    setLoading(true);
    try {
      const res = await getMerchants(token!, statusFilter || undefined);
      if (res.success) setMerchants(res.data);
    } catch {}
    setLoading(false);
  }

  async function handleApprove(id: string) {
    setProcessing(id);
    try {
      const res = await approveMerchant(id, token!);
      if (res.success) {
        setMerchants(merchants.map(m => m._id === id ? { ...m, merchantStatus: 'approved' } : m));
      }
    } catch {}
    setProcessing(null);
  }

  async function handleReject(id: string) {
    setProcessing(id);
    try {
      const res = await rejectMerchant(id, token!);
      if (res.success) {
        setMerchants(merchants.map(m => m._id === id ? { ...m, merchantStatus: 'rejected' } : m));
      }
    } catch {}
    setProcessing(null);
  }

  if (user?.role !== 'admin') {
    return (
      <main className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <p className="text-red-400 text-xl">Admin access required</p>
      </main>
    );
  }

  const statusColor = (s: string) => {
    switch (s) {
      case 'approved': return 'text-green-400';
      case 'rejected': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  return (
    <main className="min-h-screen bg-[#1A1A1A] py-8">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-[#F0E5D8] mb-6">📋 Merchant Applications</h1>

        {/* Status tabs */}
        <div className="flex gap-2 mb-6">
          {['pending', 'approved', 'rejected', ''].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                statusFilter === s
                  ? 'bg-[#E57A00] text-[#1A110A]'
                  : 'bg-[#2B2B2B] text-[#8A8177] border border-[#403A36] hover:border-[#E57A00]'
              }`}>
              {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-[#E57A00] text-center py-16">Loading...</div>
        ) : merchants.length === 0 ? (
          <div className="text-[#8A8177] text-center py-16">No merchant applications</div>
        ) : (
          <div className="space-y-4">
            {merchants.map((merchant) => (
              <div key={merchant._id} className="bg-[#2B2B2B] border border-[#403A36] rounded-lg p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-[#F0E5D8]">{merchant.name}</h3>
                    <p className="text-[#A88C6B] text-sm">{merchant.email} · {merchant.telephone}</p>
                    {merchant.merchantShop && (
                      <p className="text-[#D4CFC6] text-sm mt-1">
                        🏪 {merchant.merchantShop.name}
                        {merchant.merchantShop.address && ` — ${merchant.merchantShop.address}`}
                      </p>
                    )}
                    <p className={`text-sm mt-2 font-bold ${statusColor(merchant.merchantStatus)}`}>
                      Status: {merchant.merchantStatus.charAt(0).toUpperCase() + merchant.merchantStatus.slice(1)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {merchant.merchantStatus === 'pending' && (
                      <>
                        <button onClick={() => handleApprove(merchant._id)}
                          disabled={processing === merchant._id}
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 text-sm font-bold">
                          {processing === merchant._id ? '...' : '✅ Approve'}
                        </button>
                        <button onClick={() => handleReject(merchant._id)}
                          disabled={processing === merchant._id}
                          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 text-sm font-bold">
                          {processing === merchant._id ? '...' : '❌ Reject'}
                        </button>
                      </>
                    )}
                    {merchant.merchantStatus === 'approved' && (
                      <button onClick={() => handleReject(merchant._id)}
                        disabled={processing === merchant._id}
                        className="px-4 py-2 bg-red-600/20 border border-red-600 text-red-400 rounded hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50 text-sm">
                        Revoke
                      </button>
                    )}
                    {merchant.merchantStatus === 'rejected' && (
                      <button onClick={() => handleApprove(merchant._id)}
                        disabled={processing === merchant._id}
                        className="px-4 py-2 bg-green-600/20 border border-green-600 text-green-400 rounded hover:bg-green-600 hover:text-white transition-colors disabled:opacity-50 text-sm">
                        Re-approve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
