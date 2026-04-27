'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { getMerchants, approveMerchant, rejectMerchant } from '@/libs/auth';
import AccessDenied from '@/components/AccessDenied';
import { AdminMerchantsSkeleton, FadeIn } from '@/components/Skeletons';
import Pagination from '@/components/Pagination';
import { PaginationData } from '@/types/api';

interface MerchantUser {
  _id: string;
  name: string;
  email: string;
  telephone: string;
  merchantStatus: 'pending' | 'approved' | 'rejected';
  merchantShop: { _id: string; name: string; address: string } | null;
  createdAt: string;
}

const PAGE_SIZE = 6;

const statusColor = (s: string) => {
  switch (s) {
    case 'approved': return 'text-green-400';
    case 'rejected': return 'text-red-400';
    default: return 'text-yellow-400';
  }
};

export default function AdminMerchantsPage() {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [allMerchants, setAllMerchants] = useState<MerchantUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    fetchMerchants();
  }, [token]);

  async function fetchMerchants() {
    setLoading(true);
    try {
      const res = await getMerchants(token!);
      if (res.success) setAllMerchants(res.data);
    } catch {}
    setLoading(false);
  }

  const filteredMerchants = useMemo(() => {
    let list = allMerchants;
    if (statusFilter !== '') list = list.filter(m => m.merchantStatus === statusFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(m => m.email.toLowerCase().includes(q) || m.name.toLowerCase().includes(q));
    }
    return list;
  }, [allMerchants, statusFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredMerchants.length / PAGE_SIZE));
  const paginatedMerchants = filteredMerchants.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => { setCurrentPage(1); }, [statusFilter, searchQuery]);

  async function handleApprove(id: string) {
    setProcessing(id);
    try {
      const res = await approveMerchant(id, token!);
      if (res.success) setAllMerchants(allMerchants.map(m => m._id === id ? { ...m, merchantStatus: 'approved' } : m));
    } catch {}
    setProcessing(null);
  }

  async function handleReject(id: string) {
    setProcessing(id);
    try {
      const res = await rejectMerchant(id, token!);
      if (res.success) setAllMerchants(allMerchants.map(m => m._id === id ? { ...m, merchantStatus: 'rejected' } : m));
    } catch {}
    setProcessing(null);
  }

  if (user?.role !== 'admin') return <AccessDenied />;
  if (loading) return <AdminMerchantsSkeleton />;

  const pagination: PaginationData = {
    total: filteredMerchants.length,
    page: currentPage,
    pages: totalPages,
    limit: PAGE_SIZE,
  };

  return (<FadeIn>
    <main className="min-h-screen bg-dungeon-canvas py-8">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-dungeon-header-text mb-6">Merchant Applications</h1>

        <div className="mb-4">
          <div className="relative">
            <input type="text" placeholder="Search by email or name..." value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-dungeon-surface border border-dungeon-outline rounded-lg px-4 py-3 pl-10 text-dungeon-primary placeholder-dungeon-secondary focus:border-dungeon-accent focus:outline-none transition-colors" />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dungeon-secondary">🔍</span>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {['pending', 'approved', 'rejected', ''].map(s => {
            const count = s === '' ? allMerchants.length : allMerchants.filter(m => m.merchantStatus === s).length;
            return (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  statusFilter === s
                    ? 'bg-dungeon-accent text-dungeon-dark-text'
                    : 'bg-dungeon-surface text-dungeon-secondary border border-dungeon-outline hover:border-dungeon-accent'
                }`}>
                {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                <span className={`ml-1.5 text-xs ${statusFilter === s ? 'text-dungeon-dark-text/70' : 'text-dungeon-muted'}`}>{count}</span>
              </button>
            );
          })}
        </div>

        {filteredMerchants.length === 0 ? (
          <div className="text-dungeon-secondary text-center py-16">
            {allMerchants.length === 0 ? 'No merchant applications' : 'No merchants match your search'}
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {paginatedMerchants.map(merchant => (
                <div key={merchant._id} className="bg-dungeon-surface border border-dungeon-outline rounded-lg p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-dungeon-header-text">{merchant.name}</h3>
                      <p className="text-dungeon-sub-header text-sm">{merchant.email} · {merchant.telephone}</p>
                      {merchant.merchantShop && (
                        <p className="text-dungeon-primary text-sm mt-1">
                          {merchant.merchantShop.name}
                          {merchant.merchantShop.address && ` - ${merchant.merchantShop.address}`}
                        </p>
                      )}
                      <p className={`text-sm mt-2 font-bold ${statusColor(merchant.merchantStatus)}`}>
                        Status: {merchant.merchantStatus.charAt(0).toUpperCase() + merchant.merchantStatus.slice(1)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {merchant.merchantStatus === 'pending' && (
                        <>
                          <button onClick={() => handleApprove(merchant._id)} disabled={processing === merchant._id}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 text-sm font-bold">
                            {processing === merchant._id ? '...' : 'Approve'}
                          </button>
                          <button onClick={() => handleReject(merchant._id)} disabled={processing === merchant._id}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 text-sm font-bold">
                            {processing === merchant._id ? '...' : 'Reject'}
                          </button>
                        </>
                      )}
                      {merchant.merchantStatus === 'approved' && (
                        <button onClick={() => handleReject(merchant._id)} disabled={processing === merchant._id}
                          className="px-4 py-2 bg-red-600/20 border border-red-600 text-red-400 rounded hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50 text-sm">
                          Revoke
                        </button>
                      )}
                      {merchant.merchantStatus === 'rejected' && (
                        <button onClick={() => handleApprove(merchant._id)} disabled={processing === merchant._id}
                          className="px-4 py-2 bg-green-600/20 border border-green-600 text-green-400 rounded hover:bg-green-600 hover:text-white transition-colors disabled:opacity-50 text-sm">
                          Re-approve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Pagination pagination={pagination} currentPage={currentPage} onPageChange={setCurrentPage} />
          </>
        )}
      </div>
    </main>
  </FadeIn>);
}
