'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { getMerchantDashboard, getMerchantReservations, merchantScanQR, getMe, updateMerchantReservationStatus } from '@/libs/auth';
import Pagination from '@/components/Pagination';
import { useToast } from '@/components/ToastContext';
import MerchantReservationCard from '@/components/merchant/MerchantReservationCard';
import { setCredentials } from '@/redux/features/authSlice';
import { MerchantDashboardSkeleton, FadeIn } from '@/components/Skeletons';

interface ShopData {
  _id: string;
  name: string;
  address: string;
  telephone?: string;
  openTime?: string;
  closeTime?: string;
  description?: string;
  imageUrl?: string;
}

interface ReservationData {
  _id: string;
  status: string;
  resvDate: string;
  qrToken?: string;
  qrActive?: boolean;
  user: { name: string; email: string; telephone: string };
  service: { name: string; duration: number; price: number };
}

export default function MerchantDashboardPage() {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const { addToast } = useToast();
  const [shop, setShop] = useState<ShopData | null>(null);
  const [stats, setStats] = useState({ totalReservations: 0, pendingReservations: 0, todayReservations: 0 });
  const [reservations, setReservations] = useState<ReservationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanToken, setScanToken] = useState('');
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; data?: { user?: { name: string; email: string }; reservation?: { _id: string; resvDate: string; status: string } } } | null>(null);
  const [scanning, setScanning] = useState(false);
  const [tab, setTab] = useState<'overview' | 'reservations' | 'scan'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [resPage, setResPage] = useState(1);
  const RES_PAGE_SIZE = 6;

  useEffect(() => {
    if (!token) { router.push('/login'); return; }

    // Always refetch latest user status (admin may have approved/rejected since last login)
    async function refreshUser() {
      try {
        const res = await getMe(token!);
        if (res.success && res.data) {
          dispatch(setCredentials({ user: res.data, token: token! }));
        }
      } catch {}
    }
    refreshUser();
  }, [token]);

  useEffect(() => {
    if (user?.role !== 'merchant') {
      if (user?.role === 'admin') { router.push('/admin'); return; }
      router.push('/');
      return;
    }
    if (user?.merchantStatus === 'pending') {
      // Show pending state
      setLoading(false);
      return;
    }
    if (user?.merchantStatus === 'rejected') {
      setLoading(false);
      return;
    }
    loadData();
  }, [token]);

  async function loadData() {
    try {
      const [dashRes, resRes] = await Promise.all([
        getMerchantDashboard(token!),
        getMerchantReservations(token!),
      ]);
      if (dashRes.success) {
        setShop(dashRes.data.shop);
        setStats(dashRes.data.stats);
      }
      if (resRes.success) setReservations(resRes.data);
    } catch {}
    setLoading(false);
  }

  async function handleScan() {
    if (!scanToken.trim()) return;
    setScanning(true);
    setScanResult(null);
    try {
      // Extract token from URL if pasted as full URL
      let qrToken = scanToken.trim();
      try {
        const url = new URL(qrToken);
        const segments = url.pathname.split('/').filter(Boolean);
        if (segments.length >= 2 && segments[segments.length - 2] === 'qr') {
          qrToken = segments[segments.length - 1];
        }
      } catch {}
      const res = await merchantScanQR(token!, qrToken);
      setScanResult(res);
      if (res.success) {
        // Refresh reservations
        const resRes = await getMerchantReservations(token!);
        if (resRes.success) setReservations(resRes.data);
        setScanToken('');
      }
    } catch {
      setScanResult({ success: false, message: 'Scan failed' });
    }
    setScanning(false);
  }

  async function handleUpdateStatus(reservationId: string, newStatus: string) {
    try {
      const res = await updateMerchantReservationStatus(token!, reservationId, newStatus);
      if (res.success) {
        setReservations(reservations.map(r => r._id === reservationId ? { ...r, status: newStatus } : r));
      } else {
        addToast(res.message || 'Failed to update status');
      }
    } catch {
      addToast('Error updating reservation status');
    }
  }

  // Pending state
  // Reset page on filter/search change
  useEffect(() => { setResPage(1); }, [statusFilter, searchQuery]);

  // Filter reservations
  const filteredReservations = useMemo(() => {
    let list = reservations;
    if (statusFilter !== 'all') list = list.filter(r => r.status === statusFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(r =>
        r.user.email.toLowerCase().includes(q) || r.user.name.toLowerCase().includes(q)
      );
    }
    return list;
  }, [reservations, statusFilter, searchQuery]);

  const resTotalPages = Math.max(1, Math.ceil(filteredReservations.length / RES_PAGE_SIZE));
  const paginatedReservations = filteredReservations.slice((resPage - 1) * RES_PAGE_SIZE, resPage * RES_PAGE_SIZE);

  const resStatusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: reservations.length };
    for (const r of reservations) counts[r.status] = (counts[r.status] || 0) + 1;
    return counts;
  }, [reservations]);

  if (!loading && user?.merchantStatus === 'pending') {
    return (
      <main className="min-h-screen bg-dungeon-canvas flex items-center justify-center px-4">
        <div className="bg-dungeon-surface border border-dungeon-outline rounded-xl p-8 max-w-md text-center">
          <div className="text-5xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold text-dungeon-header-text mb-2">Account Pending Approval</h1>
          <p className="text-dungeon-sub-header">Your merchant account is waiting for admin approval. You'll receive an email once approved.</p>
        </div>
      </main>
    );
  }

  // Rejected state
  if (!loading && user?.merchantStatus === 'rejected') {
    return (
      <main className="min-h-screen bg-dungeon-canvas flex items-center justify-center px-4">
        <div className="bg-dungeon-surface border border-dungeon-outline rounded-xl p-8 max-w-md text-center">
          <div className="text-5xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-dungeon-header-text mb-2">Account Rejected</h1>
          <p className="text-dungeon-sub-header">Your merchant account application has been rejected. Please contact the admin team if you believe this is an error.</p>
        </div>
      </main>
    );
  }

  if (loading) {
    return <MerchantDashboardSkeleton />;
  }

  const statusColor = (s: string) => {
    switch (s) {
      case 'confirmed': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'cancelled': return 'text-red-400';
      case 'completed': return 'text-dungeon-secondary';
      default: return 'text-dungeon-secondary';
    }
  };

  return (<FadeIn>
    <main className="min-h-screen bg-dungeon-canvas py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-dungeon-header-text">🏪 Merchant Dashboard</h1>
          <span className="text-green-400 text-sm font-bold">✅ Approved</span>
        </div>

        {/* Shop info */}
        {shop && (
          <div className="bg-dungeon-surface border border-dungeon-outline rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-dungeon-header-text mb-2">{shop.name}</h2>
            <p className="text-dungeon-sub-header text-sm">{shop.address}</p>
            {shop.telephone && <p className="text-dungeon-sub-header text-sm">📞 {shop.telephone}</p>}
            {shop.openTime && shop.closeTime && (
              <p className="text-dungeon-sub-header text-sm">🕐 {shop.openTime} — {shop.closeTime}</p>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-dungeon-surface border border-dungeon-outline rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-dungeon-accent">{stats.totalReservations}</p>
            <p className="text-dungeon-secondary text-sm">Total</p>
          </div>
          <div className="bg-dungeon-surface border border-dungeon-outline rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">{stats.pendingReservations}</p>
            <p className="text-dungeon-secondary text-sm">Pending</p>
          </div>
          <div className="bg-dungeon-surface border border-dungeon-outline rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{stats.todayReservations}</p>
            <p className="text-dungeon-secondary text-sm">Today</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {(['overview', 'reservations', 'scan'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                tab === t
                  ? 'bg-dungeon-accent text-dungeon-dark-text'
                  : 'bg-dungeon-surface text-dungeon-secondary border border-dungeon-outline hover:border-dungeon-accent'
              }`}>
              {t === 'overview' ? 'Overview' : t === 'reservations' ? 'Reservations' : 'Scan QR'}
            </button>
          ))}
          <a href="/merchant/shop" className="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold bg-dungeon-surface text-dungeon-secondary border border-dungeon-outline hover:border-dungeon-accent transition-colors">
            My Shop
          </a>
          <a href="/merchant/services" className="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold bg-dungeon-surface text-dungeon-secondary border border-dungeon-outline hover:border-dungeon-accent transition-colors">
            Services
          </a>
        </div>

        {/* Overview tab */}
        {tab === 'overview' && (
          <div className="bg-dungeon-surface border border-dungeon-outline rounded-lg p-6">
            <h3 className="text-lg font-bold text-dungeon-header-text mb-4">Recent Reservations</h3>
            {reservations.length === 0 ? (
              <p className="text-dungeon-secondary">No reservations yet</p>
            ) : (
              <div className="space-y-3">
                {reservations.slice(0, 5).map((r) => (
                  <div key={r._id} className="flex justify-between items-center p-3 bg-dungeon-canvas rounded">
                    <div>
                      <p className="text-dungeon-primary font-semibold">{r.user.name}</p>
                      <p className="text-dungeon-secondary text-sm">{r.service.name} · 📅 {new Date(r.resvDate).toLocaleString()}</p>
                    </div>
                    <span className={`text-sm font-bold ${statusColor(r.status)}`}>
                      {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reservations tab */}
        {tab === 'reservations' && (
          <>
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by email or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-dungeon-surface border border-dungeon-outline rounded-lg px-4 py-3 pl-10 text-dungeon-primary placeholder-dungeon-secondary focus:border-dungeon-accent focus:outline-none transition-colors"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dungeon-secondary">{'\uD83D\uDD0D'}</span>
              </div>
            </div>

            {/* Status tabs */}
            <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
              {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    statusFilter === s
                      ? 'bg-dungeon-accent text-dungeon-dark-text'
                      : 'bg-dungeon-surface text-dungeon-secondary border border-dungeon-outline hover:border-dungeon-accent'
                  }`}>
                  {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                  {resStatusCounts[s] !== undefined && (
                    <span className={`ml-1.5 text-xs ${statusFilter === s ? 'text-dungeon-dark-text/70' : 'text-dungeon-muted'}`}>
                      {resStatusCounts[s]}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {filteredReservations.length === 0 ? (
              <div className="text-dungeon-secondary text-center py-16">
                {reservations.length === 0 ? 'No reservations yet' : 'No reservations match your filter'}
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {paginatedReservations.map((r) => (
                    <MerchantReservationCard
                      key={r._id}
                      reservation={r}
                      statusColor={statusColor}
                      onUpdateStatus={handleUpdateStatus}
                    />
                  ))}
                </div>

                {/* Pagination */}
                <Pagination totalPages={resTotalPages} currentPage={resPage} onPageChange={setResPage} />
              </>
            )}
          </>
        )}

        {/* Scan QR tab */}
        {tab === 'scan' && (
          <div className="space-y-6">
            {/* Camera scanner link */}
            <div className="bg-dungeon-surface border border-dungeon-outline rounded-lg p-6 text-center">
              <div className="text-4xl mb-3">📷</div>
              <h3 className="text-lg font-bold text-dungeon-header-text mb-2">Camera Scanner</h3>
              <p className="text-dungeon-secondary text-sm mb-4">Use your device camera to scan customer QR codes</p>
              <button onClick={() => setTab('scan')}
                className="inline-block px-8 py-3 bg-dungeon-accent text-dungeon-dark-text font-bold rounded hover:bg-dungeon-accent-dark transition-colors">
                Open Camera Scanner
              </button>
            </div>

            {/* Manual token input fallback */}
            <div className="bg-dungeon-surface border border-dungeon-outline rounded-lg p-6">
              <h3 className="text-lg font-bold text-dungeon-header-text mb-2 text-center">Manual Token Input</h3>
              <p className="text-dungeon-secondary text-sm text-center mb-4">Or paste the QR token manually</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={scanToken}
                  onChange={(e) => setScanToken(e.target.value)}
                  placeholder="Paste QR token here..."
                  className="flex-1 px-4 py-3 bg-dungeon-canvas border border-dungeon-outline rounded text-dungeon-primary focus:outline-none focus:border-dungeon-accent"
                />
                <button onClick={handleScan} disabled={scanning || !scanToken.trim()}
                  className="px-6 py-3 bg-dungeon-accent text-dungeon-dark-text font-bold rounded hover:bg-dungeon-accent-dark transition-colors disabled:opacity-50">
                  {scanning ? '...' : 'Verify'}
                </button>
              </div>
              {scanResult && (
                <div className={`mt-4 p-4 rounded-lg text-center ${
                  scanResult.success
                    ? 'bg-green-900/30 border border-green-600 text-green-400'
                    : 'bg-red-900/30 border border-red-600 text-red-400'
                }`}>
                  <p className="font-bold">{scanResult.success ? 'Verified!' : 'Failed'}</p>
                  <p className="text-sm mt-1">{scanResult.message}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  </FadeIn>);
}
