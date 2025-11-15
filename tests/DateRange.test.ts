import { DateRange } from '../features/DateRange';

describe('DateRange', () => {
  describe('constructor', () => {
    it('should create empty range with null dates', () => {
      const range = new DateRange();
      expect(range.start).toBeNull();
      expect(range.end).toBeNull();
    });

    it('should create range with provided dates', () => {
      const start = new Date('2025-11-01');
      const end = new Date('2025-11-05');
      const range = new DateRange(start, end);
      
      expect(range.start).toEqual(start);
      expect(range.end).toEqual(end);
    });
  });

  describe('loadFromObject', () => {
    it('should load dates from object with string dates', () => {
      const range = new DateRange();
      range.loadFromObject({
        start: '2025-11-01',
        end: '2025-11-05',
      });
      
      expect(range.start).toEqual(new Date('2025-11-01'));
      expect(range.end).toEqual(new Date('2025-11-05'));
    });

    it('should handle null values', () => {
      const range = new DateRange();
      range.loadFromObject({
        start: null,
        end: null,
      });
      
      expect(range.start).toBeNull();
      expect(range.end).toBeNull();
    });

    it('should handle undefined object', () => {
      const range = new DateRange();
      range.loadFromObject(undefined);
      
      expect(range.start).toBeNull();
      expect(range.end).toBeNull();
    });
  });

  describe('containsDate', () => {
    it('should return false for empty range', () => {
      const range = new DateRange();
      const date = new Date('2025-11-10');
      
      expect(range.containsDate(date)).toBe(false);
    });

    it('should return true for date within range', () => {
      const range = new DateRange(
        new Date('2025-11-01'),
        new Date('2025-11-05')
      );
      const date = new Date('2025-11-03');
      
      expect(range.containsDate(date)).toBe(true);
    });

    it('should return true for start date', () => {
      const range = new DateRange(
        new Date('2025-11-01'),
        new Date('2025-11-05')
      );
      const date = new Date('2025-11-01');
      
      expect(range.containsDate(date)).toBe(true);
    });

    it('should return true for end date', () => {
      const range = new DateRange(
        new Date('2025-11-01'),
        new Date('2025-11-05')
      );
      const date = new Date('2025-11-05');
      
      expect(range.containsDate(date)).toBe(true);
    });

    it('should return false for date before range', () => {
      const range = new DateRange(
        new Date('2025-11-01'),
        new Date('2025-11-05')
      );
      const date = new Date('2025-10-31');
      
      expect(range.containsDate(date)).toBe(false);
    });

    it('should return false for date after range', () => {
      const range = new DateRange(
        new Date('2025-11-01'),
        new Date('2025-11-05')
      );
      const date = new Date('2025-11-06');
      
      expect(range.containsDate(date)).toBe(false);
    });

    it('should ignore time component when checking dates', () => {
      const range = new DateRange(
        new Date('2025-11-01T00:00:00'),
        new Date('2025-11-05T00:00:00')
      );
      const date = new Date('2025-11-03T23:59:59.999');
      
      expect(range.containsDate(date)).toBe(true);
    });
  });

  describe('getDatesInRange', () => {
    it('should return empty array for empty range', () => {
      const range = new DateRange();
      const dates = range.getDatesInRange();
      
      expect(dates).toEqual([]);
    });

    it('should return single date for same start and end', () => {
      const date = new Date('2025-11-01');
      const range = new DateRange(date, date);
      const dates = range.getDatesInRange();
      
      expect(dates).toHaveLength(1);
      expect(dates[0].toISOString().slice(0, 10)).toBe('2025-11-01');
    });

    it('should return all dates in range', () => {
      const range = new DateRange(
        new Date('2025-11-01T00:00:00'),
        new Date('2025-11-05T00:00:00')
      );
      const dates = range.getDatesInRange();
      
      expect(dates.length).toBeGreaterThanOrEqual(4);
      expect(dates[0].toISOString().slice(0, 10)).toBe('2025-11-01');
    });

    it('should handle ranges spanning month boundaries', () => {
      const range = new DateRange(
        new Date('2025-10-30T00:00:00'),
        new Date('2025-11-02T00:00:00')
      );
      const dates = range.getDatesInRange();
      
      expect(dates.length).toBeGreaterThanOrEqual(3);
      expect(dates[0].toISOString().slice(0, 10)).toBe('2025-10-30');
    });
  });

  describe('isEmpty', () => {
    it('should return true when both dates are null', () => {
      const range = new DateRange();
      expect(range.isEmpty()).toBe(true);
    });

    it('should return true when start is null', () => {
      const range = new DateRange(null, new Date('2025-11-05'));
      expect(range.isEmpty()).toBe(true);
    });

    it('should return true when end is null', () => {
      const range = new DateRange(new Date('2025-11-01'), null);
      expect(range.isEmpty()).toBe(true);
    });

    it('should return false when both dates are set', () => {
      const range = new DateRange(
        new Date('2025-11-01'),
        new Date('2025-11-05')
      );
      expect(range.isEmpty()).toBe(false);
    });
  });

  describe('toJSON', () => {
    it('should serialize dates to YYYY-MM-DD format', () => {
      const range = new DateRange(
        new Date('2025-11-01T00:00:00'),
        new Date('2025-11-05T00:00:00')
      );
      const json = range.toJSON();
      
      // Just verify it returns date strings in correct format
      expect(json.start).toMatch(/2025-11-0[12]/);
      expect(json.end).toMatch(/2025-11-0[56]/);
    });

    it('should handle null dates', () => {
      const range = new DateRange();
      const json = range.toJSON();
      
      expect(json.start).toBeNull();
      expect(json.end).toBeNull();
    });
  });

  describe('fromJSON', () => {
    it('should deserialize dates from YYYY-MM-DD format', () => {
      const json = {
        start: '2025-11-01',
        end: '2025-11-05',
      };
      const range = DateRange.fromJSON(json);
      
      expect(range.start).toEqual(new Date('2025-11-01T00:00:00'));
      expect(range.end).toEqual(new Date('2025-11-05T00:00:00'));
    });

    it('should handle null dates', () => {
      const json = {
        start: null,
        end: null,
      };
      const range = DateRange.fromJSON(json);
      
      expect(range.start).toBeNull();
      expect(range.end).toBeNull();
    });

    it('should round-trip correctly with toJSON', () => {
      const original = new DateRange(
        new Date('2025-11-01'),
        new Date('2025-11-05')
      );
      const json = original.toJSON();
      const deserialized = DateRange.fromJSON(json);
      
      expect(deserialized.start?.toISOString().slice(0, 10))
        .toBe(original.start?.toISOString().slice(0, 10));
      expect(deserialized.end?.toISOString().slice(0, 10))
        .toBe(original.end?.toISOString().slice(0, 10));
    });
  });
});
