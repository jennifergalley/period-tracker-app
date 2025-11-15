import { CycleUtils } from '@/features/CycleUtils';

/**
 * Default symptoms list for new users.
 */
export const DEFAULT_SYMPTOMS = [
  { name: 'Cramps', icon: '💢' },
  { name: 'Headache', icon: '🤕' },
  { name: 'Bloating', icon: '💨' },
  { name: 'Mood Swings', icon: '😡' },
  { name: 'Fatigue', icon: '😴' },
  { name: 'Tender Breasts', icon: '🤲' },
  { name: 'Hunger', icon: '🍽️' },
  { name: 'Diarrhea', icon: '💩' },
  { name: 'Constipation', icon: '🚽' },
  { name: 'Dehydration', icon: '🥤' },
  { name: 'Irritable', icon: '🤬' },
  { name: 'Depression', icon: '😭' },
  { name: 'Spotting', icon: '🩸' },
  { name: 'Back Pain', icon: '💢' },
  { name: 'Horny', icon: '😏' },
];

export class SymptomUtils {
    /**
     * Computes the most frequent symptoms from the given logs.
     * @param symptomLogs - An object where keys are dates and values are arrays of symptom names.
     * @param allSymptoms - An array of all possible symptoms with their icons.
     * @param topN - The number of top symptoms to return.
     * @returns An array of the top N most frequent symptoms.
     */
    static computeMostFrequentSymptoms(
        symptomLogs: { [date: string]: string[] },
        allSymptoms: { name: string; icon: string }[],
        topN: number = 5
    ) {
        const symptomCounts: Record<string, { name: string; icon: string; count: number }> = {};
        
        // Flatten the symptom logs and count occurrences
        Object.values(symptomLogs).flat().forEach(symptomName => {
            const found = allSymptoms.find(s => s.name === symptomName);
            if (found) {
                if (!symptomCounts[symptomName]) {
                    symptomCounts[symptomName] = { ...found, count: 0 };
                }
                symptomCounts[symptomName].count++;
            }
        });

        // Convert to array, sort by count, and return the top N
        return Object.values(symptomCounts)
            .sort((a, b) => b.count - a.count)
            .slice(0, topN);
    }

    /**
     * Computes symptom frequency by cycle day for heatmap visualization.
     * @param symptomLogs - An object where keys are dates (YYYY-MM-DD) and values are arrays of symptom names.
     * @param periodRanges - The list of period ranges to determine cycle days.
     * @param symptomNames - Array of symptom names to analyze.
     * @param maxCycleDay - Maximum cycle day to include (default 35).
     * @returns An object mapping symptom names to arrays of counts per cycle day.
     */
    static computeSymptomByCycleDay(
        symptomLogs: { [date: string]: string[] },
        periodRanges: any,
        symptomNames: string[],
        maxCycleDay: number = 35
    ): { [symptomName: string]: number[] } {        
        // Initialize result object with arrays of zeros for each symptom
        const result: { [symptomName: string]: number[] } = {};
        symptomNames.forEach(name => {
            result[name] = new Array(maxCycleDay).fill(0);
        });

        // Process each date in symptomLogs
        Object.keys(symptomLogs).forEach(dateKey => {
            const date = new Date(dateKey);
            const cycleDay = CycleUtils.getCycleDay(periodRanges, date);
            
            // Only count if we have a valid cycle day and it's within range
            if (cycleDay > 0 && cycleDay <= maxCycleDay) {
                const symptoms = symptomLogs[dateKey];
                symptoms.forEach(symptomName => {
                    if (symptomNames.includes(symptomName)) {
                        result[symptomName][cycleDay - 1]++; // -1 because array is 0-indexed
                    }
                });
            }
        });

        return result;
    }
}
