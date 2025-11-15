import { startOfDay, getDaysInMonth, getFirstDayOfWeek, isToday, formatDate, formatDateRange } from '../features/DateUtils';
import { DateRange } from '../features/DateRange';

describe('DateUtils', () => {
  describe('startOfDay', () => {
    it('should normalize date to start of day', () => {
      const date = new Date('2025-11-14T15:30:45.123Z');
      const result = startOfDay(date);
      
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });

    it('should preserve date components', () => {
      const date = new Date('2025-11-14T23:59:59.999Z');
      const result = startOfDay(date);
      
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(10); // November (0-indexed)
      expect(result.getDate()).toBe(14);
    });
  });

  describe('getDaysInMonth', () => {
    it('should return correct days for January', () => {
      expect(getDaysInMonth(2025, 0)).toBe(31);
    });

    it('should return correct days for February in non-leap year', () => {
      expect(getDaysInMonth(2025, 1)).toBe(28);
    });

    it('should return correct days for February in leap year', () => {
      expect(getDaysInMonth(2024, 1)).toBe(29);
    });

    it('should return correct days for April', () => {
      expect(getDaysInMonth(2025, 3)).toBe(30);
    });

    it('should return correct days for December', () => {
      expect(getDaysInMonth(2025, 11)).toBe(31);
    });
  });

  describe('getFirstDayOfWeek', () => {
    it('should return 0 for Sunday as first day', () => {
      // November 2020 starts on Sunday
      const result = getFirstDayOfWeek(2020, 10);
      expect(result).toBe(0);
    });

    it('should return 6 for Saturday as first day', () => {
      // May 2021 starts on Saturday
      const result = getFirstDayOfWeek(2021, 4);
      expect(result).toBe(6);
    });

    it('should return 1 for Monday as first day', () => {
      // November 2021 starts on Monday
      const result = getFirstDayOfWeek(2021, 10);
      expect(result).toBe(1);
    });
  });

  describe('isToday', () => {
    it('should return true for current date', () => {
      const today = new Date();
      expect(isToday(today)).toBe(true);
    });

    it('should return true for current date with different time', () => {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      expect(isToday(today)).toBe(true);
    });

    it('should return false for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isToday(yesterday)).toBe(false);
    });

    it('should return false for tomorrow', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(isToday(tomorrow)).toBe(false);
    });
  });

  describe('formatDate', () => {
    it('should format date in MMM DD format', () => {
      const date = new Date('2025-11-14');
      const result = formatDate(date);
      expect(result).toMatch(/Nov 1[34]/); // Handles timezone differences
    });

    it('should format single digit days correctly', () => {
      const date = new Date('2025-01-05');
      const result = formatDate(date);
      expect(result).toMatch(/Jan [45]/); // Handles timezone differences
    });
  });

  describe('formatDateRange', () => {
    it('should handle empty range', () => {
      const range = new DateRange(null, null);
      const result = formatDateRange(range);
      expect(result).toBe('No dates selected');
    });

    it('should format same day range', () => {
      const date = new Date('2025-11-14T12:00:00');
      const range = new DateRange(date, date);
      const result = formatDateRange(range);
      expect(result).toMatch(/Nov 1[34]/); // Single date format
    });

    it('should format multi-day range', () => {
      const start = new Date('2025-11-14T00:00:00');
      const end = new Date('2025-11-18T00:00:00');
      const range = new DateRange(start, end);
      const result = formatDateRange(range);
      expect(result).toContain(' - '); // Contains range separator
    });
  });
});
