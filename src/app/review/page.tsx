'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
import { RootState } from '@/redux/store';
import ReviewModal from '@/components/ReviewModal';
import { API_URL } from '@/libs/config';
import LoadingState from '@/components/LoadingState';

export default function ReviewPage() {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const searchParams = useSearchParams();
  const reservationId = searchParams.get('reservationId');
  const [reservation, setReservation] = useState<{ shopName: string; serviceName: string } | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push(`/login?next=/review?reservationId=${reservationId}`);
      return;
    }
    if (reservationId) loadReservation();
  }, [token, reservationId]);

  async function loadReservation() {
    try {
      const res = await fetch(`${API_URL}/reservations/${reservationId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setReservation({
          shopName: data.data.shop?.name || data.data.shopName || 'Unknown Shop',
          serviceName: data.data.service?.name || data.data.serviceName || 'Unknown Service',
        });
      }
    } catch {}
    setLoading(false);
  }

  if (!reservationId) {
    return (
      <main className="min-h-screen bg-dungeon-canvas flex items-center justify-center">
        <div className="text-center">
          <p className="text-dungeon-secondary text-xl">Invalid review link</p>
          <a href="/" className="text-dungeon-accent text-sm mt-2 inline-block hover:underline">Go home</a>
        </div>
      </main>
    );
  }

  if (loading) return <LoadingState message="Loading reservation..." />;

  function handleDone() {
    setShowReview(false);
    router.push('/mybookings');
  }

  return (
    <main className="min-h-screen bg-dungeon-canvas flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-dungeon-header-text mb-4">Leave a Review</h1>
        <p className="text-dungeon-sub-header mb-6">
          {reservation ? `${reservation.shopName} - ${reservation.serviceName}` : 'Share your experience'}
        </p>
        <button onClick={() => setShowReview(true)}
          className="px-8 py-3 bg-dungeon-accent text-dungeon-dark-text font-bold rounded-xl hover:bg-dungeon-accent-dark transition-colors">
          Write Review
        </button>
      </div>

      {showReview && reservation && (
        <ReviewModal
          reservationId={reservationId}
          shopName={reservation.shopName}
          serviceName={reservation.serviceName}
          token={token!}
          onDone={handleDone}
          onClose={handleDone}
        />
      )}
    </main>
  );
}
