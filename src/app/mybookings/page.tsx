'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { getReservations, deleteReservation } from '@/libs/reservations';
import { uploadSlip } from '@/libs/promotions';
import { Reservation } from '@/interface';
import Link from 'next/link';
import EditBookingModal from '@/components/EditBookingModal';
import ReviewModal from '@/components/ReviewModal';
import { QRCodeSVG } from 'qrcode.react';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import ErrorBanner from '@/components/ErrorBanner';
import { Skeleton, SkeletonGrid } from '@/components/Skeleton';
import { API_URL } from '@/libs/config';
import { getStatusColor, getPaymentStatusColor, getPaymentStatusLabel } from '@/utils/reservationStatus';
import Pagination from '@/components/Pagination';
import { useToast } from '@/components/ToastContext';
import ConfirmDialog from '@/components/ConfirmDialog';

const STATUS_TABS = [
  { key: 'all', label: 'All', emoji: '' },
  { key: 'pending', label: 'Pending', emoji: '🕐' },
  { key: 'confirmed', label: 'Confirmed', emoji: '✅' },
  { key: 'completed', label: 'Completed', emoji: '🏁' },
  { key: 'cancelled', label: 'Cancelled', emoji: '❌' },
] as const;

type StatusFilter = typeof STATUS_TABS[number]['key'];
const PAGE_SIZE = 6;

export default function MyBookingsPage() {
  const { token } = useSelector((state: RootState) => state.auth);
  const [allReservations, setAllReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [reviewingReservation, setReviewingReservation] = useState<Reservation | null>(null);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [qrReservation, setQrReservation] = useState<Reservation | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { addToast } = useToast();
  const [pendingCancelId, setPendingCancelId] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    async function fetchReservations() {
      try {
        const res = await getReservations(token!, true);
        if (res.success) {
          setAllReservations(res.data);
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

  // Filter + search
  const filteredReservations = useMemo(() => {
    let list = allReservations;
    if (statusFilter !== 'all') {
      list = list.filter((r) => r.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((r) => {
        const shopName = r.shop && typeof r.shop === 'object' ? r.shop.name.toLowerCase() : '';
        const serviceName = r.service && typeof r.service === 'object' ? r.service.name.toLowerCase() : '';
        return shopName.includes(q) || serviceName.includes(q);
      });
    }
    return list;
  }, [allReservations, statusFilter, searchQuery]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredReservations.length / PAGE_SIZE));
  const paginatedReservations = filteredReservations.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Reset page on filter/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchQuery]);

  const handleDelete = (id: string) => {
    setPendingCancelId(id);
  };

  const confirmDelete = async () => {
    const id = pendingCancelId!;
    setPendingCancelId(null);
    try {
      const res = await deleteReservation(id, token!);
      if (res.success) {
        setAllReservations(allReservations.map((r) => 
          r._id === id ? { ...r, status: 'cancelled' } : r
        ));
      } else {
        addToast(res.message || 'Failed to cancel booking');
      }
    } catch {
      addToast('Error canceling booking');
    }
  };

  const handleUpdate = (updated: Reservation) => {
    setAllReservations(allReservations.map((r) => (r._id === updated._id ? updated : r)));
    setEditingReservation(null);
  };

  const handleSlipUpload = async (reservationId: string, file: File) => {
    setUploadingId(reservationId);
    try {
      const res = await uploadSlip(reservationId, file, token!);
      if (res.success) {
        setAllReservations(allReservations.map((r) => 
          r._id === reservationId ? { ...r, ...res.data } : r
        ));
      } else {
        addToast(res.message || 'Failed to upload slip');
      }
    } catch {
      addToast('Error uploading slip');
    } finally {
      setUploadingId(null);
    }
  };

  const canEdit = (reservation: Reservation): boolean => {
    return reservation.status === 'pending' || reservation.status === 'confirmed';
  };

  // Count per status
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allReservations.length };
    for (const r of allReservations) {
      counts[r.status] = (counts[r.status] || 0) + 1;
    }
    return counts;
  }, [allReservations]);

  if (loading) {
    return (
      <main className="min-h-screen bg-dungeon-canvas py-8 px-4">
        <Skeleton className="h-8 w-48 mb-6" />
        <SkeletonGrid count={3} lines={4} />
      </main>
    );
  }

  return (
    <>
    <main className="min-h-screen bg-dungeon-canvas py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-dungeon-header-text mb-8 text-center">
          My Bookings
        </h1>

        {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

        {/* Search bar */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by shop or service name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dungeon-surface border border-dungeon-outline rounded-lg px-4 py-3 pl-10 text-dungeon-primary placeholder-dungeon-secondary focus:border-dungeon-accent focus:outline-none transition-colors"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dungeon-secondary">🔍</span>
          </div>
        </div>

        {/* Status tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                statusFilter === tab.key
                  ? 'bg-dungeon-accent text-dungeon-dark-text'
                  : 'bg-dungeon-surface text-dungeon-secondary border border-dungeon-outline hover:border-dungeon-accent hover:text-dungeon-primary'
              }`}
            >
              {tab.emoji} {tab.label}
              {statusCounts[tab.key] !== undefined && (
                <span className={`ml-1.5 text-xs ${statusFilter === tab.key ? 'text-dungeon-dark-text/70' : 'text-dungeon-muted'}`}>
                  {statusCounts[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {allReservations.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-dungeon-secondary text-xl mb-4">No bookings yet</p>
            <Link
              href="/shops"
              className="inline-block px-6 py-3 bg-dungeon-accent text-dungeon-dark-text font-bold rounded hover:bg-dungeon-accent-dark transition-colors"
            >
              Browse Shops
            </Link>
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-dungeon-secondary text-xl">No bookings match your filter</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {paginatedReservations.map((reservation) => (
                <div
                  key={reservation._id}
                  className="bg-dungeon-surface border border-dungeon-outline rounded-lg p-6"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-dungeon-header-text">
                        {reservation.service && typeof reservation.service === 'object'
                          ? reservation.service.name
                          : 'Service'}
                      </h3>
                      {reservation.shop && typeof reservation.shop === 'object' ? (
                        <Link
                          href={`/shop/${reservation.shop._id}`}
                          className="text-dungeon-sub-header hover:text-dungeon-accent transition-colors"
                        >
                          {reservation.shop.name}
                        </Link>
                      ) : (
                        <p className="text-dungeon-sub-header">Shop</p>
                      )}
                      <p className="text-dungeon-secondary text-sm mt-1">
                        📅 {new Date(reservation.resvDate).toLocaleString()}
                      </p>
                      
                      {reservation.originalPrice != null && (
                        <p className="text-dungeon-accent text-sm mt-1">
                          {(reservation.discountAmount ?? 0) > 0 ? (
                            <>
                              <span className="line-through text-dungeon-secondary">฿{reservation.originalPrice}</span>
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

                      {reservation.paymentStatus && reservation.paymentStatus !== 'none' && (
                        <p className={`text-sm mt-1 ${getPaymentStatusColor(reservation.paymentStatus)}`}>
                          💳 {getPaymentStatusLabel(reservation.paymentStatus)}
                        </p>
                      )}
                      {reservation.slipImageUrl && (
                        <img
                          src={`${API_URL.replace('/api/v1', '')}${reservation.slipImageUrl}`}
                          alt="Payment slip"
                          className="mt-2 h-20 rounded border border-dungeon-outline object-cover"
                        />
                      )}
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <div className="flex gap-2 flex-wrap justify-end">
                        {reservation.qrToken && reservation.qrActive && reservation.status !== 'cancelled' && reservation.status !== 'completed' && (
                          <button
                            onClick={() => setQrReservation(reservation)}
                            className="px-4 py-2 bg-dungeon-canvas border border-dungeon-outline text-dungeon-header-text rounded hover:border-dungeon-accent transition-colors text-sm"
                          >
                            📱 Show QR
                          </button>
                        )}
                        {canEdit(reservation) && (
                          <button
                            onClick={() => setEditingReservation(reservation)}
                            className="px-4 py-2 bg-dungeon-accent text-dungeon-dark-text font-bold rounded hover:bg-dungeon-accent-dark transition-colors"
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
                            className="px-4 py-2 bg-dungeon-outline text-dungeon-header-text rounded hover:bg-dungeon-accent hover:text-dungeon-dark-text transition-colors font-bold"
                          >
                            ⭐ Review
                          </button>
                        )}
                        {reservation.status === 'completed' && reviewedIds.has(reservation._id) && (
                          <span className="px-4 py-2 text-dungeon-secondary text-sm flex items-center">✓ Reviewed</span>
                        )}
                      </div>

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

            {/* Pagination */}
            <Pagination totalPages={totalPages} currentPage={currentPage} onPageChange={setCurrentPage} />
          </>
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
          <div className="bg-dungeon-surface border border-dungeon-outline rounded-xl p-8 max-w-md w-full text-center">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-dungeon-header-text">Your QR Code</h2>
              <button onClick={() => setQrReservation(null)} className="text-dungeon-secondary hover:text-dungeon-header-text text-xl">✕</button>
            </div>
            {qrReservation.qrActive ? (
              <>
                <QRCodeDisplay token={qrReservation.qrToken!} />
                <p className="text-dungeon-primary text-sm mb-2">Show this QR code at the shop</p>
                <p className="text-dungeon-secondary text-xs mb-4">
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
                  className="px-6 py-2 bg-dungeon-accent text-dungeon-dark-text font-bold rounded hover:bg-dungeon-accent-dark transition-colors"
                >
                  📥 Download QR
                </button>
              </>
            ) : (
              <div className="py-8">
                <p className="text-red-400 text-lg mb-2">⛔ QR Code Void</p>
                <p className="text-dungeon-secondary text-sm">This QR code is no longer valid.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
    <ConfirmDialog
      open={pendingCancelId !== null}
      title="Cancel Booking"
      message="Are you sure you want to cancel this booking? This action cannot be undone."
      confirmLabel="Cancel Booking"
      onConfirm={confirmDelete}
      onCancel={() => setPendingCancelId(null)}
    />
    </>
  );
}
