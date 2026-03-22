'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { getReservations, deleteReservation } from '@/libs/reservations';
import { Reservation } from '@/interface';
import Link from 'next/link';
import EditBookingModal from '@/components/EditBookingModal';

export default function MyBookingsPage() {
  const { token } = useSelector((state: RootState) => state.auth);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);

  useEffect(() => {
    async function fetchReservations() {
      try {
        const res = await getReservations(token!, true);
        if (res.success) {
          setReservations(res.data);
        } else {
          setError(res.message || 'Failed to load reservations');
        }
      } catch {
        setError('Error loading reservations');
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      fetchReservations();
    }
  }, [token]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const res = await deleteReservation(id, token!);
      if (res.success) {
        // Update the reservation status to cancelled instead of removing it
        setReservations(reservations.map((r) => 
          r._id === id ? { ...r, status: 'cancelled' } : r
        ));
      } else {
        alert(res.message || 'Failed to cancel booking');
      }
    } catch {
      alert('Error canceling booking');
    }
  };

  const handleUpdate = (updated: Reservation) => {
    setReservations(reservations.map((r) => (r._id === updated._id ? updated : r)));
    setEditingReservation(null);
  };

  const canEdit = (reservation: Reservation): boolean => {
    // Can edit if status is pending or confirmed (not cancelled or completed)
    return reservation.status === 'pending' || reservation.status === 'confirmed';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'cancelled':
        return 'text-red-400';
      default:
        return 'text-[#8A8177]';
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-[#E57A00] text-xl">Loading your bookings...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#1A1A1A] py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-[#F0E5D8] mb-8 text-center">
          My Bookings
        </h1>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {reservations.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[#8A8177] text-xl mb-4">No bookings yet</p>
            <Link
              href="/shops"
              className="inline-block px-6 py-3 bg-[#E57A00] text-[#1A110A] font-bold rounded hover:bg-[#c46a00] transition-colors"
            >
              Browse Shops
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation) => (
              <div
                key={reservation._id}
                className="bg-[#2B2B2B] border border-[#403A36] rounded-lg p-6"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#F0E5D8]">
                      {reservation.service && typeof reservation.service === 'object'
                        ? reservation.service.name
                        : 'Service'}
                    </h3>
                    {reservation.shop && typeof reservation.shop === 'object' ? (
                      <Link
                        href={`/shop/${reservation.shop._id}`}
                        className="text-[#A88C6B] hover:text-[#E57A00] transition-colors"
                      >
                        {reservation.shop.name}
                      </Link>
                    ) : (
                      <p className="text-[#A88C6B]">Shop</p>
                    )}
                    <p className="text-[#8A8177] text-sm mt-1">
                      📅 {new Date(reservation.resvDate).toLocaleString()}
                    </p>
                    <p className={`text-sm mt-2 font-bold ${getStatusColor(reservation.status)}`}>
                      Status: {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {canEdit(reservation) && (
                      <button
                        onClick={() => setEditingReservation(reservation)}
                        className="px-4 py-2 bg-[#E57A00] text-[#1A110A] font-bold rounded hover:bg-[#c46a00] transition-colors"
                      >
                        Edit
                      </button>
                    )}
                    {reservation.status !== 'completed' && reservation.status !== 'cancelled' && (
                      <button
                        onClick={() => handleDelete(reservation._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <EditBookingModal
        reservation={editingReservation!}
        isOpen={!!editingReservation}
        onClose={() => setEditingReservation(null)}
        onUpdate={handleUpdate}
        token={token!}
        isAdmin={false}
      />
    </main>
  );
}
