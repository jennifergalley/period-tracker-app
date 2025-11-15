import { filterAndSortWeightLogs, addOrUpdateWeightLog, deleteWeightLog, prepareWeightChartData } from '@/features/WeightUtils';

describe('WeightUtils', () => {
  describe('filterAndSortWeightLogs', () => {
    it('should filter and sort weight logs by date range', () => {
      const weightLogs = {
        '2025-11-01': { value: 150, unit: 'lbs' },
        '2025-11-05': { value: 148, unit: 'lbs' },
        '2025-11-10': { value: 147, unit: 'lbs' },
        '2025-11-15': { value: 146, unit: 'lbs' },
      };
      const startDate = new Date('2025-11-05');
      const endDate = new Date('2025-11-12');
      
      const result = filterAndSortWeightLogs(weightLogs, startDate, endDate);
      
      expect(result).toHaveLength(2);
      expect(result[0].value).toBe(148);
      expect(result[1].value).toBe(147);
    });

    it('should include dates on boundaries', () => {
      const weightLogs = {
        '2025-11-01': { value: 150, unit: 'lbs' },
        '2025-11-05': { value: 148, unit: 'lbs' },
        '2025-11-10': { value: 147, unit: 'lbs' },
      };
      const startDate = new Date('2025-11-01');
      const endDate = new Date('2025-11-10');
      
      const result = filterAndSortWeightLogs(weightLogs, startDate, endDate);
      
      expect(result).toHaveLength(3);
    });

    it('should sort logs chronologically', () => {
      const weightLogs = {
        '2025-11-10': { value: 147, unit: 'lbs' },
        '2025-11-01': { value: 150, unit: 'lbs' },
        '2025-11-05': { value: 148, unit: 'lbs' },
      };
      const startDate = new Date('2025-11-01');
      const endDate = new Date('2025-11-15');
      
      const result = filterAndSortWeightLogs(weightLogs, startDate, endDate);
      
      expect(result[0].date.toISOString().slice(0, 10)).toBe('2025-11-01');
      expect(result[1].date.toISOString().slice(0, 10)).toBe('2025-11-05');
      expect(result[2].date.toISOString().slice(0, 10)).toBe('2025-11-10');
    });

    it('should default unit to kg if not provided', () => {
      const weightLogs = {
        '2025-11-01': { value: 68 },
      };
      const startDate = new Date('2025-11-01');
      const endDate = new Date('2025-11-05');
      
      const result = filterAndSortWeightLogs(weightLogs, startDate, endDate);
      
      expect(result[0].unit).toBe('kg');
    });

    it('should return empty array when no logs in range', () => {
      const weightLogs = {
        '2025-11-01': { value: 150, unit: 'lbs' },
      };
      const startDate = new Date('2025-11-10');
      const endDate = new Date('2025-11-15');
      
      const result = filterAndSortWeightLogs(weightLogs, startDate, endDate);
      
      expect(result).toEqual([]);
    });

    it('should handle empty logs object', () => {
      const weightLogs = {};
      const startDate = new Date('2025-11-01');
      const endDate = new Date('2025-11-15');
      
      const result = filterAndSortWeightLogs(weightLogs, startDate, endDate);
      
      expect(result).toEqual([]);
    });
  });

  describe('addOrUpdateWeightLog', () => {
    it('should add new weight log entry', () => {
      const prevLogs = {
        '2025-11-01': { value: 150, unit: 'lbs' },
      };
      const logDate = new Date('2025-11-05');
      
      const result = addOrUpdateWeightLog(prevLogs, logDate, 148, 'lbs', null);
      
      expect(result['2025-11-05']).toEqual({ value: 148, unit: 'lbs' });
      expect(result['2025-11-01']).toEqual({ value: 150, unit: 'lbs' });
    });

    it('should update existing weight log entry', () => {
      const prevLogs = {
        '2025-11-01': { value: 150, unit: 'lbs' },
      };
      const logDate = new Date('2025-11-01');
      
      const result = addOrUpdateWeightLog(prevLogs, logDate, 148, 'lbs', null);
      
      expect(result['2025-11-01']).toEqual({ value: 148, unit: 'lbs' });
    });

    it('should remove old entry when editing date', () => {
      const prevLogs = {
        '2025-11-01': { value: 150, unit: 'lbs' },
        '2025-11-05': { value: 148, unit: 'lbs' },
      };
      const logDate = new Date('2025-11-10');
      const originalLogDate = new Date('2025-11-01');
      
      const result = addOrUpdateWeightLog(prevLogs, logDate, 147, 'lbs', originalLogDate);
      
      expect(result['2025-11-10']).toEqual({ value: 147, unit: 'lbs' });
      expect(result['2025-11-01']).toBeUndefined();
      expect(result['2025-11-05']).toEqual({ value: 148, unit: 'lbs' });
    });

    it('should not remove entry when editing with same date', () => {
      const prevLogs = {
        '2025-11-01': { value: 150, unit: 'lbs' },
      };
      const logDate = new Date('2025-11-01');
      const originalLogDate = new Date('2025-11-01');
      
      const result = addOrUpdateWeightLog(prevLogs, logDate, 148, 'lbs', originalLogDate);
      
      expect(result['2025-11-01']).toEqual({ value: 148, unit: 'lbs' });
      expect(Object.keys(result)).toHaveLength(1);
    });

    it('should handle adding to empty logs', () => {
      const prevLogs = {};
      const logDate = new Date('2025-11-01');
      
      const result = addOrUpdateWeightLog(prevLogs, logDate, 150, 'lbs', null);
      
      expect(result['2025-11-01']).toEqual({ value: 150, unit: 'lbs' });
    });

    it('should not mutate original logs object', () => {
      const prevLogs: any = {
        '2025-11-01': { value: 150, unit: 'lbs' },
      };
      const logDate = new Date('2025-11-05');
      
      const result = addOrUpdateWeightLog(prevLogs, logDate, 148, 'lbs', null);
      
      expect(prevLogs['2025-11-05']).toBeUndefined();
      expect(result['2025-11-05']).toBeDefined();
    });
  });

  describe('deleteWeightLog', () => {
    it('should delete weight log entry', () => {
      const prevLogs = {
        '2025-11-01': { value: 150, unit: 'lbs' },
        '2025-11-05': { value: 148, unit: 'lbs' },
      };
      const logDate = new Date('2025-11-01');
      
      const result = deleteWeightLog(prevLogs, logDate);
      
      expect(result['2025-11-01']).toBeUndefined();
      expect(result['2025-11-05']).toEqual({ value: 148, unit: 'lbs' });
    });

    it('should handle deleting non-existent entry', () => {
      const prevLogs = {
        '2025-11-01': { value: 150, unit: 'lbs' },
      };
      const logDate = new Date('2025-11-05');
      
      const result = deleteWeightLog(prevLogs, logDate);
      
      expect(result['2025-11-01']).toEqual({ value: 150, unit: 'lbs' });
      expect(Object.keys(result)).toHaveLength(1);
    });

    it('should handle deleting from empty logs', () => {
      const prevLogs = {};
      const logDate = new Date('2025-11-01');
      
      const result = deleteWeightLog(prevLogs, logDate);
      
      expect(result).toEqual({});
    });

    it('should not mutate original logs object', () => {
      const prevLogs = {
        '2025-11-01': { value: 150, unit: 'lbs' },
      };
      const logDate = new Date('2025-11-01');
      
      const result = deleteWeightLog(prevLogs, logDate);
      
      expect(prevLogs['2025-11-01']).toBeDefined();
      expect(result['2025-11-01']).toBeUndefined();
    });
  });

  describe('prepareWeightChartData', () => {
    it('should format log entries for chart display', () => {
      const logEntries = [
        { date: new Date('2025-11-01T12:00:00'), value: 150, unit: 'lbs' },
        { date: new Date('2025-11-05T12:00:00'), value: 148, unit: 'lbs' },
        { date: new Date('2025-11-10T12:00:00'), value: 147, unit: 'lbs' },
      ];
      
      const result = prepareWeightChartData(logEntries);
      
      expect(result.labels.length).toBe(3);
      expect(result.datasets[0].data).toEqual([150, 148, 147]);
    });

    it('should handle single entry', () => {
      const logEntries = [
        { date: new Date('2025-11-01T12:00:00'), value: 150, unit: 'lbs' },
      ];
      
      const result = prepareWeightChartData(logEntries);
      
      expect(result.labels.length).toBe(1);
      expect(result.datasets[0].data).toEqual([150]);
    });

    it('should handle empty entries', () => {
      const logEntries: any[] = [];
      
      const result = prepareWeightChartData(logEntries);
      
      expect(result.labels).toEqual([]);
      expect(result.datasets[0].data).toEqual([]);
    });

    it('should include chart styling configuration', () => {
      const logEntries = [
        { date: new Date('2025-11-01'), value: 150, unit: 'lbs' },
      ];
      
      const result = prepareWeightChartData(logEntries);
      
      expect(result.datasets[0].color).toBeDefined();
      expect(result.datasets[0].color(1)).toBe('rgba(77, 184, 255, 1)');
      expect(result.datasets[0].strokeWidth).toBe(2);
    });
  });
});
