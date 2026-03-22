'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { getShop } from '@/libs/shops';
import { getService } from '@/libs/services';
import { createReservation } from '@/libs/reservations';
import { Shop, Service } from '@/interface';
import Link from 'next/link';

// Parse time string to minutes since midnight
function parseTimeToMinutes(time: string): number {
  const [hour, min] = time.split(':').map(Number);
  return hour * 60 + min;
}

// Check if selected time is within shop hours
// Handles overnight hours (e.g., 21:00 - 02:00) and midnight closing (e.g., 09:00 - 00:00)
function isWithinShopHours(time: string, openTime: string, closeTime: string): boolean {
  const selectedValue = parseTimeToMinutes(time);
  const openValue = parseTimeToMinutes(openTime);
  let closeValue = parseTimeToMinutes(closeTime);

  // Handle midnight (00:00) as end of day (24:00)
  if (closeValue === 0) {
    closeValue = 24 * 60; // 1440 minutes = 24:00
  }

  // Check if hours span midnight (close time is earlier than open time)
  if (closeValue < openValue) {
    // Overnight hours: valid if after open OR before close
    return selectedValue >= openValue || selectedValue <= closeValue;
  }

  // Normal hours: valid if between open and close
  return selectedValue >= openValue && selectedValue <= closeValue;
}

// Check if service duration fits within shop hours
// Returns { valid: boolean, endTime: string, error?: string }
function checkServiceDuration(
  startTime: string,
  durationMinutes: number,
  openTime: string,
  closeTime: string
): { valid: boolean; endTime: string; error?: string } {
  const startValue = parseTimeToMinutes(startTime);
  const openValue = parseTimeToMinutes(openTime);
  let closeValue = parseTimeToMinutes(closeTime);

  // Handle midnight (00:00) as end of day (24:00)
  if (closeValue === 0) {
    closeValue = 24 * 60;
  }

  const endValue = startValue + durationMinutes;
  const endHour = Math.floor(endValue / 60) % 24;
  const endMin = endValue % 60;
  const endTime = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

  // Check if hours span midnight
  if (closeValue < openValue) {
    // Overnight hours: service must fit within the overnight window
    // Valid start times: between open and (close - duration)
    // OR if service wraps past midnight, it must end before close
    const maxStartForSameDay = closeValue - durationMinutes;

    if (startValue >= openValue) {
      // Starting after open (same day)
      if (endValue <= 24 * 60) {
        // Ends same day, must be before midnight
        return { valid: true, endTime };
      } else {
        // Wraps to next day, must end before close
        const nextDayEnd = endValue - 24 * 60;
        if (nextDayEnd <= closeValue) {
          return { valid: true, endTime };
        }
        return {
          valid: false,
          endTime,
          error: `Service ends at ${endTime} but shop closes at ${closeTime}`,
        };
      }
    } else if (startValue <= closeValue) {
      // Starting before close (next day portion)
      if (endValue <= closeValue) {
        return { valid: true, endTime };
      }
      return {
        valid: false,
        endTime,
        error: `Service ends at ${endTime} but shop closes at ${closeTime}`,
      };
    }

    return {
      valid: false,
      endTime,
      error: `Invalid time for overnight hours`,
    };
  }

  // Normal hours (same day)
  if (endValue > closeValue) {
    return {
      valid: false,
      endTime,
      error: `Service ends at ${endTime} but shop closes at ${closeTime}`,
    };
  }

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
  const [timeError, setTimeError] = useState('');

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

  // Validate time and service duration when shop, time, or service changes
  useEffect(() => {
    if (shop && resvTime) {
      if (!isWithinShopHours(resvTime, shop.openTime, shop.closeTime)) {
        setTimeError(`Please select a time between ${shop.openTime} and ${shop.closeTime}`);
      } else if (service && service.duration > 0) {
        const durationCheck = checkServiceDuration(
          resvTime,
          service.duration,
          shop.openTime,
          shop.closeTime
        );
        if (!durationCheck.valid) {
          setTimeError(durationCheck.error || 'Service duration exceeds shop hours');
        } else {
          setTimeError('');
        }
      } else {
        setTimeError('');
      }
    } else {
      setTimeError('');
    }
  }, [shop, service, resvTime]);

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
      const durationCheck = checkServiceDuration(
        resvTime,
        service.duration,
        shop.openTime,
        shop.closeTime
      );
      if (!durationCheck.valid) {
        setError(durationCheck.error || 'Service duration exceeds shop hours');
        return;
      }
    }

    setSubmitting(true);

    try {
      const resvDateTime = new Date(`${resvDate}T${resvTime}`).toISOString();
      
      const res = await createReservation({
        resvDate: resvDateTime,
        shop: shopId!,
        service: serviceId!,
      }, token!);

      if (res.success) {
        setSuccess(res.message || 'Booking created successfully!');
        setTimeout(() => {
          router.push('/mybookings');
        }, 2000);
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

        {success && (
          <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded mb-6">
            {success}
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
        </div>

        <form onSubmit={handleSubmit} className="bg-[#2B2B2B] border border-[#403A36] rounded-lg p-6">
          <h2 className="text-xl font-bold text-[#F0E5D8] mb-6">Select Date & Time</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-[#A88C6B] text-sm font-bold mb-2">
                Date
              </label>
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
              {timeError && (
                <p className="text-red-400 text-sm mt-2">{timeError}</p>
              )}
            </div>
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
              {submitting ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}