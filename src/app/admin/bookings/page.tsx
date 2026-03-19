'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { getReservations, updateReservation, deleteReservation } from '@/libs/reservations';
import { Reservation } from '@/interface';

export default function AdminBookingsPage() {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    async function fetchReservations() {
      try {
        const res = await getReservations(token!);
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

    if (token && user?.role === 'admin') {
      fetchReservations();
    }
  }, [token, user]);

  const handleUpdate = async (id: string) => {
    try {
      const res = await updateReservation(id, { status: newStatus }, token!);
      if (res.success) {
        setReservations(reservations.map((r) => (r._id === id ? res.data : r)));
        setEditingId(null);
      } else {
        alert(res.message || 'Failed to update');
      }
    } catch {
      alert('Error updating reservation');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;

    try {
      const res = await deleteReservation(id, token!);
      if (res.success) {
        setReservations(reservations.filter((r) => r._id !== id));
      } else {
        alert(res.message || 'Failed to delete');
      }
    } catch {
      alert('Error deleting reservation');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'canceled':
        return 'text-red-400';
      default:
        return 'text-[#8A8177]';
    }
  };

  if (user?.role !== 'admin') {
    return (
      <main className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-red-400 text-xl">Access Denied</div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-[#E57A00] text-xl">Loading all bookings...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#1A1A1A] py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-[#F0E5D8] mb-8 text-center">
          All Bookings (Admin)
        </h1>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {reservations.map((reservation) => (
            <div
              key={reservation._id}
              className="bg-[#2B2B2B] border border-[#403A36] rounded-lg p-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-[#8A8177] text-sm">User</p>
                  <p className="text-[#D4CFC6] font-medium">
                    {typeof reservation.user === 'object'
                      ? reservation.user.name
                      : 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-[#8A8177] text-sm">Service</p>
                  <p className="text-[#D4CFC6] font-medium">
                    {typeof reservation.service === 'object'
                      ? reservation.service.name
                      : 'Service'}
                  </p>
                  <p className="text-[#A88C6B] text-sm">
                    {typeof reservation.shop === 'object'
                      ? reservation.shop.name
                      : 'Shop'}
                  </p>
                </div>
                <div>
                  <p className="text-[#8A8177] text-sm">Date & Time</p>
                  <p className="text-[#D4CFC6]">
                    {new Date(reservation.resvDate).toLocaleString()}
                  </p>
                  {editingId === reservation._id ? (
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="mt-2 w-full px-2 py-1 bg-[#1A1A1A] border border-[#403A36] rounded text-[#D4CFC6]"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="canceled">Canceled</option>
                      <option value="completed">Completed</option>
                    </select>
                  ) : (
                    <p className={`font-bold ${getStatusColor(reservation.status)}`}>
                      {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 items-end">
                  {editingId === reservation._id ? (
                    <>
                      <button
                        onClick={() => handleUpdate(reservation._id)}
                        className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-2 bg-[#454545] text-[#D4CFC6] rounded hover:bg-[#5a5a5a] transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(reservation._id);
                          setNewStatus(reservation.status);
                        }}
                        className="px-3 py-2 bg-[#E57A00] text-[#1A110A] rounded hover:bg-[#c46a00] transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(reservation._id)}
                        className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}