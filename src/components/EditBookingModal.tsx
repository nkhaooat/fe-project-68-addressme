'use client';

import { useState, useEffect } from 'react';
import { Reservation, Shop } from '@/interface';
import { updateReservation } from '@/libs/reservations';
import { getShop } from '@/libs/shops';

interface EditBookingModalProps {
  reservation: Reservation;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updated: Reservation) => void;
  token: string;
  isAdmin?: boolean;
}

export default function EditBookingModal({
  reservation,
  isOpen,
  onClose,
  onUpdate,
  token,
  isAdmin = false,
}: EditBookingModalProps) {
  const [newDate, setNewDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shop, setShop] = useState<Shop | null>(null);

  useEffect(() => {
    if (isOpen && reservation) {
      // Format the current reservation date for datetime-local input (local time)
      const currentDate = new Date(reservation.resvDate);
      // Convert to local timezone format YYYY-MM-DDTHH:MM
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const hours = String(currentDate.getHours()).padStart(2, '0');
      const minutes = String(currentDate.getMinutes()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;
      setNewDate(formattedDate);
      setError('');
      
      // Load shop details to get open/close times
      const shopId = typeof reservation.shop === 'object' ? reservation.shop._id : reservation.shop;
      if (shopId) {
        loadShop(shopId);
      }
    }
  }, [isOpen, reservation]);

  const loadShop = async (shopId: string) => {
    try {
      const res = await getShop(shopId);
      if (res.success) {
        setShop(res.data);
      }
    } catch {
      // Silently fail - we'll just not show open hours validation
    }
  };

  const isWithinShopHours = (date: Date): boolean => {
    if (!shop || !shop.openTime || !shop.closeTime) return true;

    const hours = date.getHours();
    const minutes = date.getMinutes();
    const timeValue = hours * 60 + minutes;

    const [openHour, openMin] = shop.openTime.split(':').map(Number);
    const [closeHour, closeMin] = shop.closeTime.split(':').map(Number);

    const openValue = openHour * 60 + (openMin || 0);
    const closeValue = closeHour * 60 + (closeMin || 0);

    return timeValue >= openValue && timeValue <= closeValue;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Convert local datetime-local value to Date object
    const selectedDate = new Date(newDate);
    const now = new Date();

    // Check if date is in the future
    if (selectedDate <= now) {
      setError('Please select a future date and time');
      setLoading(false);
      return;
    }

    // Check if within shop hours
    if (!isWithinShopHours(selectedDate)) {
      setError(`Shop is only open from ${shop?.openTime} to ${shop?.closeTime}`);
      setLoading(false);
      return;
    }

    try {
      // Send as ISO string (UTC format)
      const res = await updateReservation(
        reservation._id,
        { resvDate: selectedDate.toISOString() },
        token
      );
      
      if (res.success) {
        onUpdate(res.data);
        onClose();
      } else {
        setError(res.message || 'Failed to update booking');
      }
    } catch {
      setError('Error updating booking');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const shopName = typeof reservation.shop === 'object' ? reservation.shop.name : 'Shop';
  const serviceName = typeof reservation.service === 'object' ? reservation.service.name : 'Service';

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2B2B2B] border border-[#403A36] rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-[#F0E5D8] mb-4">
          {isAdmin ? 'Edit Booking (Admin)' : 'Edit Your Booking'}
        </h2>
        
        <div className="mb-4 text-[#8A8177]">
          <p><span className="text-[#D4CFC6]">Shop:</span> {shopName}</p>
          <p><span className="text-[#D4CFC6]">Service:</span> {serviceName}</p>
          {shop && (
            <p className="text-sm mt-2">
              <span className="text-[#A88C6B]">Shop Hours:</span> {shop.openTime} - {shop.closeTime}
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-[#8A8177] text-sm mb-2">
              New Appointment Date & Time
            </label>
            <input
              type="datetime-local"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-[#403A36] rounded-lg px-4 py-2 text-[#F0E5D8] focus:border-[#E57A00] focus:outline-none"
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-[#454545] text-[#D4CFC6] rounded hover:bg-[#5a5a5a] transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#E57A00] text-[#1A110A] font-bold rounded hover:bg-[#c46a00] transition-colors"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
