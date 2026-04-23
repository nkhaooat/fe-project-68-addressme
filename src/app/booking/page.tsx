'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { getShop } from '@/libs/shops';
import { getService } from '@/libs/services';
import { createReservation } from '@/libs/reservations';
import { QRCodeSVG } from 'qrcode.react';
import { validatePromotion } from '@/libs/promotions';
import { Shop, Service } from '@/interface';
import Link from 'next/link';

// Parse time string to minutes since midnight
function parseTimeToMinutes(time: string): number {
  const [hour, min] = time.split(':').map(Number);
  return hour * 60 + min;
}

// Check if selected time is within shop hours
function isWithinShopHours(time: string, openTime: string, closeTime: string): boolean {
  const selectedValue = parseTimeToMinutes(time);
  const openValue = parseTimeToMinutes(openTime);
  let closeValue = parseTimeToMinutes(closeTime);
  if (closeValue === 0) closeValue = 24 * 60;
  if (closeValue < openValue) return selectedValue >= openValue || selectedValue <= closeValue;
  return selectedValue >= openValue && selectedValue <= closeValue;
}

// Check if service duration fits within shop hours
function checkServiceDuration(
  startTime: string,
  durationMinutes: number,
  openTime: string,
  closeTime: string
): { valid: boolean; endTime: string; error?: string } {
  const startValue = parseTimeToMinutes(startTime);
  const openValue = parseTimeToMinutes(openTime);
  let closeValue = parseTimeToMinutes(closeTime);
  if (closeValue === 0) closeValue = 24 * 60;
  const endValue = startValue + durationMinutes;
  const endHour = Math.floor(endValue / 60) % 24;
  const endMin = endValue % 60;
  const endTime = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;
  if (closeValue < openValue) {
    const maxStartForSameDay = closeValue - durationMinutes;
    if (startValue >= openValue) {
      if (endValue <= 24 * 60) return { valid: true, endTime };
      const nextDayEnd = endValue - 24 * 60;
      if (nextDayEnd <= closeValue) return { valid: true, endTime };
      return { valid: false, endTime, error: `Service ends at ${endTime} but shop closes at ${closeTime}` };
    } else if (startValue <= closeValue) {
      if (endValue <= closeValue) return { valid: true, endTime };
      return { valid: false, endTime, error: `Service ends at ${endTime} but shop closes at ${closeTime}` };
    }
    return { valid: false, endTime, error: `Invalid time for overnight hours` };
  }
  if (endValue > closeValue) return { valid: false, endTime, error: `Service ends at ${endTime} but shop closes at ${closeTime}` };
  return { valid: true, endTime };
}

export default function BookingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { token, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const shopId = searchParams.get('shop');
  const serviceId = searchParams.get('service');
  
  const [shop, setShop] = useState<Shop | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [resvDate, setResvDate] = useState('');
  const [resvTime, setResvTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [qrData, setQrData] = useState<{qrToken: string; reservationId: string} | null>(null);
  const [timeError, setTimeError] = useState('');

  // EPIC 4: Promotion state
  const [promoCode, setPromoCode] = useState('');
  const [promoValidating, setPromoValidating] = useState(false);
  const [promoApplied, setPromoApplied] = useState<{
    code: string;
    name: string;
    discountType: string;
    discountValue: number;
    discountAmount: number;
    originalPrice: number;
    finalPrice: number;
  } | null>(null);
  const [promoError, setPromoError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    async function fetchData() {
      try {
        if (shopId && serviceId) {
          const [shopRes, serviceRes] = await Promise.all([
            getShop(shopId),
            getService(serviceId),
          ]);
          if (shopRes.success) setShop(shopRes.data);
          if (serviceRes.success) setService(serviceRes.data);
        }
      } catch {
        setError('Error loading data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [shopId, serviceId, isAuthenticated, router]);

  useEffect(() => {
    if (shop && resvTime) {
      if (!isWithinShopHours(resvTime, shop.openTime, shop.closeTime)) {
        setTimeError(`Please select a time between ${shop.openTime} and ${shop.closeTime}`);
      } else if (service && service.duration > 0) {
        const durationCheck = checkServiceDuration(resvTime, service.duration, shop.openTime, shop.closeTime);
        if (!durationCheck.valid) setTimeError(durationCheck.error || 'Service duration exceeds shop hours');
        else setTimeError('');
      } else {
        setTimeError('');
      }
    } else {
      setTimeError('');
    }
  }, [shop, service, resvTime]);

  const handleApplyPromo = async () => {
    if (!promoCode.trim() || !service || !token) return;
    setPromoValidating(true);
    setPromoError('');
    setPromoApplied(null);

    try {
      const res = await validatePromotion(promoCode.trim(), service.price, token);
      if (res.success) {
        setPromoApplied(res.data);
      } else {
        setPromoError(res.message || 'Invalid promotion code');
      }
    } catch {
      setPromoError('Error validating promotion code');
    } finally {
      setPromoValidating(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoApplied(null);
    setPromoCode('');
    setPromoError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!resvDate || !resvTime) {
      setError('Please select date and time');
      return;
    }

    if (shop && !isWithinShopHours(resvTime, shop.openTime, shop.closeTime)) {
      setError(`Shop is only open from ${shop.openTime} to ${shop.closeTime}`);
      return;
    }

    if (shop && service && service.duration > 0) {
      const durationCheck = checkServiceDuration(resvTime, service.duration, shop.openTime, shop.closeTime);
      if (!durationCheck.valid) {
        setError(durationCheck.error || 'Service duration exceeds shop hours');
        return;
      }
    }

    setSubmitting(true);

    try {
      const resvDateTime = new Date(`${resvDate}T${resvTime}`).toISOString();
      
      const body: { resvDate: string; shop: string; service: string; promotionCode?: string } = {
        resvDate: resvDateTime,
        shop: shopId!,
        service: serviceId!,
      };

      // EPIC 4: Add promotion code if applied
      if (promoApplied) {
        body.promotionCode = promoApplied.code;
      }

      const res = await createReservation(body, token!);

      if (res.success) {
        setSuccess(res.message || 'Booking created successfully!');
        if (res.data?.qrToken) {
          setQrData({ qrToken: res.data.qrToken, reservationId: res.data._id });
        }
        // Don't auto-redirect — let user see QR and download
      } else {
        setError(res.message || 'Failed to create booking');
      }
    } catch {
      setError('Error creating booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-[#E57A00] text-xl">Loading...</div>
      </main>
    );
  }

  const displayPrice = promoApplied ? promoApplied.finalPrice : (service?.price || 0);

  return (
    <main className="min-h-screen bg-[#1A1A1A] py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-[#F0E5D8] mb-8 text-center">
          Make a Reservation
        </h1>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {success && !qrData && (
          <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        {/* US 6-2: QR Code success modal after booking */}
        {qrData && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#2B2B2B] border border-[#403A36] rounded-xl p-8 max-w-md w-full text-center">
              <h2 className="text-2xl font-bold text-[#F0E5D8] mb-2">🎉 Booking Confirmed!</h2>
              <p className="text-[#8A8177] mb-6">Check your email for confirmation details.</p>
              <div className="bg-white p-4 rounded-lg inline-block mb-4">
                <QRCodeSVG
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/qr/${qrData.qrToken}`}
                  size={200}
                  level="M"
                />
              </div>
              <p className="text-[#D4CFC6] text-sm mb-6">Show this QR code at the shop</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    const canvas = document.querySelector('canvas');
                    if (canvas) {
                      const link = document.createElement('a');
                      link.download = `dungeon-inn-qr-${qrData.reservationId}.png`;
                      link.href = canvas.toDataURL('image/png');
                      link.click();
                    }
                  }}
                  className="px-6 py-2 bg-[#E57A00] text-[#1A110A] font-bold rounded hover:bg-[#c46a00] transition-colors"
                >
                  📥 Download QR
                </button>
                <button
                  onClick={() => router.push('/mybookings')}
                  className="px-6 py-2 bg-[#403A36] text-[#F0E5D8] rounded hover:bg-[#E57A00] hover:text-[#1A110A] transition-colors font-bold"
                >
                  My Bookings →
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-[#2B2B2B] border border-[#403A36] rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-[#F0E5D8] mb-4">Booking Details</h2>
          
          {shop && (
            <div className="mb-4">
              <p className="text-[#8A8177]">Shop</p>
              <p className="text-[#D4CFC6] font-medium">{shop.name}</p>
              <p className="text-[#A88C6B] text-sm mt-1">
                🕐 Open: {shop.openTime} - {shop.closeTime}
              </p>
            </div>
          )}

          {service && (
            <div className="mb-4">
              <p className="text-[#8A8177]">Service</p>
              <p className="text-[#D4CFC6] font-medium">{service.name}</p>
              <p className="text-[#E57A00]">฿{service.price} • {service.duration} mins</p>
            </div>
          )}

          {/* EPIC 4: Price Breakdown */}
          {service && (
            <div className="border-t border-[#403A36] pt-4 mt-4">
              <h3 className="text-lg font-semibold text-[#F0E5D8] mb-3">Price</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-[#D4CFC6]">
                  <span>Original Price</span>
                  <span>฿{service.price}</span>
                </div>
                {promoApplied && (
                  <>
                    <div className="flex justify-between text-green-400">
                      <span>Discount ({promoApplied.discountType === 'flat' ? `฿${promoApplied.discountValue} off` : `${promoApplied.discountValue}% off`})</span>
                      <span>-฿{promoApplied.discountAmount}</span>
                    </div>
                    <div className="border-t border-[#403A36] pt-2 flex justify-between text-[#E57A00] font-bold text-lg">
                      <span>Final Price</span>
                      <span>฿{promoApplied.finalPrice}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="bg-[#2B2B2B] border border-[#403A36] rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-[#F0E5D8] mb-6">Select Date & Time</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-[#A88C6B] text-sm font-bold mb-2">Date</label>
              <input
                type="date"
                value={resvDate}
                onChange={(e) => setResvDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#403A36] rounded text-[#D4CFC6] focus:outline-none focus:border-[#E57A00]"
                required
              />
            </div>
            <div>
              <label className="block text-[#A88C6B] text-sm font-bold mb-2">
                Time
                {shop && (
                  <span className="text-[#8A8177] font-normal ml-2">
                    ({shop.openTime} - {shop.closeTime})
                  </span>
                )}
              </label>
              <input
                type="time"
                value={resvTime}
                onChange={(e) => setResvTime(e.target.value)}
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#403A36] rounded text-[#D4CFC6] focus:outline-none focus:border-[#E57A00]"
                required
              />
              {timeError && <p className="text-red-400 text-sm mt-2">{timeError}</p>}
            </div>
          </div>
        </form>

        {/* EPIC 4: Promotion Code Section */}
        <div className="bg-[#2B2B2B] border border-[#403A36] rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-[#F0E5D8] mb-4">Promotion Code</h2>
          
          {promoApplied ? (
            <div className="bg-green-900/30 border border-green-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-400 font-bold">✅ {promoApplied.name}</span>
                <button
                  type="button"
                  onClick={handleRemovePromo}
                  className="text-red-400 text-sm hover:text-red-300"
                >
                  Remove
                </button>
              </div>
              <p className="text-[#D4CFC6] text-sm">
                Code: <span className="font-mono">{promoApplied.code}</span> — {promoApplied.discountType === 'flat' ? `฿${promoApplied.discountValue} off` : `${promoApplied.discountValue}% off`}
              </p>
              <p className="text-green-400 text-sm mt-1">
                You save ฿{promoApplied.discountAmount}!
              </p>
            </div>
          ) : (
            <div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoError(''); }}
                  placeholder="Enter promotion code"
                  className="flex-1 px-4 py-3 bg-[#1A1A1A] border border-[#403A36] rounded text-[#D4CFC6] focus:outline-none focus:border-[#E57A00] uppercase font-mono"
                  disabled={!service}
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  disabled={promoValidating || !promoCode.trim() || !service}
                  className="px-6 py-3 bg-[#E57A00] text-[#1A110A] font-bold rounded hover:bg-[#c46a00] transition-colors disabled:opacity-50"
                >
                  {promoValidating ? 'Checking...' : 'Apply'}
                </button>
              </div>
              {promoError && <p className="text-red-400 text-sm mt-2">{promoError}</p>}
              {!service && <p className="text-[#8A8177] text-sm mt-2">Select a service first to apply promotion</p>}
            </div>
          )}
        </div>

        {/* Submit */}
        <form onSubmit={handleSubmit} className="bg-[#2B2B2B] border border-[#403A36] rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[#8A8177]">Total</span>
            <span className="text-2xl font-bold text-[#E57A00]">฿{displayPrice}</span>
          </div>
          <div className="flex gap-4">
            <Link
              href={`/shop/${shopId}`}
              className="flex-1 py-3 bg-[#454545] text-[#D4CFC6] font-bold rounded text-center hover:bg-[#5a5a5a] transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting || !!timeError}
              className="flex-1 py-3 bg-[#E57A00] text-[#1A110A] font-bold rounded hover:bg-[#c46a00] transition-colors disabled:opacity-50"
            >
              {submitting ? 'Booking...' : `Confirm Booking ฿${displayPrice}`}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
