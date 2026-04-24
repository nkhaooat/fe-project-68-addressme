'use client';

import Link from 'next/link';
import { Reservation } from '@/interface';
import { API_URL } from '@/libs/config';
import { getStatusColor, getPaymentStatusColor, getPaymentStatusLabel } from '@/utils/reservationStatus';

interface BookingCardProps {
  reservation: Reservation;
  editingId: string | null;
  newStatus: string;
  verifyingId: string | null;
  onSetEditingId: (id: string | null) => void;
  onSetNewStatus: (status: string) => void;
  onUpdateStatus: (id: string) => void;
  onEditDate: (reservation: Reservation) => void;
  onDelete: (id: string) => void;
  onVerifySlip: (id: string, action: 'approve' | 'reject') => void;
}

export default function BookingCard({
  reservation, editingId, newStatus, verifyingId,
  onSetEditingId, onSetNewStatus, onUpdateStatus,
  onEditDate, onDelete, onVerifySlip,
}: BookingCardProps) {
  const isEditing = editingId === reservation._id;

  return (
    <div className="bg-dungeon-surface border border-dungeon-outline rounded-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <p className="text-dungeon-secondary text-sm">User</p>
          <p className="text-dungeon-primary font-medium">
            {typeof reservation.user === 'object' ? reservation.user.name : 'Unknown'}
          </p>
        </div>
        <div>
          <p className="text-dungeon-secondary text-sm">Service</p>
          <p className="text-dungeon-primary font-medium">
            {reservation.service && typeof reservation.service === 'object'
              ? reservation.service.name : 'Service'}
          </p>
          {reservation.shop && typeof reservation.shop === 'object' ? (
            <Link href={`/shop/${(reservation.shop as { _id: string })._id}`}
              className="text-dungeon-sub-header text-sm hover:text-dungeon-accent transition-colors">
              {(reservation.shop as { name: string }).name}
            </Link>
          ) : (
            <p className="text-dungeon-sub-header text-sm">Shop</p>
          )}
        </div>
        <div>
          <p className="text-dungeon-secondary text-sm">Date & Time</p>
          <p className="text-dungeon-primary">
            {new Date(reservation.resvDate).toLocaleString()}
          </p>
          {isEditing ? (
            <select value={newStatus} onChange={(e) => onSetNewStatus(e.target.value)}
              className="mt-2 w-full px-2 py-1 bg-dungeon-canvas border border-dungeon-outline rounded text-dungeon-primary">
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
          {reservation.paymentStatus && reservation.paymentStatus !== 'none' && (
            <p className={`text-sm mt-1 ${getPaymentStatusColor(reservation.paymentStatus)}`}>
              💳 {getPaymentStatusLabel(reservation.paymentStatus)}
            </p>
          )}
          {reservation.slipImageUrl && (
            <div className="mt-2">
              <img src={`${API_URL.replace('/api/v1', '')}${reservation.slipImageUrl}`}
                alt="Payment slip" className="h-24 rounded border border-dungeon-outline object-cover" />
            </div>
          )}
          {reservation.originalPrice != null && (
            <p className="text-sm mt-1 text-dungeon-accent">
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
        </div>
        <div className="flex gap-2 items-end">
          {isEditing ? (
            <>
              <button onClick={() => onUpdateStatus(reservation._id)}
                className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">Save</button>
              <button onClick={() => onSetEditingId(null)}
                className="px-3 py-2 bg-dungeon-star-empty text-dungeon-primary rounded hover:bg-dungeon-star-half transition-colors">Cancel</button>
            </>
          ) : (
            <>
              <button onClick={() => { onSetEditingId(reservation._id); onSetNewStatus(reservation.status); }}
                className="px-3 py-2 bg-dungeon-accent text-dungeon-dark-text rounded hover:bg-dungeon-accent-dark transition-colors">Edit Status</button>
              <button onClick={() => onEditDate(reservation)}
                className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">Edit Date</button>
              {reservation.status !== 'cancelled' && reservation.status !== 'completed' && (
                <button onClick={() => onDelete(reservation._id)}
                  className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">Cancel Booking</button>
              )}
              {reservation.paymentStatus === 'waiting_verification' && (
                <>
                  <button onClick={() => onVerifySlip(reservation._id, 'approve')}
                    disabled={verifyingId === reservation._id}
                    className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50">✓ Approve</button>
                  <button onClick={() => onVerifySlip(reservation._id, 'reject')}
                    disabled={verifyingId === reservation._id}
                    className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50">✗ Reject</button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
