import { describe, it, expect } from 'vitest';
import { formatPrice, calculateNights, isBookingDateValid } from './hotelUtils';
import { addDays, subDays } from 'date-fns';

describe('hotelUtils', () => {
  describe('formatPrice', () => {
    it('should format price with symbol at the beginning for EUR', () => {
      expect(formatPrice(100, 'EUR', '€')).toBe('€100');
    });

    it('should format price with symbol at the beginning for USD', () => {
      expect(formatPrice(1500, 'USD', '$')).toBe('$1,500');
    });

    it('should format price with symbol at the end for XOF', () => {
      expect(formatPrice(50000, 'XOF', 'CFA')).toBe('50,000 CFA');
    });

    it('should format price with symbol at the end if symbol length > 1', () => {
      expect(formatPrice(200, 'TND', 'DT')).toBe('200 DT');
    });
  });

  describe('calculateNights', () => {
    it('should return 0 if dates are missing', () => {
      expect(calculateNights(undefined, undefined)).toBe(0);
      expect(calculateNights(new Date(), undefined)).toBe(0);
    });

    it('should calculate 1 night correctly', () => {
      const checkIn = new Date('2026-03-20');
      const checkOut = new Date('2026-03-21');
      expect(calculateNights(checkIn, checkOut)).toBe(1);
    });

    it('should calculate multiple nights correctly', () => {
      const checkIn = new Date('2026-03-20');
      const checkOut = new Date('2026-03-25');
      expect(calculateNights(checkIn, checkOut)).toBe(5);
    });

    it('should return 0 if check-out is before check-in', () => {
      const checkIn = new Date('2026-03-25');
      const checkOut = new Date('2026-03-20');
      expect(calculateNights(checkIn, checkOut)).toBe(0);
    });

    it('should return 0 if check-in and check-out are same day', () => {
      const date = new Date('2026-03-20');
      expect(calculateNights(date, date)).toBe(0);
    });
  });

  describe('isBookingDateValid', () => {
    const today = new Date();

    it('should return false if dates are missing', () => {
      expect(isBookingDateValid(undefined, undefined)).toBe(false);
    });

    it('should return false if check-in is in the past', () => {
      const yesterday = subDays(today, 1);
      const tomorrow = addDays(today, 1);
      expect(isBookingDateValid(yesterday, tomorrow)).toBe(false);
    });

    it('should return true if check-in is today and check-out is tomorrow', () => {
      const tomorrow = addDays(today, 1);
      expect(isBookingDateValid(today, tomorrow)).toBe(true);
    });

    it('should return false if check-out is before check-in', () => {
      const tomorrow = addDays(today, 1);
      const dayAfter = addDays(today, 2);
      expect(isBookingDateValid(dayAfter, tomorrow)).toBe(false);
    });

    it('should return false if check-in and check-out are same day', () => {
      const tomorrow = addDays(today, 1);
      expect(isBookingDateValid(tomorrow, tomorrow)).toBe(false);
    });
  });
});
