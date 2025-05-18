import { DateRange } from "@/features/DateRange";
import { datePlusNDays } from "@/features/DateUtils";

/**
 * Manages a list of date ranges, allowing addition, querying, and retrieval of dates and ranges.
 *
 * The `DateRangeList` class provides methods to add new date ranges (either as single dates, date pairs, or `DateRange` objects),
 * check if the list is empty, retrieve all dates in all ranges, get the most recent range, get the last range before a specific date,
 * and check if a date is contained within any of the ranges.
 *
 * Ranges are stored in the order they are added. When adding a single date, the class will attempt to merge it with existing ranges
 * if it is adjacent to or overlaps with them.
 */
export class DateRangeList {
    ranges: DateRange[];
    
    constructor() {
        this.ranges = [];
    }

    loadFromObject(dateRangeList: any): void {
        console.log("Loading date range list from object:", dateRangeList);
        // Convert each item to a DateRange instance
        this.ranges = (dateRangeList?.ranges || []).map((r: any) => {
            // Handle cases where start/end are strings (from JSON)
            const start = r.start ? new Date(r.start) : null;
            const end = r.end ? new Date(r.end) : null;
            return new DateRange(start, end);
        });
    }
    
    /**
     * Check if the list of ranges is empty.
     * @returns {boolean} True if there are no ranges, false otherwise.
     */
    isEmpty(): boolean {
        return this.ranges.length === 0;
    }

    /**
     * Add a new date range from either two dates or a DateRange object
     * @param {Date | DateRange} startOrRange The start date or a DateRange object.
     * @param {Date} [end] The end date (if startOrRange is a Date).
     */ 
    addRange(start: Date): void;
    addRange(start: Date, end: Date): void;
    addRange(range: DateRange): void;
    addRange(startOrRange: Date | DateRange, end?: Date): void {
        if (startOrRange instanceof Date && end instanceof Date) {
            const newRange = new DateRange(startOrRange, end);
            this.ranges.push(newRange);
        } else if (startOrRange instanceof DateRange) {
            this.ranges.push(startOrRange);
        } else if (startOrRange instanceof Date) {
            // Check if the date is already in an existing range
            const existingRange = this.ranges.find(range => range.containsDate(startOrRange));
            if (existingRange) {
                return; // Date is already in an existing range, do nothing
            }

            // Check if the date is at the end of an existing range
            const dayMinus1 = datePlusNDays(startOrRange, -1);
            const endOfExistingRange = this.ranges.find(range => range.containsDate(dayMinus1));
            if (endOfExistingRange) {
                // Extend the existing range
                endOfExistingRange.end = startOrRange;
            }
            
            // Check if the date is at the start of an existing range
            const dayPlus1 = datePlusNDays(startOrRange, 1);
            dayPlus1.setDate(dayPlus1.getDate() + 1);
            const startOfExistingRange = this.ranges.find(range => range.containsDate(dayPlus1));
            if (startOfExistingRange) {
                // Extend the existing range
                startOfExistingRange.start = startOrRange;
            }
            
            // Otherwise, create a new range with the single date
            const newRange = new DateRange(startOrRange, startOrRange);
            this.ranges.push(newRange);
        }
    }
    
    /**
     * Get all dates in the ranges in sorted order, earliest to latest.
     * @returns {Date[]} An array of all dates in all ranges.
     */
    getAllDates(): Date[] {
        return this.ranges.flatMap(range => range.getDatesInRange());
    }

    /**
     * Get the last (most recent) range.
     * @returns {DateRange | null} The last range or null if none exist.
     */
    getLastRange(): DateRange | null {
        if (this.ranges.length === 0) return null;
        
        // Find the range with the latest end date (chronologically last)
        let latest: DateRange | null = null;
        let latestTime = -Infinity;
        for (const range of this.ranges) {
            if (range.end && range.end.getTime() > latestTime) {
                latest = range;
                latestTime = range.end.getTime();
            }
        }
        return latest;
    }

    /**
     * Get the last range before a specific date.
     * @param {Date} date The date to compare.
     * @returns {DateRange | null} The last range before the given date or null.
     */
    getLastRangeBefore(date: Date): DateRange | null {
        if (this.ranges.length === 0) return null;
        const sortedRanges = this.ranges.sort((a, b) => {
            if (a.start && b.start) {
                return a.start.getTime() - b.start.getTime();
            }
            return 0;
        });
        const lastRange = sortedRanges.find(range => range.start && range.start < date);
        return lastRange || null;
    }
    
    /**
     * Check if a date is within any of the ranges.
     * @param {Date} date The date to check.
     * @returns {boolean} True if the date is in any range, false otherwise.
     */
    containsDate(date: Date): boolean {
        return this.ranges.some(range => range.containsDate(date));
    }

    removeDate(date: Date): void {
        // Find the index of the range that contains the date
        const index = this.ranges.findIndex(range => range.containsDate(date));
        if (index !== -1) {
            const range = this.ranges[index];
            const isStart = range.start && range.start.getTime() === date.getTime();
            const isEnd = range.end && range.end.getTime() === date.getTime();
            const isSingleDay = range.start && range.end && range.start.getTime() === range.end.getTime();

            if (isSingleDay && isStart && isEnd) {
                // Only one day in the range, remove the range
                this.ranges.splice(index, 1);
            } else if (isStart) {
                // Move start forward by one day
                range.start = datePlusNDays(date, 1);
            } else if (isEnd) {
                // Move end backward by one day
                range.end = datePlusNDays(date, -1);
            } else {
                // Date is in the middle, split into two ranges
                const newRange1 = new DateRange(range.start, datePlusNDays(date, -1));
                const newRange2 = new DateRange(datePlusNDays(date, 1), range.end);
                this.ranges.splice(index, 1, newRange1, newRange2);
            }
        }
    }

    /**
     * Convert the list of ranges to a JSON object.
     * @returns {object} The JSON representation of the date range list, with each range formatted as YYYY-MM-DD.
     */
    toJSON() {
        return { ranges: this.ranges.map(r => r.toJSON()) };
    }

    /**
     * Create a DateRangeList from a JSON object.
     * @param {object} obj The JSON object to convert.
     * @returns {DateRangeList} The DateRangeList instance.
     */
    static fromJSON(obj: any) {
        const list = new DateRangeList();
        if (obj?.ranges) {
            list.ranges = obj.ranges.map((r: any) => DateRange.fromJSON(r));
        }
        return list;
    }
}