'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { getMerchantDashboard, getMerchantReservations, merchantScanQR, getMe } from '@/libs/auth';
import { setCredentials } from '@/redux/features/authSlice';

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
  const [shop, setShop] = useState<ShopData | null>(null);
  const [stats, setStats] = useState({ totalReservations: 0, pendingReservations: 0, todayReservations: 0 });
  const [reservations, setReservations] = useState<ReservationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanToken, setScanToken] = useState('');
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; data?: any } | null>(null);
  const [scanning, setScanning] = useState(false);
  const [tab, setTab] = useState<'overview' | 'reservations' | 'scan'>('overview');

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
      const res = await merchantScanQR(token!, scanToken.trim());
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

  // Pending state
  if (!loading && user?.merchantStatus === 'pending') {
    return (
      <main className="min-h-screen bg-[#1A1A1A] flex items-center justify-center px-4">
        <div className="bg-[#2B2B2B] border border-[#403A36] rounded-xl p-8 max-w-md text-center">
          <div className="text-5xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold text-[#F0E5D8] mb-2">Account Pending Approval</h1>
          <p className="text-[#A88C6B]">Your merchant account is waiting for admin approval. You'll receive an email once approved.</p>
        </div>
      </main>
    );
  }

  // Rejected state
  if (!loading && user?.merchantStatus === 'rejected') {
    return (
      <main className="min-h-screen bg-[#1A1A1A] flex items-center justify-center px-4">
        <div className="bg-[#2B2B2B] border border-[#403A36] rounded-xl p-8 max-w-md text-center">
          <div className="text-5xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-[#F0E5D8] mb-2">Account Rejected</h1>
          <p className="text-[#A88C6B]">Your merchant account application has been rejected. Please contact the admin team if you believe this is an error.</p>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-[#E57A00] text-xl">Loading dashboard...</div>
      </main>
    );
  }

  const statusColor = (s: string) => {
    switch (s) {
      case 'confirmed': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'cancelled': return 'text-red-400';
      case 'completed': return 'text-[#8A8177]';
      default: return 'text-[#8A8177]';
    }
  };

  return (
    <main className="min-h-screen bg-[#1A1A1A] py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-[#F0E5D8]">🏪 Merchant Dashboard</h1>
          <span className="text-green-400 text-sm font-bold">✅ Approved</span>
        </div>

        {/* Shop info */}
        {shop && (
          <div className="bg-[#2B2B2B] border border-[#403A36] rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-[#F0E5D8] mb-2">{shop.name}</h2>
            <p className="text-[#A88C6B] text-sm">{shop.address}</p>
            {shop.telephone && <p className="text-[#A88C6B] text-sm">📞 {shop.telephone}</p>}
            {shop.openTime && shop.closeTime && (
              <p className="text-[#A88C6B] text-sm">🕐 {shop.openTime} — {shop.closeTime}</p>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-[#2B2B2B] border border-[#403A36] rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-[#E57A00]">{stats.totalReservations}</p>
            <p className="text-[#8A8177] text-sm">Total</p>
          </div>
          <div className="bg-[#2B2B2B] border border-[#403A36] rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">{stats.pendingReservations}</p>
            <p className="text-[#8A8177] text-sm">Pending</p>
          </div>
          <div className="bg-[#2B2B2B] border border-[#403A36] rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{stats.todayReservations}</p>
            <p className="text-[#8A8177] text-sm">Today</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['overview', 'reservations', 'scan'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                tab === t
                  ? 'bg-[#E57A00] text-[#1A110A]'
                  : 'bg-[#2B2B2B] text-[#8A8177] border border-[#403A36] hover:border-[#E57A00]'
              }`}>
              {t === 'overview' ? '📊 Overview' : t === 'reservations' ? '📅 Reservations' : '📱 Scan QR'}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {tab === 'overview' && (
          <div className="bg-[#2B2B2B] border border-[#403A36] rounded-lg p-6">
            <h3 className="text-lg font-bold text-[#F0E5D8] mb-4">Recent Reservations</h3>
            {reservations.length === 0 ? (
              <p className="text-[#8A8177]">No reservations yet</p>
            ) : (
              <div className="space-y-3">
                {reservations.slice(0, 5).map((r) => (
                  <div key={r._id} className="flex justify-between items-center p-3 bg-[#1A1A1A] rounded">
                    <div>
                      <p className="text-[#D4CFC6] font-semibold">{r.user.name}</p>
                      <p className="text-[#8A8177] text-sm">{r.service.name} · 📅 {new Date(r.resvDate).toLocaleString()}</p>
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
          <div className="space-y-3">
            {reservations.length === 0 ? (
              <div className="text-[#8A8177] text-center py-16">No reservations yet</div>
            ) : (
              reservations.map((r) => (
                <div key={r._id} className="bg-[#2B2B2B] border border-[#403A36] rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[#F0E5D8] font-bold">{r.user.name}</p>
                      <p className="text-[#A88C6B] text-sm">{r.user.email} · {r.user.telephone}</p>
                      <p className="text-[#D4CFC6] text-sm mt-1">
                        {r.service.name} — ฿{r.service.price} · 📅 {new Date(r.resvDate).toLocaleString()}
                      </p>
                    </div>
                    <span className={`text-sm font-bold ${statusColor(r.status)}`}>
                      {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Scan QR tab */}
        {tab === 'scan' && (
          <div className="bg-[#2B2B2B] border border-[#403A36] rounded-lg p-6 max-w-lg mx-auto">
            <h3 className="text-lg font-bold text-[#F0E5D8] mb-4 text-center">📱 Scan Customer QR Code</h3>
            <p className="text-[#8A8177] text-sm text-center mb-4">Enter the QR token from the customer&apos;s phone</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={scanToken}
                onChange={(e) => setScanToken(e.target.value)}
                placeholder="Paste QR token here..."
                className="flex-1 px-4 py-3 bg-[#1A1A1A] border border-[#403A36] rounded text-[#D4CFC6] focus:outline-none focus:border-[#E57A00]"
              />
              <button onClick={handleScan} disabled={scanning || !scanToken.trim()}
                className="px-6 py-3 bg-[#E57A00] text-[#1A110A] font-bold rounded hover:bg-[#c46a00] transition-colors disabled:opacity-50">
                {scanning ? '...' : 'Verify'}
              </button>
            </div>
            {scanResult && (
              <div className={`mt-4 p-4 rounded-lg text-center ${
                scanResult.success
                  ? 'bg-green-900/30 border border-green-600 text-green-400'
                  : 'bg-red-900/30 border border-red-600 text-red-400'
              }`}>
                <p className="font-bold">{scanResult.success ? '✅ Verified!' : '❌ Failed'}</p>
                <p className="text-sm mt-1">{scanResult.message}</p>
                {scanResult.data && (
                  <div className="mt-2 text-sm text-[#D4CFC6]">
                    <p>{scanResult.data.user?.name} — {scanResult.data.service?.name}</p>
                    <p>📅 {scanResult.data.resvDate ? new Date(scanResult.data.resvDate).toLocaleString() : ''}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
