'use client';

import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { getReservations, deleteReservation } from '@/libs/reservations';
import { uploadSlip } from '@/libs/promotions';
import { Reservation } from '@/interface';
import Link from 'next/link';
import EditBookingModal from '@/components/EditBookingModal';
import ReviewModal from '@/components/ReviewModal';
import { QRCodeSVG } from 'qrcode.react';
import { API_URL } from '@/libs/config';

export default function MyBookingsPage() {
  const { token } = useSelector((state: RootState) => state.auth);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [reviewingReservation, setReviewingReservation] = useState<Reservation | null>(null);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [qrReservation, setQrReservation] = useState<Reservation | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    async function fetchReservations() {
      try {
        const res = await getReservations(token!, true);
        if (res.success) {
          setReservations(res.data);
          const completed = res.data.filter((r: Reservation) => r.status === 'completed');
          const checks = await Promise.all(
            completed.map((r: Reservation) =>
              fetch(`${API_URL}/reviews/check/${r._id}`, {
                headers: { Authorization: `Bearer ${token}` },
              }).then((x) => x.json())
            )
          );
          const alreadyReviewed = new Set<string>(
            completed
              .filter((_: Reservation, i: number) => checks[i]?.reviewed)
              .map((r: Reservation) => r._id as string)
          );
          setReviewedIds(alreadyReviewed);
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

  // EPIC 4: Handle slip upload
  const handleSlipUpload = async (reservationId: string, file: File) => {
    setUploadingId(reservationId);
    try {
      const res = await uploadSlip(reservationId, file, token!);
      if (res.success) {
        setReservations(reservations.map((r) => 
          r._id === reservationId ? { ...r, ...res.data } : r
        ));
      } else {
        alert(res.message || 'Failed to upload slip');
      }
    } catch {
      alert('Error uploading slip');
    } finally {
      setUploadingId(null);
    }
  };

  const canEdit = (reservation: Reservation): boolean => {
    return reservation.status === 'pending' || reservation.status === 'confirmed';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'cancelled': return 'text-red-400';
      default: return 'text-[#8A8177]';
    }
  };

  const getPaymentStatusColor = (ps?: string) => {
    switch (ps) {
      case 'approved': return 'text-green-400';
      case 'waiting_verification': return 'text-yellow-400';
      case 'rejected': return 'text-red-400';
      default: return 'text-[#8A8177]';
    }
  };

  const getPaymentStatusLabel = (ps?: string) => {
    switch (ps) {
      case 'approved': return 'Payment Approved';
      case 'waiting_verification': return 'Waiting for Verification';
      case 'rejected': return 'Payment Rejected';
      case 'none': return 'No Payment';
      default: return 'No Payment';
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
                  <div className="flex-1">
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
                    
                    {/* Price with discount */}
                    {reservation.originalPrice != null && (
                      <p className="text-[#E57A00] text-sm mt-1">
                        {(reservation.discountAmount ?? 0) > 0 ? (
                          <>
                            <span className="line-through text-[#8A8177]">฿{reservation.originalPrice}</span>
                            {' → '}<span className="font-bold">฿{reservation.finalPrice}</span>
                            {reservation.promotionCode && (
                              <span className="text-green-400 ml-1">({reservation.promotionCode})</span>
                            )}
                          </>
                        ) : (
                          <>฿{reservation.originalPrice}</>
                        )}
                      </p>
                    )}

                    <p className={`text-sm mt-2 font-bold ${getStatusColor(reservation.status)}`}>
                      Status: {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                    </p>

                    {/* EPIC 4: Payment status & slip upload */}
                    {reservation.paymentStatus && reservation.paymentStatus !== 'none' && (
                      <p className={`text-sm mt-1 ${getPaymentStatusColor(reservation.paymentStatus)}`}>
                        💳 {getPaymentStatusLabel(reservation.paymentStatus)}
                      </p>
                    )}
                    {reservation.slipImageUrl && (
                      <img
                        src={`${API_URL.replace('/api/v1', '')}${reservation.slipImageUrl}`}
                        alt="Payment slip"
                        className="mt-2 h-20 rounded border border-[#403A36] object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <div className="flex gap-2 flex-wrap justify-end">
                      {/* US 6-3: Show QR button */}
                      {reservation.qrToken && reservation.qrActive && reservation.status !== 'cancelled' && reservation.status !== 'completed' && (
                        <button
                          onClick={() => setQrReservation(reservation)}
                          className="px-4 py-2 bg-[#1A1A1A] border border-[#403A36] text-[#F0E5D8] rounded hover:border-[#E57A00] transition-colors text-sm"
                        >
                          📱 Show QR
                        </button>
                      )}
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
                      {reservation.status === 'completed' && !reviewedIds.has(reservation._id) && (
                        <button
                          onClick={() => setReviewingReservation(reservation)}
                          className="px-4 py-2 bg-[#403A36] text-[#F0E5D8] rounded hover:bg-[#E57A00] hover:text-[#1A110A] transition-colors font-bold"
                        >
                          ⭐ Review
                        </button>
                      )}
                      {reservation.status === 'completed' && reviewedIds.has(reservation._id) && (
                        <span className="px-4 py-2 text-[#8A8177] text-sm flex items-center">✓ Reviewed</span>
                      )}
                    </div>

                    {/* EPIC 4: Upload slip button */}
                    {reservation.paymentStatus === 'none' && reservation.status !== 'cancelled' && reservation.status !== 'completed' && (
                      <div>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,application/pdf"
                          ref={(el) => { fileInputRefs.current[reservation._id] = el; }}
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleSlipUpload(reservation._id, file);
                          }}
                        />
                        <button
                          onClick={() => fileInputRefs.current[reservation._id]?.click()}
                          disabled={uploadingId === reservation._id}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
                        >
                          {uploadingId === reservation._id ? 'Uploading...' : '📎 Upload Slip'}
                        </button>
                      </div>
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

      {reviewingReservation && (
        <ReviewModal
          reservationId={reviewingReservation._id}
          shopName={
            reviewingReservation.shop && typeof reviewingReservation.shop === 'object'
              ? reviewingReservation.shop.name
              : 'Shop'
          }
          serviceName={
            reviewingReservation.service && typeof reviewingReservation.service === 'object'
              ? reviewingReservation.service.name
              : 'Service'
          }
          token={token!}
          onDone={() => {
            setReviewedIds((prev) => {
            const next = new Set(Array.from(prev));
            next.add(reviewingReservation._id);
            return next;
          });
            setReviewingReservation(null);
          }}
          onClose={() => setReviewingReservation(null)}
        />
      )}
      {/* US 6-3: QR Code Modal */}
      {qrReservation && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2B2B2B] border border-[#403A36] rounded-xl p-8 max-w-md w-full text-center">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#F0E5D8]">Your QR Code</h2>
              <button onClick={() => setQrReservation(null)} className="text-[#8A8177] hover:text-[#F0E5D8] text-xl">✕</button>
            </div>
            {qrReservation.qrActive ? (
              <>
                <div className="bg-white p-4 rounded-lg inline-block mb-4">
                  <QRCodeSVG
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/api/v1/qr/verify/${qrReservation.qrToken}`}
                    size={200}
                    level="M"
                  />
                </div>
                <p className="text-[#D4CFC6] text-sm mb-2">Show this QR code at the shop</p>
                <p className="text-[#8A8177] text-xs mb-4">
                  {qrReservation.shop && typeof qrReservation.shop === 'object' ? qrReservation.shop.name : 'Shop'} — {new Date(qrReservation.resvDate).toLocaleString()}
                </p>
                <button
                  onClick={() => {
                    const canvas = document.querySelector('#qr-modal canvas') as HTMLCanvasElement;
                    if (canvas) {
                      const link = document.createElement('a');
                      link.download = `dungeon-inn-qr-${qrReservation._id}.png`;
                      link.href = canvas.toDataURL('image/png');
                      link.click();
                    }
                  }}
                  className="px-6 py-2 bg-[#E57A00] text-[#1A110A] font-bold rounded hover:bg-[#c46a00] transition-colors"
                >
                  📥 Download QR
                </button>
              </>
            ) : (
              <div className="py-8">
                <p className="text-red-400 text-lg mb-2">⛔ QR Code Void</p>
                <p className="text-[#8A8177] text-sm">This QR code is no longer valid.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
