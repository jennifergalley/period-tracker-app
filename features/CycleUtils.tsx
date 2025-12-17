// Utility functions for period and fertility calculations
import { DateRange } from '@/features/DateRange';
import { DateRangeList } from '@/features/DateRangeList';
import { datePlusNDays } from '@/features/DateUtils';

/**
 * Utility class for managing menstrual cycle tracking logic, including period logging,
 * fertile window calculation, period prediction, and cycle day calculation.
 *
 * Provides static methods to:
 * - Log period days or ranges, with optional auto-add functionality for missed periods.
 * - Calculate the fertile window and ovulation day based on the last logged period.
 * - Predict all period date ranges for the next year using cycle and period length.
 * - Determine the current cycle day for a given date.
 *
 * All methods operate on a `DateRangeList` abstraction for managing period ranges.
 */
export class CycleUtils {
    /**
     * Logs a period day or range to the periodRanges list.
     * Optionally auto-adds a period range if the last period was long ago.
     * @param {Date} date The date to log as a period day.
     * @param {DateRangeList} periodRanges The current list of period ranges.
     * @param {(ranges: DateRangeList) => void} setPeriodRanges Callback to update the period ranges.
     * @param {boolean} autoAddPeriodDays Whether to auto-add a period range if appropriate.
     */
    static logPeriod(
        date: Date,
        periodRanges: DateRangeList,
        setPeriodRanges: (ranges: DateRangeList) => void,
        autoAddPeriodDays: boolean,
        typicalPeriodLength: number = 5
    ) {
        // Normalize the date to the start of the day
        // This is important to avoid issues with time zones and date comparisons
        // We set the time to 00:00:00.000 to ensure we are comparing the date only
        let startOfDate = new Date(date);
        startOfDate.setHours(0, 0, 0, 0);

        console.log("Logging period for date:", startOfDate);
        const today = new Date();
        const newPeriodRanges = new DateRangeList();
        newPeriodRanges.loadFromObject(periodRanges);

        // Check if the date is already in the period ranges
        // If not, add it
        if (!newPeriodRanges.containsDate(startOfDate)) {
            const previousPeriod = newPeriodRanges.getLastRangeBefore(startOfDate);
            console.log("Last period:", previousPeriod);
            console.log("Last period ended:", previousPeriod?.end);

            // Check if we should auto-add the next period days
            if (
                // Auto-adding days must be enabled
                autoAddPeriodDays &&
                (
                    // Either their last period does not exist
                    !previousPeriod ||
                    // or their last period ended more than 20 days ago
                    (previousPeriod.end && (today.getTime() - previousPeriod.end.getTime()) > 20 * 24 * 60 * 60 * 1000)
                ))
            {
                console.log("Auto-adding period days");
                // If auto-adding, add the next X days based on their cycle length
                const periodEnd = datePlusNDays(startOfDate, typicalPeriodLength - 1);
                const newPeriodRange = new DateRange(startOfDate, periodEnd);
                newPeriodRanges.addRange(newPeriodRange);
                setPeriodRanges(newPeriodRanges);
            } else {
                console.log("Adding single period day");
                // If not auto-adding, just add the single day
                newPeriodRanges.addRange(startOfDate);
                setPeriodRanges(newPeriodRanges);
            }
        } else {
            // If the date is already in the period ranges, remove it
            console.log("Removing period day");
            newPeriodRanges.removeDate(startOfDate);
            setPeriodRanges(newPeriodRanges);
        }
    }

    /**
     * Calculates the fertile window and ovulation day based on the last period.
     * @param {DateRangeList} periodRanges The list of period ranges.
     * @returns {{ ovulationDay: Date | null, fertileWindow: DateRange }} The ovulation day and fertile window range.
     */
    static calculateFertileWindow(periodRanges: DateRangeList) {
        if (periodRanges.isEmpty()) return { ovulationDay: null, fertileWindow: new DateRange(null, null) };

        // Get the chronologically last period range
        const lastPeriod = periodRanges.getLastRange();

        if (!lastPeriod || !lastPeriod.start) return { ovulationDay: null, fertileWindow: new DateRange(null, null) };
        
        let firstDayOfCycle = lastPeriod.start;
        let ovulationDay = new Date(firstDayOfCycle);

        ovulationDay.setDate(ovulationDay.getDate() + 14);
        let fertileStart = new Date(ovulationDay);

        fertileStart.setDate(fertileStart.getDate() - 5);
        
        const fertileWindow = new DateRange(fertileStart, ovulationDay);
        
        return {
            ovulationDay,
            fertileWindow
        };
    }

    /**
     * Predicts all period date ranges for the next year based on the last period and cycle/period length.
     * @param {DateRangeList} periodRanges The list of period ranges.
     * @param {number} [periodLength=5] The length of the period in days.
     * @param {number} [cycleLength=28] The cycle length in days.
     * @returns {DateRangeList} The predicted period date ranges for the next year.
     */
    static getAllPredictedPeriods(
        periodRanges: DateRangeList,
        periodLength: number = 5,
        cycleLength: number = 28
    ): DateRangeList {
        const predicted = new DateRangeList();

        if (periodRanges.isEmpty()) {
            console.log("No period ranges provided, returning empty prediction.");
            return predicted;
        }

        // Get the last period
        const lastPeriod = periodRanges.getLastRange();
        if (!lastPeriod || !lastPeriod.start) {
            console.log("No last period found or last period has no start date, returning empty prediction.");
            return predicted;
        }

        // Predict the next period start date based on the last period and cycle length
        let nextPeriodStart = datePlusNDays(lastPeriod.start, cycleLength);

        console.log("Last period:", lastPeriod);
        console.log("Predicted first nextPeriodStart:", nextPeriodStart);

        // Generate periods for the next 12 months
        const endDate = new Date(nextPeriodStart);
        endDate.setFullYear(endDate.getFullYear() + 1);

        while (nextPeriodStart < endDate) {
            const periodStart = new Date(nextPeriodStart);
            const periodEnd = datePlusNDays(periodStart, periodLength - 1);
            console.log(`Adding predicted period: start=${periodStart}, end=${periodEnd}`);
            predicted.addRange(new DateRange(periodStart, periodEnd));
            nextPeriodStart = datePlusNDays(nextPeriodStart, cycleLength);
            console.log("Next predicted period start:", nextPeriodStart);
        }

        console.log("All predicted periods:", predicted);
        return predicted;
    }

    /**
     * Calculates the cycle day based on the provided period ranges and a specific date.
     *
     * @param periodRanges - A list of date ranges representing previous periods.
     * @param date - The date for which to calculate the cycle day.
     * @returns The cycle day as a 1-based number. Returns 0 if there are no period ranges or the last period is invalid.
     */
    static getCycleDay(periodRanges: DateRangeList, date: Date): number {
        if (periodRanges.isEmpty()) return 0;

        // Normalize the date to the start of the day
        let startOfDate = new Date(date);
        startOfDate.setHours(0, 0, 0, 0);

        // Sort ranges by start date to find the correct cycle
        const sortedRanges = (periodRanges.ranges || []).slice().sort((a, b) => {
            if (!a.start || !b.start) return 0;
            return a.start.getTime() - b.start.getTime();
        });

        // Find the most recent period that started on or before this date
        let relevantPeriod = null;
        for (const range of sortedRanges) {
            if (!range.start) continue;
            const periodStart = new Date(range.start);
            periodStart.setHours(0, 0, 0, 0);
            
            if (periodStart <= startOfDate) {
                relevantPeriod = range;
            } else {
                break; // Periods are sorted, so we can stop here
            }
        }

        if (!relevantPeriod || !relevantPeriod.start) return 0;

        // Calculate the cycle day from the relevant period
        const cycleStart = relevantPeriod.start;
        const cycleLength = Math.floor((startOfDate.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24));

        return cycleLength + 1; // Add 1 to make it 1-based
    }

    /**
     * Computes user stats: cycle/period lengths, averages, min/max.
     * @param periodRanges The list of period ranges.
     */
    static computeUserStats(
        periodRanges: DateRangeList
    ) {
        // --- Cycle lengths ---
        const cycleLengths: number[] = [];
        
        // Sort ranges by start date to handle backfilled data
        const ranges = (periodRanges.ranges || []).slice().sort((a, b) => {
            if (!a.start || !b.start) return 0;
            return a.start.getTime() - b.start.getTime();
        });
        for (let i = 1; i < ranges.length; i++) {
            const prev = ranges[i - 1];
            const curr = ranges[i];
            if (prev.start && curr.start) {
                const diff = Math.round((curr.start.getTime() - prev.start.getTime()) / (1000 * 60 * 60 * 24));
                cycleLengths.push(diff);
            }
        }
        let averageCycleLength = 28;
        if (cycleLengths.length > 0) {
            averageCycleLength = Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length);
        }
        const minCycleLength = cycleLengths.length > 0 ? Math.min(...cycleLengths) : 28;
        const maxCycleLength = cycleLengths.length > 0 ? Math.max(...cycleLengths) : 28;

        // --- Period lengths ---
        const periodLengths: number[] = [];
        for (let i = 0; i < ranges.length; i++) {
            const r = ranges[i];
            if (r.start && r.end) {
                const diff = Math.round((r.end.getTime() - r.start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                periodLengths.push(diff);
            }
        }
        const averagePeriodLength = periodLengths.length > 0 ? Math.round(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length) : 0;
        const minPeriodLength = periodLengths.length > 0 ? Math.min(...periodLengths) : 0;
        const maxPeriodLength = periodLengths.length > 0 ? Math.max(...periodLengths) : 0;

        return {
            averageCycleLength,
            minCycleLength,
            maxCycleLength,
            cycleLengths,
            averagePeriodLength,
            minPeriodLength,
            maxPeriodLength,
            periodLengths,
        };
    }

    /**
     * Calculates how many days late the user is based on their predicted period.
     * Returns 0 if not late, or a positive number indicating days late.
     * @param predictedPeriods The list of predicted period ranges.
     * @param periodRanges The list of actual logged period ranges.
     * @param referenceDate The date to check lateness against (usually today).
     * @returns Number of days late, or 0 if not late.
     */
    static calculateDaysLate(
        predictedPeriods: DateRangeList,
        periodRanges: DateRangeList,
        referenceDate: Date
    ): number {
        if (!predictedPeriods?.ranges?.length) return 0;

        // Sort predicted periods by start date
        const sortedPredicted = [...predictedPeriods.ranges]
            .filter(r => r.start)
            .sort((a, b) => a.start!.getTime() - b.start!.getTime());

        if (sortedPredicted.length === 0) return 0;

        // Get the first predicted period (the next expected one)
        const nextPredicted = sortedPredicted[0];
        if (!nextPredicted.start) return 0;

        const predictedStart = new Date(nextPredicted.start);
        predictedStart.setHours(0, 0, 0, 0);
        
        const dateNormalized = new Date(referenceDate);
        dateNormalized.setHours(0, 0, 0, 0);

        // If reference date is before the predicted start, not late
        if (dateNormalized < predictedStart) return 0;

        // If the user is currently on their period (reference date is marked as period), not late
        if (periodRanges.containsDate(dateNormalized)) return 0;

        // Calculate days late (reference date - predicted start date)
        const daysLate = Math.floor(
            (dateNormalized.getTime() - predictedStart.getTime()) / (1000 * 60 * 60 * 24)
        );

        return daysLate;
    }
}

