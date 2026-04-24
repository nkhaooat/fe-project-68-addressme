/**
 * Shared status display helpers for reservations.
 * Used by: mybookings, admin/BookingCard, ChatWidget
 */

export function getStatusColor(status: string): string {
  switch (status) {
    case 'confirmed': return 'text-green-400';
    case 'pending': return 'text-yellow-400';
    case 'cancelled': return 'text-red-400';
    case 'completed': return 'text-blue-400';
    default: return 'text-dungeon-secondary';
  }
}

export function getPaymentStatusColor(ps?: string): string {
  switch (ps) {
    case 'approved': return 'text-green-400';
    case 'waiting_verification': return 'text-yellow-400';
    case 'rejected': return 'text-red-400';
    default: return 'text-dungeon-secondary';
  }
}

export function getPaymentStatusLabel(ps?: string): string {
  switch (ps) {
    case 'approved': return 'Payment Approved';
    case 'waiting_verification': return 'Waiting for Verification';
    case 'rejected': return 'Payment Rejected';
    case 'none': return 'No Payment';
    default: return 'No Payment';
  }
}
