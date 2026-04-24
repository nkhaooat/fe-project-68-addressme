/**
 * Shared shop-hours validation utilities.
 * Used by: booking page, EditBookingModal, ChatWidget
 */

/** Parse "HH:MM" to minutes since midnight */
export function parseTimeToMinutes(time: string): number {
  const [hour, min] = time.split(':').map(Number);
  return hour * 60 + (min || 0);
}

/** Check if a time (HH:MM) falls within shop operating hours */
export function isWithinShopHours(
  time: string,
  openTime: string,
  closeTime: string
): boolean {
  const selectedValue = parseTimeToMinutes(time);
  const openValue = parseTimeToMinutes(openTime);
  let closeValue = parseTimeToMinutes(closeTime);

  // Handle midnight (00:00) as end of day (24:00)
  if (closeValue === 0) closeValue = 24 * 60;

  // Overnight hours (e.g., 21:00–02:00)
  if (closeValue < openValue) {
    return selectedValue >= openValue || selectedValue <= closeValue;
  }

  // Normal hours
  return selectedValue >= openValue && selectedValue <= closeValue;
}

/** Check if a service duration fits within shop hours */
export function checkServiceDuration(
  startTime: string,
  durationMinutes: number,
  openTime: string,
  closeTime: string
): { valid: boolean; endTime: string; error?: string } {
  const startValue = parseTimeToMinutes(startTime);
  const openValue = parseTimeToMinutes(openTime);
  let closeValue = parseTimeToMinutes(closeTime);

  if (closeValue === 0) closeValue = 24 * 60;

  const endValue = startValue + durationMinutes;
  const endHour = Math.floor(endValue / 60) % 24;
  const endMin = endValue % 60;
  const endTime = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

  // Overnight hours
  if (closeValue < openValue) {
    if (startValue >= openValue) {
      if (endValue <= 24 * 60) return { valid: true, endTime };
      const nextDayEnd = endValue - 24 * 60;
      if (nextDayEnd <= closeValue) return { valid: true, endTime };
      return { valid: false, endTime, error: `Service ends at ${endTime} but shop closes at ${closeTime}` };
    } else if (startValue <= closeValue) {
      if (endValue <= closeValue) return { valid: true, endTime };
      return { valid: false, endTime, error: `Service ends at ${endTime} but shop closes at ${closeTime}` };
    }
    return { valid: false, endTime, error: 'Invalid time for overnight hours' };
  }

  // Normal hours (same day)
  if (endValue > closeValue) {
    return { valid: false, endTime, error: `Service ends at ${endTime} but shop closes at ${closeTime}` };
  }

  return { valid: true, endTime };
}

/**
 * Validate a reservation date/time against shop hours.
 * Returns { ok, error? }
 */
export function validateReservationTime(
  resvDate: string | Date,
  openTime: string,
  closeTime: string,
  serviceDurationMinutes?: number
): { ok: boolean; error?: string } {
  const date = typeof resvDate === 'string' ? new Date(resvDate) : resvDate;

  // Must be in the future
  if (date <= new Date()) {
    return { ok: false, error: 'Please select a future date and time' };
  }

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;

  if (!isWithinShopHours(timeStr, openTime, closeTime)) {
    return { ok: false, error: `Shop is only open from ${openTime} to ${closeTime}` };
  }

  if (serviceDurationMinutes && serviceDurationMinutes > 0) {
    const durationCheck = checkServiceDuration(timeStr, serviceDurationMinutes, openTime, closeTime);
    if (!durationCheck.valid) {
      return { ok: false, error: durationCheck.error || 'Service duration exceeds shop hours' };
    }
  }

  return { ok: true };
}
