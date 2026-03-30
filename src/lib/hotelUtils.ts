import { differenceInDays, isBefore, startOfDay } from 'date-fns';

/**
 * Formats a price based on the currency and symbol.
 */
export const formatPrice = (amount: number | string, currency: string, currencySymbol: string) => {
  const numAmount = typeof amount === 'string' ? Number(amount) : amount;
  const formatted = numAmount.toLocaleString();
  if (currency === 'XOF' || currencySymbol.length > 1) {
    return `${formatted} ${currencySymbol}`;
  }
  return `${currencySymbol}${formatted}`;
};

/**
 * Calculates the number of nights between two dates.
 */
export const calculateNights = (checkIn: Date | undefined, checkOut: Date | undefined): number => {
  if (!checkIn || !checkOut) return 0;
  
  const start = startOfDay(checkIn);
  const end = startOfDay(checkOut);
  
  const nights = differenceInDays(end, start);
  return nights > 0 ? nights : 0;
};

/**
 * Validates if the booking dates are correct.
 */
export const isBookingDateValid = (checkIn: Date | undefined, checkOut: Date | undefined): boolean => {
  if (!checkIn || !checkOut) return false;
  
  const today = startOfDay(new Date());
  const start = startOfDay(checkIn);
  const end = startOfDay(checkOut);
  
  // Check-in cannot be in the past
  if (isBefore(start, today)) return false;
  
  // Check-out must be after check-in
  if (isBefore(end, start) || end.getTime() === start.getTime()) return false;
  
  return true;
};
