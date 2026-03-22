'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { getReservations, updateReservation, deleteReservation } from '@/libs/reservations';
import { Reservation } from '@/interface';
import Link from 'next/link';
import EditBookingModal from '@/components/EditBookingModal';

interface PaginationData {
  total: number;
  page: number;
  pages: number;
  limit: number;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function AdminBookingsPage() {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  
  // Pagination & Search states
  const [currentPage, setCurrentPage] = useState(1);
  const [searchUser, setSearchUser] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCanceled, setShowCanceled] = useState(true);
  
  // Debounced search
  const debouncedSearchUser = useDebounce(searchUser, 500);
  
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    async function fetchReservations() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('page', currentPage.toString());
        params.set('limit', ITEMS_PER_PAGE.toString());
        
        if (statusFilter) {
          params.set('status', statusFilter);
        }
        
        const res = await getReservations(token!, false, params.toString());
        if (res.success) {
          let filtered = res.data;
          
          // Client-side filter by username (using debounced value)
          if (debouncedSearchUser) {
            filtered = filtered.filter((r: Reservation) => {
              const userName = typeof r.user === 'object' ? r.user.name : '';
              return userName.toLowerCase().includes(debouncedSearchUser.toLowerCase());
            });
          }
          
          // Filter out cancelled bookings if showCanceled is false
          if (!showCanceled) {
            filtered = filtered.filter((r: Reservation) => r.status !== 'cancelled');
          }
          
          setReservations(filtered);
          // Handle both old and new pagination format
          const paginationData = res.pagination || {
            total: res.count || 0,
            page: currentPage,
            pages: Math.ceil((res.count || 0) / ITEMS_PER_PAGE),
            limit: ITEMS_PER_PAGE
          };
          setPagination(paginationData);
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
  }, [token, user, currentPage, statusFilter, debouncedSearchUser, showCanceled]);

  const handleUpdateStatus = async (id: string) => {
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

  const handleUpdateDate = (updated: Reservation) => {
    setReservations(reservations.map((r) => (r._id === updated._id ? updated : r)));
    setEditingReservation(null);
  };

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
        alert(res.message || 'Failed to cancel');
      }
    } catch {
      alert('Error canceling reservation');
    }
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

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const totalPages = pagination?.pages || 1;
    const pages: (number | string)[] = [];
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
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

        {/* Search & Filter */}
        <div className="bg-[#2B2B2B] border border-[#403A36] rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search by username */}
            <div>
              <label className="block text-[#8A8177] text-sm mb-2">Search User</label>
              <input
                type="text"
                placeholder="Enter username..."
                value={searchUser}
                onChange={(e) => {
                  // Remove illegal characters: backslash, forward slash, <, >, &, quotes
                  const sanitized = e.target.value.replace(/[\\/<>&"']/g, '');
                  setSearchUser(sanitized);
                }}
                className="w-full bg-[#1A1A1A] border border-[#403A36] rounded-lg px-4 py-2 text-[#F0E5D8] focus:border-[#E57A00] focus:outline-none"
              />
              {debouncedSearchUser && searchUser !== debouncedSearchUser && (
                <span className="text-[#E57A00] text-xs mt-1 block">Searching...</span>
              )}
            </div>
            
            {/* Status Filter */}
            <div>
              <label className="block text-[#8A8177] text-sm mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#403A36] rounded-lg px-4 py-2 text-[#F0E5D8] focus:border-[#E57A00] focus:outline-none"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            {/* Show Cancelled Toggle */}
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCanceled}
                  onChange={(e) => setShowCanceled(e.target.checked)}
                  className="w-4 h-4 rounded border-[#403A36] bg-[#1A1A1A] text-[#E57A00] focus:ring-[#E57A00]"
                />
                <span className="text-[#8A8177] text-sm">Show cancelled bookings</span>
              </label>
            </div>
          </div>
          
          {/* Results count */}
          <div className="mt-4 pt-4 border-t border-[#403A36]">
            <p className="text-[#8A8177] text-sm">
              {pagination ? (
                debouncedSearchUser ? (
                  `Showing ${reservations.length} filtered bookings (from ${pagination.total} total)`
                ) : (
                  `Showing ${(currentPage - 1) * ITEMS_PER_PAGE + 1} - ${Math.min(currentPage * ITEMS_PER_PAGE, pagination.total)} of ${pagination.total} bookings`
                )
              ) : (
                'Loading...'
              )}
              {!showCanceled && ' (cancelled bookings hidden)'}
            </p>
          </div>
        </div>

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
                    {reservation.service && typeof reservation.service === 'object'
                      ? reservation.service.name
                      : 'Service'}
                  </p>
                  {reservation.shop && typeof reservation.shop === 'object' ? (
                    <Link
                      href={`/shop/${reservation.shop._id}`}
                      className="text-[#A88C6B] text-sm hover:text-[#E57A00] transition-colors"
                    >
                      {reservation.shop.name}
                    </Link>
                  ) : (
                    <p className="text-[#A88C6B] text-sm">Shop</p>
                  )}
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
                      <option value="cancelled">Cancelled</option>
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
                        onClick={() => handleUpdateStatus(reservation._id)}
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
                        Edit Status
                      </button>
                      <button
                        onClick={() => setEditingReservation(reservation)}
                        className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Edit Date
                      </button>
                      {reservation.status !== 'cancelled' && reservation.status !== 'completed' && (
                        <button
                          onClick={() => handleDelete(reservation._id)}
                          className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination - hide when searching since results are client-side filtered */}
        {pagination && pagination.pages > 1 && !debouncedSearchUser && (
          <div className="flex justify-center items-center gap-2 mt-12">
            {/* Previous */}
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-[#2B2B2B] border border-[#403A36] rounded-lg text-[#F0E5D8] disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#E57A00] transition-colors"
            >
              ← Prev
            </button>

            {/* Page Numbers */}
            <div className="flex gap-1">
              {getPageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' && setCurrentPage(page)}
                  disabled={page === '...'}
                  className={`w-10 h-10 rounded-lg border transition-colors ${
                    page === currentPage
                      ? 'bg-[#E57A00] border-[#E57A00] text-[#1A110A] font-bold'
                      : page === '...'
                      ? 'bg-transparent border-transparent text-[#8A8177] cursor-default'
                      : 'bg-[#2B2B2B] border-[#403A36] text-[#F0E5D8] hover:border-[#E57A00]'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            {/* Next */}
            <button
              onClick={() => setCurrentPage(p => Math.min(pagination.pages, p + 1))}
              disabled={currentPage === pagination.pages}
              className="px-4 py-2 bg-[#2B2B2B] border border-[#403A36] rounded-lg text-[#F0E5D8] disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#E57A00] transition-colors"
            >
              Next →
            </button>
          </div>
        )}

        {/* Message when searching with filtered results */}
        {debouncedSearchUser && reservations.length > 0 && (
          <p className="text-center text-[#8A8177] text-sm mt-8">
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
  );
}
