/**
 * Chat action handler — processes booking/cancel/edit actions from the chatbot.
 * Extracted from ChatWidget for maintainability.
 */

import { API_URL } from '@/libs/config';
import { createReservation, deleteReservation } from '@/libs/reservations';
import { getShop } from '@/libs/shops';
import { validateReservationTime } from '@/utils/shopHours';

export interface ChatAction {
  type: 'create_reservation' | 'edit_reservation' | 'cancel_reservation';
  shopId?: string;
  serviceId?: string;
  reservationId?: string;
  resvDate?: string;
}

export interface ActionResult {
  success: boolean;
  message: string;
}

/** Validate shop hours for a reservation date */
async function validateShopHours(shopId: string, resvDate: string): Promise<ActionResult | null> {
  const shopRes = await getShop(shopId);
  if (shopRes.success && shopRes.data?.openTime && shopRes.data?.closeTime) {
    const validation = validateReservationTime(resvDate, shopRes.data.openTime, shopRes.data.closeTime);
    if (!validation.ok) {
      return {
        success: false,
        message: `Cannot book: ${validation.error}. Shop hours: ${shopRes.data.openTime} - ${shopRes.data.closeTime}. Please choose a time within operating hours.`,
      };
    }
  }
  return null; // valid
}

/** Handle a create_reservation action */
export async function handleCreateReservation(
  action: ChatAction,
  token: string
): Promise<ActionResult> {
  const { shopId, serviceId, resvDate } = action;
  if (!shopId || !serviceId || !resvDate) {
    return { success: false, message: 'Missing booking details. Please try again.' };
  }

  // Validate shop hours
  const hoursError = await validateShopHours(shopId, resvDate);
  if (hoursError) return hoursError;

  try {
    const res = await createReservation({ shop: shopId, service: serviceId, resvDate }, token);
    if (res.success) {
      return { success: true, message: 'Booking confirmed! View it at [My Bookings](/mybookings)' };
    }
    return { success: false, message: `Booking failed: ${res.message || 'Please try again'}` };
  } catch {
    return { success: false, message: 'Error creating booking. Please try again.' };
  }
}

/** Handle an edit_reservation action */
export async function handleEditReservation(
  action: ChatAction,
  token: string
): Promise<ActionResult> {
  const { reservationId, resvDate } = action;
  if (!reservationId) {
    return { success: false, message: 'Missing reservation ID.' };
  }

  try {
    // Fetch reservation to get shop info for hours validation
    const resvInfoRes = await fetch(`${API_URL}/reservations/${reservationId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const resvInfo = await resvInfoRes.json();

    if (resvInfo.success && resvInfo.data?.shop) {
      const shopId: string = typeof resvInfo.data.shop === 'object' ? resvInfo.data.shop._id : resvInfo.data.shop;
      if (shopId && resvDate) {
        const hoursError = await validateShopHours(shopId, resvDate);
        if (hoursError) {
          hoursError.message = hoursError.message.replace('Cannot book:', 'Cannot reschedule:');
          return hoursError;
        }
      }
    }

    const res = await fetch(`${API_URL}/reservations/${reservationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ resvDate }),
    });
    const editRes = await res.json();

    if (editRes.success) {
      return { success: true, message: 'Booking updated! View it at [My Bookings](/mybookings)' };
    }
    return { success: false, message: `Update failed: ${editRes.message || 'Please try again'}` };
  } catch {
    return { success: false, message: 'Error updating booking. Please try again.' };
  }
}

/** Handle a cancel_reservation action */
export async function handleCancelReservation(
  action: ChatAction,
  token: string
): Promise<ActionResult> {
  const { reservationId } = action;
  if (!reservationId) {
    return { success: false, message: 'Missing reservation ID.' };
  }

  try {
    const res = await deleteReservation(reservationId, token);
    if (res.success) {
      return { success: true, message: 'Reservation cancelled successfully! View your bookings at [My Bookings](/mybookings)' };
    }
    return { success: false, message: `Cancellation failed: ${res.message || 'Please try again'}` };
  } catch {
    return { success: false, message: 'Error cancelling reservation. Please try again.' };
  }
}

/** Main action dispatcher */
export async function handleChatAction(
  action: ChatAction,
  token: string
): Promise<ActionResult> {
  switch (action.type) {
    case 'create_reservation':
      return handleCreateReservation(action, token);
    case 'edit_reservation':
      return handleEditReservation(action, token);
    case 'cancel_reservation':
      return handleCancelReservation(action, token);
    default:
      return { success: false, message: 'Unknown action type.' };
  }
}
