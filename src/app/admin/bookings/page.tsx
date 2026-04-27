'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useToast } from '@/components/ToastContext';
import ConfirmDialog from '@/components/ConfirmDialog';
import { getReservations, updateReservation, deleteReservation } from '@/libs/reservations';
import { verifySlip } from '@/libs/promotions';
import { Reservation } from '@/interface';
import EditBookingModal from '@/components/EditBookingModal';
import Pagination from '@/components/Pagination';
import ErrorBanner from '@/components/ErrorBanner';
import AccessDenied from '@/components/AccessDenied';
import { AdminBookingsSkeleton, FadeIn } from '@/components/Skeletons';
import BookingCard from '@/components/admin/BookingCard';
import { useDebounce } from '@/hooks/useDebounce';
import { PaginationData } from '@/types/api';

export default function AdminBookingsPage() {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const { addToast } = useToast();
  const [pendingCancelId, setPendingCancelId] = useState<string | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  // Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [searchUser, setSearchUser] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCanceled, setShowCanceled] = useState(true);
  const [paymentFilter, setPaymentFilter] = useState('');

  const debouncedSearchUser = useDebounce(searchUser, 500);
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    async function fetchReservations() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('page', currentPage.toString());
        params.set('limit', ITEMS_PER_PAGE.toString());
        if (statusFilter) params.set('status', statusFilter);

        const res = await getReservations(token!, false, params.toString());
        if (res.success) {
          let filtered = res.data;
          if (debouncedSearchUser) {
            filtered = filtered.filter((r: Reservation) => {
              const userName = typeof r.user === 'object' ? r.user.name : '';
              return userName.toLowerCase().includes(debouncedSearchUser.toLowerCase());
            });
          }
          if (!showCanceled) {
            filtered = filtered.filter((r: Reservation) => r.status !== 'cancelled');
          }
          if (paymentFilter) {
            filtered = filtered.filter((r: Reservation) => r.paymentStatus === paymentFilter);
          }
          setReservations(filtered);
          setPagination(res.pagination || {
            total: res.count || 0, page: currentPage,
            pages: Math.ceil((res.count || 0) / ITEMS_PER_PAGE), limit: ITEMS_PER_PAGE
          });
        } else {
          setError(res.message || 'Failed to load reservations');
        }
      } catch {
        setError('Error loading reservations');
      } finally {
        setLoading(false);
      }
    }
    if (token && user?.role === 'admin') fetchReservations();
  }, [token, user, currentPage, statusFilter, debouncedSearchUser, showCanceled, paymentFilter]);

  const handleUpdateStatus = async (id: string) => {
    try {
      const res = await updateReservation(id, { status: newStatus }, token!);
      if (res.success) {
        setReservations(reservations.map((r) => (r._id === id ? res.data : r)));
        setEditingId(null);
      } else {
        addToast(res.message || 'Failed to update');
      }
    } catch {
      addToast('Error updating reservation');
    }
  };

  const handleUpdateDate = (updated: Reservation) => {
    setReservations(reservations.map((r) => (r._id === updated._id ? updated : r)));
    setEditingReservation(null);
  };

  const handleDelete = (id: string) => {
    setPendingCancelId(id);
  };

  const confirmDelete = async () => {
    const id = pendingCancelId!;
    setPendingCancelId(null);
    try {
      const res = await deleteReservation(id, token!);
      if (res.success) {
        setReservations(reservations.map((r) => r._id === id ? { ...r, status: 'cancelled' } : r));
      } else {
        addToast(res.message || 'Failed to cancel');
      }
    } catch {
      addToast('Error canceling reservation');
    }
  };

  const handleVerifySlip = async (id: string, action: 'approve' | 'reject') => {
    setVerifyingId(id);
    try {
      const res = await verifySlip(id, action, token!);
      if (res.success) {
        setReservations(reservations.map((r) => (r._id === id ? { ...r, ...res.data } : r)));
      } else {
        addToast(res.message || 'Failed to verify slip');
      }
    } catch {
      addToast('Error verifying slip');
    } finally {
      setVerifyingId(null);
    }
  };

  if (user?.role !== 'admin') return <AccessDenied />;
  if (loading) return <AdminBookingsSkeleton />;

  return (<FadeIn>
    <>
    <main className="min-h-screen bg-dungeon-canvas py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-dungeon-header-text mb-8 text-center">All Bookings (Admin)</h1>

        {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

        {/* Search & Filter */}
        <div className="bg-dungeon-surface border border-dungeon-outline rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-dungeon-secondary text-sm mb-2">Search User</label>
              <input type="text" placeholder="Enter username..." value={searchUser}
                onChange={(e) => setSearchUser(e.target.value.replace(/[\\/<>&"']/g, ''))}
                className="w-full bg-dungeon-canvas border border-dungeon-outline rounded-lg px-4 py-2 text-dungeon-header-text focus:border-dungeon-accent focus:outline-none" />
              {debouncedSearchUser && searchUser !== debouncedSearchUser && (
                <span className="text-dungeon-accent text-xs mt-1 block">Searching...</span>
              )}
            </div>
            <div>
              <label className="block text-dungeon-secondary text-sm mb-2">Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-dungeon-canvas border border-dungeon-outline rounded-lg px-4 py-2 text-dungeon-header-text focus:border-dungeon-accent focus:outline-none">
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={showCanceled} onChange={(e) => setShowCanceled(e.target.checked)}
                  className="w-4 h-4 rounded border-dungeon-outline bg-dungeon-canvas text-dungeon-accent focus:ring-dungeon-accent" />
                <span className="text-dungeon-secondary text-sm">Show cancelled bookings</span>
              </label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-dungeon-outline">
            <div>
              <label className="block text-dungeon-secondary text-sm mb-2">Payment Status</label>
              <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full bg-dungeon-canvas border border-dungeon-outline rounded-lg px-4 py-2 text-dungeon-header-text focus:border-dungeon-accent focus:outline-none">
                <option value="">All</option>
                <option value="waiting_verification">Waiting for Verification</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="none">No Payment</option>
              </select>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-dungeon-outline">
            <p className="text-dungeon-secondary text-sm">
              {pagination ? (
                debouncedSearchUser
                  ? `Showing ${reservations.length} filtered bookings (from ${pagination.total} total)`
                  : `Showing ${(currentPage - 1) * ITEMS_PER_PAGE + 1} - ${Math.min(currentPage * ITEMS_PER_PAGE, pagination.total)} of ${pagination.total} bookings`
              ) : 'Loading...'}
              {!showCanceled && ' (cancelled bookings hidden)'}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {reservations.map((reservation) => (
            <BookingCard
              key={reservation._id}
              reservation={reservation}
              editingId={editingId}
              newStatus={newStatus}
              verifyingId={verifyingId}
              onSetEditingId={setEditingId}
              onSetNewStatus={setNewStatus}
              onUpdateStatus={handleUpdateStatus}
              onEditDate={setEditingReservation}
              onDelete={handleDelete}
              onVerifySlip={handleVerifySlip}
            />
          ))}
        </div>

        {/* Pagination - hide when searching since results are client-side filtered */}
        {!debouncedSearchUser && (
          <Pagination pagination={pagination} currentPage={currentPage} onPageChange={setCurrentPage} />
        )}

        {debouncedSearchUser && reservations.length > 0 && (
          <p className="text-center text-dungeon-secondary text-sm mt-8">
            Showing filtered results. Clear search to see all pages.
          </p>
        )}
      </div>

      <EditBookingModal
        reservation={editingReservation!}
        isOpen={!!editingReservation}
        onClose={() => setEditingReservation(null)}
        onUpdate={handleUpdateDate}
        token={token!}
        isAdmin={true}
      />
    </main>
    <ConfirmDialog
      open={pendingCancelId !== null}
      title="Cancel Booking"
      message="Are you sure you want to cancel this booking?"
      confirmLabel="Cancel Booking"
      onConfirm={confirmDelete}
      onCancel={() => setPendingCancelId(null)}
    />
    </>
  </FadeIn>);
}
