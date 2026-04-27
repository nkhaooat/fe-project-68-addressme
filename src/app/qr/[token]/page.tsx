'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { QRCodeSVG } from 'qrcode.react';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import { QRSkeleton, FadeIn } from '@/components/Skeletons';

interface BookingInfo {
  success: boolean;
  data?: {
    shop: { name: string; address: string };
    service: { name: string; duration: number; price: number };
    user: { name: string };
    resvDate: string;
    status: string;
  };
  message?: string;
}

export default function QRPage() {
  const params = useParams();
  const token = params.token as string;
  const router = useRouter();
  const { token: authToken, user } = useSelector((state: RootState) => state.auth);
  const [booking, setBooking] = useState<BookingInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    // Not logged in → redirect to login, then back here
    if (!authToken) {
      router.push(`/login?redirect=/qr/${token}`);
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/qr/verify/${token}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then(r => r.json())
      .then(data => setBooking(data))
      .catch(() => setBooking({ success: false, message: 'Failed to verify QR code' }))
      .finally(() => setLoading(false));
  }, [token, authToken, router]);

  const qrUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/qr/${token}`
    : `/qr/${token}`;

  if (loading) {
    return <QRSkeleton />;
  }

  if (!booking?.success) {
    return (
      <main className="min-h-screen bg-dungeon-canvas flex items-center justify-center p-4">
        <div className="bg-dungeon-surface border border-dungeon-outline rounded-xl p-8 max-w-md w-full text-center">
          <p className="text-4xl mb-4">⛔</p>
          <h1 className="text-xl font-bold text-red-400 mb-2">Invalid QR Code</h1>
          <p className="text-dungeon-secondary">{booking?.message || 'This QR code is not valid.'}</p>
          {booking?.message?.includes('Not authorized') && (
            <button
              onClick={() => router.push('/login')}
              className="mt-4 px-6 py-2 bg-dungeon-accent text-dungeon-dark-text font-bold rounded hover:bg-dungeon-accent-dark transition-colors"
            >
              Log In
            </button>
          )}
        </div>
      </main>
    );
  }

  const d = booking.data!;
  const date = new Date(d.resvDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const time = new Date(d.resvDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (<FadeIn>
    <main className="min-h-screen bg-dungeon-canvas flex items-center justify-center p-4">
      <div className="bg-dungeon-surface border border-dungeon-outline rounded-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-dungeon-primary-header p-6 text-center border-b-2 border-dungeon-accent">
          <h1 className="text-2xl font-extrabold text-dungeon-accent tracking-wider">⚔️ DUNGEON INN</h1>
          <p className="text-xs text-dungeon-secondary tracking-widest uppercase mt-1">Massage Reservation</p>
        </div>

        {/* QR Code */}
        <div className="p-6 text-center">
          <QRCodeDisplay token={token} />
          <p className="text-dungeon-secondary text-sm mt-2">Show this code at the shop</p>
        </div>

        {/* Booking Details */}
        <div className="px-6 pb-6">
          <div className="bg-dungeon-canvas rounded-lg divide-y divide-dungeon-outline">
            <div className="flex px-4 py-3">
              <span className="text-dungeon-secondary text-sm w-24">🏪 Shop</span>
              <span className="text-dungeon-primary text-sm font-medium">{d.shop.name}</span>
            </div>
            <div className="flex px-4 py-3">
              <span className="text-dungeon-secondary text-sm w-24">💆 Service</span>
              <span className="text-dungeon-primary text-sm font-medium">{d.service.name}</span>
            </div>
            <div className="flex px-4 py-3">
              <span className="text-dungeon-secondary text-sm w-24">📅 Date</span>
              <span className="text-dungeon-primary text-sm font-medium">{date}</span>
            </div>
            <div className="flex px-4 py-3">
              <span className="text-dungeon-secondary text-sm w-24">🕐 Time</span>
              <span className="text-dungeon-primary text-sm font-medium">{time}</span>
            </div>
            <div className="flex px-4 py-3">
              <span className="text-dungeon-secondary text-sm w-24">👤 Guest</span>
              <span className="text-dungeon-primary text-sm font-medium">{d.user.name}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-dungeon-canvas px-6 py-4 text-center border-t border-dungeon-outline">
          <p className="text-xs text-dungeon-muted">
            © 2026 Dungeon Inn &nbsp;|&nbsp; <span className="text-dungeon-accent">Happy adventuring!</span>
          </p>
        </div>
      </div>
    </main>
  </FadeIn>);
}
