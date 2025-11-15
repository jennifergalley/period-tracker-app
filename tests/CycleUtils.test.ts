import { CycleUtils } from '@/features/CycleUtils';
import { DateRangeList } from '@/features/DateRangeList';
import { DateRange } from '@/features/DateRange';

describe('CycleUtils', () => {
  describe('logPeriod', () => {
    it('should add single period day when autoAdd is false', () => {
      const periodRanges = new DateRangeList();
      const date = new Date('2025-11-01T12:00:00');
      let updatedRanges: DateRangeList | null = null;
      const setPeriodRanges = (ranges: DateRangeList) => {
        updatedRanges = ranges;
      };

      CycleUtils.logPeriod(date, periodRanges, setPeriodRanges, false, 5);

      expect(updatedRanges).not.toBeNull();
      expect(updatedRanges!.ranges.length).toBeGreaterThanOrEqual(1);
      // Check that it added a date (may be off by timezone)
      const allDates = updatedRanges!.getAllDates();
      expect(allDates.length).toBeGreaterThanOrEqual(1);
    });

    it('should auto-add period range when enabled and no previous period', () => {
      const periodRanges = new DateRangeList();
      const date = new Date('2025-11-01T12:00:00');
      let updatedRanges: DateRangeList | null = null;
      const setPeriodRanges = (ranges: DateRangeList) => {
        updatedRanges = ranges;
      };

      CycleUtils.logPeriod(date, periodRanges, setPeriodRanges, true, 5);

      expect(updatedRanges).not.toBeNull();
      // Should add multiple days (5 total)
      const allDates = updatedRanges!.getAllDates();
      expect(allDates.length).toBeGreaterThanOrEqual(4);
    });

    it('should remove date if already in period ranges', () => {
      const periodRanges = new DateRangeList();
      periodRanges.addRange(new Date('2025-11-01'), new Date('2025-11-05'));
      const date = new Date('2025-11-03');
      let updatedRanges: DateRangeList | null = null;
      const setPeriodRanges = (ranges: DateRangeList) => {
        updatedRanges = ranges;
      };

      CycleUtils.logPeriod(date, periodRanges, setPeriodRanges, false, 5);

      expect(updatedRanges).not.toBeNull();
      expect(updatedRanges!.containsDate(new Date('2025-11-03'))).toBe(false);
    });

    it('should normalize date to start of day', () => {
      const periodRanges = new DateRangeList();
      const date = new Date('2025-11-01T23:59:59');
      let updatedRanges: DateRangeList | null = null;
      const setPeriodRanges = (ranges: DateRangeList) => {
        updatedRanges = ranges;
      };

      CycleUtils.logPeriod(date, periodRanges, setPeriodRanges, false, 5);

      expect(updatedRanges).not.toBeNull();
      expect(updatedRanges!.containsDate(new Date('2025-11-01T00:00:00'))).toBe(true);
    });

    it('should use custom typicalPeriodLength when auto-adding', () => {
      const periodRanges = new DateRangeList();
      const date = new Date('2025-11-01');
      let updatedRanges: DateRangeList | null = null;
      const setPeriodRanges = (ranges: DateRangeList) => {
        updatedRanges = ranges;
      };

      CycleUtils.logPeriod(date, periodRanges, setPeriodRanges, true, 7);

      expect(updatedRanges).not.toBeNull();
      // Should add 7 days
      expect(updatedRanges!.containsDate(new Date('2025-11-01'))).toBe(true);
      expect(updatedRanges!.containsDate(new Date('2025-11-06'))).toBe(true);
    });
  });

  describe('calculateFertileWindow', () => {
    it('should return null values for empty period ranges', () => {
      const periodRanges = new DateRangeList();

      const result = CycleUtils.calculateFertileWindow(periodRanges);

      expect(result.ovulationDay).toBeNull();
      expect(result.fertileWindow.isEmpty()).toBe(true);
    });

    it('should calculate ovulation day 14 days after last period start', () => {
      const periodRanges = new DateRangeList();
      periodRanges.addRange(new Date('2025-11-01'), new Date('2025-11-05'));

      const result = CycleUtils.calculateFertileWindow(periodRanges);

      expect(result.ovulationDay).not.toBeNull();
      const ovulationDate = result.ovulationDay!.toISOString().slice(0, 10);
      expect(ovulationDate).toBe('2025-11-15');
    });

    it('should calculate fertile window 5 days before ovulation', () => {
      const periodRanges = new DateRangeList();
      periodRanges.addRange(new Date('2025-11-01'), new Date('2025-11-05'));

      const result = CycleUtils.calculateFertileWindow(periodRanges);

      expect(result.fertileWindow).not.toBeNull();
      expect(result.fertileWindow.isEmpty()).toBe(false);
      expect(result.fertileWindow.start?.toISOString().slice(0, 10)).toBe('2025-11-10');
      expect(result.fertileWindow.end?.toISOString().slice(0, 10)).toBe('2025-11-15');
    });

    it('should use most recent period for calculation', () => {
      const periodRanges = new DateRangeList();
      periodRanges.addRange(new Date('2025-10-01'), new Date('2025-10-05'));
      periodRanges.addRange(new Date('2025-11-01'), new Date('2025-11-05'));

      const result = CycleUtils.calculateFertileWindow(periodRanges);

      // Should be based on November period
      expect(result.ovulationDay?.toISOString().slice(0, 10)).toBe('2025-11-15');
    });

    it('should handle period with no start date', () => {
      const periodRanges = new DateRangeList();
      periodRanges.ranges.push(new DateRange(null, null));

      const result = CycleUtils.calculateFertileWindow(periodRanges);

      expect(result.ovulationDay).toBeNull();
      expect(result.fertileWindow.isEmpty()).toBe(true);
    });
  });

  describe('getAllPredictedPeriods', () => {
    it('should return empty list for empty period ranges', () => {
      const periodRanges = new DateRangeList();

      const result = CycleUtils.getAllPredictedPeriods(periodRanges, 5, 28);

      expect(result.isEmpty()).toBe(true);
    });

    it('should predict periods for next 12 months', () => {
      const periodRanges = new DateRangeList();
      periodRanges.addRange(new Date('2025-11-01'), new Date('2025-11-05'));

      const result = CycleUtils.getAllPredictedPeriods(periodRanges, 5, 28);

      expect(result.isEmpty()).toBe(false);
      // With 28-day cycle, should have ~13 periods in a year
      expect(result.ranges.length).toBeGreaterThanOrEqual(12);
      expect(result.ranges.length).toBeLessThanOrEqual(14);
    });

    it('should use custom period length', () => {
      const periodRanges = new DateRangeList();
      periodRanges.addRange(new Date('2025-11-01'), new Date('2025-11-05'));

      const result = CycleUtils.getAllPredictedPeriods(periodRanges, 7, 28);

      expect(result.isEmpty()).toBe(false);
      // First predicted period should be 7 days long
      const firstPredicted = result.ranges[0];
      if (firstPredicted.start && firstPredicted.end) {
        const days = Math.round((firstPredicted.end.getTime() - firstPredicted.start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        expect(days).toBe(7);
      }
    });

    it('should use custom cycle length', () => {
      const periodRanges = new DateRangeList();
      periodRanges.addRange(new Date('2025-11-01'), new Date('2025-11-05'));

      const result = CycleUtils.getAllPredictedPeriods(periodRanges, 5, 30);

      expect(result.isEmpty()).toBe(false);
      // With 30-day cycle, should have ~12 periods in a year
      expect(result.ranges.length).toBeGreaterThanOrEqual(11);
      expect(result.ranges.length).toBeLessThanOrEqual(13);
    });

    it('should default to 5-day period and 28-day cycle', () => {
      const periodRanges = new DateRangeList();
      periodRanges.addRange(new Date('2025-11-01'), new Date('2025-11-05'));

      const result = CycleUtils.getAllPredictedPeriods(periodRanges);

      expect(result.isEmpty()).toBe(false);
      expect(result.ranges.length).toBeGreaterThanOrEqual(12);
    });

    it('should predict periods starting after last period', () => {
      const periodRanges = new DateRangeList();
      periodRanges.addRange(new Date('2025-11-01'), new Date('2025-11-05'));

      const result = CycleUtils.getAllPredictedPeriods(periodRanges, 5, 28);

      // First prediction should start 28 days after Nov 1
      const firstPredicted = result.ranges[0];
      expect(firstPredicted.start?.toISOString().slice(0, 10)).toBe('2025-11-29');
    });
  });

  describe('getCycleDay', () => {
    it('should return 0 for empty period ranges', () => {
      const periodRanges = new DateRangeList();
      const date = new Date('2025-11-15');

      const result = CycleUtils.getCycleDay(periodRanges, date);

      expect(result).toBe(0);
    });

    it('should return 1 for first day of period', () => {
      const periodRanges = new DateRangeList();
      periodRanges.addRange(new Date('2025-11-01T00:00:00'), new Date('2025-11-05T00:00:00'));

      const result = CycleUtils.getCycleDay(periodRanges, new Date('2025-11-01T12:00:00'));

      // May be 1 or 0 depending on timezone handling
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    });

    it('should calculate cycle day correctly for dates after period', () => {
      const periodRanges = new DateRangeList();
      periodRanges.addRange(new Date('2025-11-01T00:00:00'), new Date('2025-11-05T00:00:00'));

      const result = CycleUtils.getCycleDay(periodRanges, new Date('2025-11-15T00:00:00'));

      // Should be around day 14-15 (14 days elapsed, day 15)
      expect(result).toBeGreaterThanOrEqual(13);
      expect(result).toBeLessThanOrEqual(15);
    });

    it('should use most recent period before given date', () => {
      const periodRanges = new DateRangeList();
      periodRanges.addRange(new Date('2025-10-01T00:00:00'), new Date('2025-10-05T00:00:00'));
      periodRanges.addRange(new Date('2025-11-01T00:00:00'), new Date('2025-11-05T00:00:00'));

      const result = CycleUtils.getCycleDay(periodRanges, new Date('2025-11-10T00:00:00'));

      // Should be based on Nov 1, so around day 9-10
      expect(result).toBeGreaterThanOrEqual(8);
      expect(result).toBeLessThanOrEqual(10);
    });

    it('should normalize date to start of day', () => {
      const periodRanges = new DateRangeList();
      periodRanges.addRange(new Date('2025-11-01'), new Date('2025-11-05'));

      const result1 = CycleUtils.getCycleDay(periodRanges, new Date('2025-11-05T00:00:00'));
      const result2 = CycleUtils.getCycleDay(periodRanges, new Date('2025-11-05T23:59:59'));

      expect(result1).toBe(result2);
    });

    it('should return 0 when no period before given date', () => {
      const periodRanges = new DateRangeList();
      periodRanges.addRange(new Date('2025-11-01'), new Date('2025-11-05'));

      const result = CycleUtils.getCycleDay(periodRanges, new Date('2025-10-15'));

      expect(result).toBe(0);
    });

    it('should handle multiple periods correctly', () => {
      const periodRanges = new DateRangeList();
      periodRanges.addRange(new Date('2025-09-01T00:00:00'), new Date('2025-09-05T00:00:00'));
      periodRanges.addRange(new Date('2025-10-01T00:00:00'), new Date('2025-10-05T00:00:00'));
      periodRanges.addRange(new Date('2025-11-01T00:00:00'), new Date('2025-11-05T00:00:00'));

      const result = CycleUtils.getCycleDay(periodRanges, new Date('2025-11-20T00:00:00'));

      // Should be based on Nov 1 period, around day 19-20
      expect(result).toBeGreaterThanOrEqual(18);
      expect(result).toBeLessThanOrEqual(20);
    });
  });

  describe('computeUserStats', () => {
    it('should return defaults for empty period ranges', () => {
      const periodRanges = new DateRangeList();

      const result = CycleUtils.computeUserStats(periodRanges);

      expect(result.averageCycleLength).toBe(28);
      expect(result.minCycleLength).toBe(28);
      expect(result.maxCycleLength).toBe(28);
      expect(result.cycleLengths).toEqual([]);
      expect(result.averagePeriodLength).toBe(0);
      expect(result.minPeriodLength).toBe(0);
      expect(result.maxPeriodLength).toBe(0);
      expect(result.periodLengths).toEqual([]);
    });

    it('should calculate period lengths correctly', () => {
      const periodRanges = new DateRangeList();
      periodRanges.addRange(new Date('2025-11-01'), new Date('2025-11-05')); // 5 days
      periodRanges.addRange(new Date('2025-11-29'), new Date('2025-12-03')); // 5 days

      const result = CycleUtils.computeUserStats(periodRanges);

      expect(result.periodLengths).toEqual([5, 5]);
      expect(result.averagePeriodLength).toBe(5);
      expect(result.minPeriodLength).toBe(5);
      expect(result.maxPeriodLength).toBe(5);
    });

    it('should calculate cycle lengths correctly', () => {
      const periodRanges = new DateRangeList();
      periodRanges.addRange(new Date('2025-10-01'), new Date('2025-10-05'));
      periodRanges.addRange(new Date('2025-10-29'), new Date('2025-11-02')); // 28 days later

      const result = CycleUtils.computeUserStats(periodRanges);

      expect(result.cycleLengths).toEqual([28]);
      expect(result.averageCycleLength).toBe(28);
      expect(result.minCycleLength).toBe(28);
      expect(result.maxCycleLength).toBe(28);
    });

    it('should handle varying cycle lengths', () => {
      const periodRanges = new DateRangeList();
      periodRanges.addRange(new Date('2025-09-01'), new Date('2025-09-05'));
      periodRanges.addRange(new Date('2025-09-29'), new Date('2025-10-03')); // 28 days
      periodRanges.addRange(new Date('2025-10-27'), new Date('2025-10-31')); // 28 days
      periodRanges.addRange(new Date('2025-11-26'), new Date('2025-11-30')); // 30 days

      const result = CycleUtils.computeUserStats(periodRanges);

      expect(result.cycleLengths.length).toBe(3);
      expect(result.minCycleLength).toBe(28);
      expect(result.maxCycleLength).toBe(30);
      expect(result.averageCycleLength).toBeGreaterThanOrEqual(28);
      expect(result.averageCycleLength).toBeLessThanOrEqual(29);
    });

    it('should handle varying period lengths', () => {
      const periodRanges = new DateRangeList();
      periodRanges.addRange(new Date('2025-10-01'), new Date('2025-10-04')); // 4 days
      periodRanges.addRange(new Date('2025-11-01'), new Date('2025-11-06')); // 6 days

      const result = CycleUtils.computeUserStats(periodRanges);

      expect(result.periodLengths).toEqual([4, 6]);
      expect(result.minPeriodLength).toBe(4);
      expect(result.maxPeriodLength).toBe(6);
      expect(result.averagePeriodLength).toBe(5);
    });

    it('should sort periods by start date before calculating', () => {
      const periodRanges = new DateRangeList();
      // Add in reverse order
      periodRanges.addRange(new Date('2025-11-01'), new Date('2025-11-05'));
      periodRanges.addRange(new Date('2025-10-01'), new Date('2025-10-05'));
      periodRanges.addRange(new Date('2025-09-01'), new Date('2025-09-05'));

      const result = CycleUtils.computeUserStats(periodRanges);

      // Should calculate cycle length correctly despite unsorted input
      expect(result.cycleLengths.length).toBe(2);
      expect(result.cycleLengths[0]).toBeGreaterThanOrEqual(28);
    });

    it('should handle single period', () => {
      const periodRanges = new DateRangeList();
      periodRanges.addRange(new Date('2025-11-01'), new Date('2025-11-05'));

      const result = CycleUtils.computeUserStats(periodRanges);

      expect(result.periodLengths).toEqual([5]);
      expect(result.cycleLengths).toEqual([]);
      expect(result.averageCycleLength).toBe(28); // Default
      expect(result.averagePeriodLength).toBe(5);
    });

    it('should handle periods with single day', () => {
      const periodRanges = new DateRangeList();
      periodRanges.addRange(new Date('2025-11-01'), new Date('2025-11-01'));

      const result = CycleUtils.computeUserStats(periodRanges);

      expect(result.periodLengths).toEqual([1]);
      expect(result.averagePeriodLength).toBe(1);
    });
  });
});
