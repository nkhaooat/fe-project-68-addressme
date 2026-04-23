'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';

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
  const { token } = useParams();
  const [booking, setBooking] = useState<BookingInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/qr/verify/${token}`)
      .then(r => r.json())
      .then(data => setBooking(data))
      .catch(() => setBooking({ success: false, message: 'Failed to verify QR code' }))
      .finally(() => setLoading(false));
  }, [token]);

  const qrUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/qr/${token}`
    : `/qr/${token}`;

  if (loading) {
    return (
      <main className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-[#E57A00] text-xl">Verifying...</div>
      </main>
    );
  }

  if (!booking?.success) {
    return (
      <main className="min-h-screen bg-[#1A1A1A] flex items-center justify-center p-4">
        <div className="bg-[#2B2B2B] border border-[#403A36] rounded-xl p-8 max-w-md w-full text-center">
          <p className="text-4xl mb-4">⛔</p>
          <h1 className="text-xl font-bold text-red-400 mb-2">Invalid QR Code</h1>
          <p className="text-[#8A8177]">{booking?.message || 'This QR code is not valid.'}</p>
        </div>
      </main>
    );
  }

  const d = booking.data!;
  const date = new Date(d.resvDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const time = new Date(d.resvDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <main className="min-h-screen bg-[#1A1A1A] flex items-center justify-center p-4">
      <div className="bg-[#2B2B2B] border border-[#403A36] rounded-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-[#2C1E18] p-6 text-center border-b-2 border-[#E57A00]">
          <h1 className="text-2xl font-extrabold text-[#E57A00] tracking-wider">⚔️ DUNGEON INN</h1>
          <p className="text-xs text-[#8A8177] tracking-widest uppercase mt-1">Massage Reservation</p>
        </div>

        {/* QR Code */}
        <div className="p-6 text-center">
          <div className="bg-white inline-block p-4 rounded-lg mb-4">
            <QRCodeSVG value={qrUrl} size={200} level="M" />
          </div>
          <p className="text-[#8A8177] text-sm">Show this code at the shop</p>
        </div>

        {/* Booking Details */}
        <div className="px-6 pb-6">
          <div className="bg-[#1A1A1A] rounded-lg divide-y divide-[#403A36]">
            <div className="flex px-4 py-3">
              <span className="text-[#8A8177] text-sm w-24">🏪 Shop</span>
              <span className="text-[#D4CFC6] text-sm font-medium">{d.shop.name}</span>
            </div>
            <div className="flex px-4 py-3">
              <span className="text-[#8A8177] text-sm w-24">💆 Service</span>
              <span className="text-[#D4CFC6] text-sm font-medium">{d.service.name}</span>
            </div>
            <div className="flex px-4 py-3">
              <span className="text-[#8A8177] text-sm w-24">📅 Date</span>
              <span className="text-[#D4CFC6] text-sm font-medium">{date}</span>
            </div>
            <div className="flex px-4 py-3">
              <span className="text-[#8A8177] text-sm w-24">🕐 Time</span>
              <span className="text-[#D4CFC6] text-sm font-medium">{time}</span>
            </div>
            <div className="flex px-4 py-3">
              <span className="text-[#8A8177] text-sm w-24">👤 Guest</span>
              <span className="text-[#D4CFC6] text-sm font-medium">{d.user.name}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#1A1A1A] px-6 py-4 text-center border-t border-[#403A36]">
          <p className="text-xs text-[#5A544E]">
            © 2026 Dungeon Inn &nbsp;|&nbsp; <span className="text-[#E57A00]">Happy adventuring!</span>
          </p>
        </div>
      </div>
    </main>
  );
}
