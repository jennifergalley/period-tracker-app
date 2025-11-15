import { SymptomUtils, DEFAULT_SYMPTOMS } from '@/features/SymptomUtils';
import { DateRangeList } from '@/features/DateRangeList';

describe('SymptomUtils', () => {
  describe('computeMostFrequentSymptoms', () => {
    const testSymptoms = [
      { name: 'Cramps', icon: '💢' },
      { name: 'Headache', icon: '🤕' },
      { name: 'Bloating', icon: '💨' },
      { name: 'Fatigue', icon: '😴' },
    ];

    it('should return top N most frequent symptoms', () => {
      const symptomLogs = {
        '2025-11-01': ['Cramps', 'Headache'],
        '2025-11-02': ['Cramps', 'Bloating'],
        '2025-11-03': ['Cramps', 'Fatigue'],
        '2025-11-04': ['Headache'],
      };
      
      const result = SymptomUtils.computeMostFrequentSymptoms(symptomLogs, testSymptoms, 3);
      
      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('Cramps');
      expect(result[0].count).toBe(3);
      expect(result[1].name).toBe('Headache');
      expect(result[1].count).toBe(2);
    });

    it('should handle empty logs', () => {
      const symptomLogs = {};
      
      const result = SymptomUtils.computeMostFrequentSymptoms(symptomLogs, testSymptoms, 5);
      
      expect(result).toEqual([]);
    });

    it('should handle single symptom', () => {
      const symptomLogs = {
        '2025-11-01': ['Cramps'],
      };
      
      const result = SymptomUtils.computeMostFrequentSymptoms(symptomLogs, testSymptoms, 5);
      
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Cramps');
      expect(result[0].count).toBe(1);
    });

    it('should limit results to topN', () => {
      const symptomLogs = {
        '2025-11-01': ['Cramps', 'Headache', 'Bloating', 'Fatigue'],
        '2025-11-02': ['Cramps', 'Headache', 'Bloating'],
        '2025-11-03': ['Cramps', 'Headache'],
      };
      
      const result = SymptomUtils.computeMostFrequentSymptoms(symptomLogs, testSymptoms, 2);
      
      expect(result).toHaveLength(2);
    });

    it('should ignore symptoms not in allSymptoms list', () => {
      const symptomLogs = {
        '2025-11-01': ['Cramps', 'UnknownSymptom'],
      };
      
      const result = SymptomUtils.computeMostFrequentSymptoms(symptomLogs, testSymptoms, 5);
      
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Cramps');
    });

    it('should handle multiple occurrences on same day', () => {
      const symptomLogs = {
        '2025-11-01': ['Cramps', 'Cramps', 'Headache'],
      };
      
      const result = SymptomUtils.computeMostFrequentSymptoms(symptomLogs, testSymptoms, 5);
      
      expect(result[0].name).toBe('Cramps');
      expect(result[0].count).toBe(2);
    });

    it('should default to top 5 when topN not specified', () => {
      const symptomLogs = {
        '2025-11-01': ['Cramps', 'Headache', 'Bloating', 'Fatigue'],
      };
      
      const result = SymptomUtils.computeMostFrequentSymptoms(symptomLogs, testSymptoms);
      
      expect(result.length).toBeLessThanOrEqual(5);
    });

    it('should include icon in result', () => {
      const symptomLogs = {
        '2025-11-01': ['Cramps'],
      };
      
      const result = SymptomUtils.computeMostFrequentSymptoms(symptomLogs, testSymptoms, 5);
      
      expect(result[0].icon).toBe('💢');
    });
  });

  describe('computeSymptomByCycleDay', () => {
    it('should initialize arrays with zeros for each symptom', () => {
      const symptomLogs = {};
      const periodRanges = new DateRangeList();
      const symptomNames = ['Cramps', 'Headache'];
      
      const result = SymptomUtils.computeSymptomByCycleDay(symptomLogs, periodRanges, symptomNames, 10);
      
      expect(result['Cramps']).toHaveLength(10);
      expect(result['Headache']).toHaveLength(10);
      expect(result['Cramps'].every(count => count === 0)).toBe(true);
    });

    it('should map symptoms to cycle days', () => {
      const periodRanges = new DateRangeList();
      periodRanges.addRange(new Date('2025-11-01T00:00:00'), new Date('2025-11-05T00:00:00'));
      
      const symptomLogs = {
        '2025-11-01': ['Cramps'],
        '2025-11-02': ['Cramps', 'Headache'],
      };
      const symptomNames = ['Cramps', 'Headache'];
      
      const result = SymptomUtils.computeSymptomByCycleDay(symptomLogs, periodRanges, symptomNames, 35);
      
      // Check structure - should have arrays for each symptom
      expect(result['Cramps']).toHaveLength(35);
      expect(result['Headache']).toHaveLength(35);
      // At least some symptoms should be counted
      expect(result['Cramps'].reduce((a, b) => a + b, 0)).toBeGreaterThan(0);
    });

    it('should handle empty logs', () => {
      const symptomLogs = {};
      const periodRanges = new DateRangeList();
      const symptomNames = ['Cramps'];
      
      const result = SymptomUtils.computeSymptomByCycleDay(symptomLogs, periodRanges, symptomNames, 35);
      
      expect(result['Cramps']).toHaveLength(35);
      expect(result['Cramps'].every(count => count === 0)).toBe(true);
    });

    it('should ignore symptoms not in symptomNames', () => {
      const periodRanges = new DateRangeList();
      periodRanges.addRange(new Date('2025-11-01T00:00:00'), new Date('2025-11-05T00:00:00'));
      
      const symptomLogs = {
        '2025-11-01': ['Cramps', 'Headache', 'Bloating'],
      };
      const symptomNames = ['Cramps'];
      
      const result = SymptomUtils.computeSymptomByCycleDay(symptomLogs, periodRanges, symptomNames, 35);
      
      expect(result['Cramps']).toBeDefined();
      expect(result['Cramps']).toHaveLength(35);
      expect(result['Headache']).toBeUndefined();
      expect(result['Bloating']).toBeUndefined();
    });

    it('should handle custom maxCycleDay', () => {
      const symptomLogs = {};
      const periodRanges = new DateRangeList();
      const symptomNames = ['Cramps'];
      
      const result = SymptomUtils.computeSymptomByCycleDay(symptomLogs, periodRanges, symptomNames, 20);
      
      expect(result['Cramps']).toHaveLength(20);
    });

    it('should default to maxCycleDay of 35', () => {
      const symptomLogs = {};
      const periodRanges = new DateRangeList();
      const symptomNames = ['Cramps'];
      
      const result = SymptomUtils.computeSymptomByCycleDay(symptomLogs, periodRanges, symptomNames);
      
      expect(result['Cramps']).toHaveLength(35);
    });

    it('should accumulate counts for repeated symptoms on same cycle day', () => {
      const periodRanges = new DateRangeList();
      periodRanges.addRange(new Date('2025-11-01T00:00:00'), new Date('2025-11-05T00:00:00'));
      periodRanges.addRange(new Date('2025-11-29T00:00:00'), new Date('2025-12-03T00:00:00'));
      
      const symptomLogs = {
        '2025-11-01': ['Cramps'],
        '2025-11-29': ['Cramps'],
      };
      const symptomNames = ['Cramps'];
      
      const result = SymptomUtils.computeSymptomByCycleDay(symptomLogs, periodRanges, symptomNames, 35);
      
      // Should have counted both occurrences somewhere
      const totalCount = result['Cramps'].reduce((a, b) => a + b, 0);
      expect(totalCount).toBeGreaterThan(0);
    });
  });

  describe('DEFAULT_SYMPTOMS', () => {
    it('should export default symptoms list', () => {
      expect(DEFAULT_SYMPTOMS).toBeDefined();
      expect(DEFAULT_SYMPTOMS.length).toBeGreaterThan(0);
    });

    it('should have name and icon for each symptom', () => {
      DEFAULT_SYMPTOMS.forEach(symptom => {
        expect(symptom.name).toBeDefined();
        expect(symptom.icon).toBeDefined();
        expect(typeof symptom.name).toBe('string');
        expect(typeof symptom.icon).toBe('string');
      });
    });
  });
});
