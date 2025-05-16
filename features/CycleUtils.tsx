// Utility functions for period and fertility calculations
import { DateRange } from '@/features/DateRange';
import { DateRangeList } from '@/features/DateRangeList';
import { datePlusNDays } from '@/features/dateUtils';

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
            const lastPeriod = newPeriodRanges.getLastRange();
            console.log("Last period:", lastPeriod);
            console.log("Last period ended:", lastPeriod?.end);

            // Check if we should auto-add the next period days
            if (
                // Auto-adding days must be enabled
                autoAddPeriodDays &&
                (
                    // Either their last period does not exist
                    !lastPeriod ||
                    // or their last period ended more than 20 days ago
                    (lastPeriod.end && (today.getTime() - lastPeriod.end.getTime()) > 20 * 24 * 60 * 60 * 1000)
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

        // Get the last period range
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
     * Calculates the current cycle day based on the provided period ranges and a specific date.
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

        // Get the last period range
        const lastPeriod = periodRanges.getLastRange();
        if (!lastPeriod || !lastPeriod.start) return 0;

        // Calculate the cycle day
        const cycleStart = lastPeriod.start;
        const cycleEnd = startOfDate;
        const cycleLength = Math.floor((cycleEnd.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24));

        return cycleLength + 1; // Add 1 to make it 1-based
    }
}

