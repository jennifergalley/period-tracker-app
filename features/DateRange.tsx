import { startOfDay } from "@/features/dateUtils";

/**
 * Class for managing ranges of dates.
 */
export class DateRange {
  /**
   * The start date of the range.
   */
  start: Date | null;
  /**
   * The end date of the range.
   */
  end: Date | null;
  
  /**
   * Create a new DateRange.
   * @param {Date | null} start The start date.
   * @param {Date | null} end The end date.
   */
  constructor(start: Date | null = null, end: Date | null = null) {
    this.start = start;
    this.end = end;
  }

  /**
   * Load date ranges from an object.
   * @param {any} periodRanges The object containing date ranges.
   */
  loadFromObject(dateRange: any): void {
    console.log("Loading date range from object:", dateRange);
    // Convert each item to a DateRange instance
    this.start = dateRange?.start ? new Date(dateRange.start) : null;
    this.end = dateRange?.end ? new Date(dateRange.end) : null;
  }
  
  /**
   * Check if a date is within this range.
   * @param {Date} date The date to check.
   * @returns {boolean} True if the date is in the range, false otherwise.
   */
  containsDate(date: Date): boolean {
    if (!this.start || !this.end) return false;
    
    const testDate = startOfDay(date);
    const startDate = startOfDay(this.start);
    const endDate = startOfDay(this.end);
    
    return testDate >= startDate && testDate <= endDate;
  }
  
  /**
   * Get all dates in the range, inclusive.
   * @returns {Date[]} An array of all dates in the range.
   */
  getDatesInRange(): Date[] {
    if (!this.start || !this.end) return [];
    
    const dates: Date[] = [];
    const currentDate = new Date(this.start);
    
    while (currentDate <= this.end) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  }
  
  /**
   * Check if the range is empty (start or end is null).
   * @returns {boolean} True if the range is empty, false otherwise.
   */
  isEmpty(): boolean {
    return this.start === null || this.end === null;
  }

  /**
   * Convert the date range to a JSON object, with dates formatted as YYYY-MM-DD.
   * @returns {object} The JSON representation of the date range.
   */
  toJSON() {
    return {
      start: this.start ? this.start.toISOString().slice(0, 10) : null,
      end: this.end ? this.end.toISOString().slice(0, 10) : null,
    };
  }

  /**
   * Create a DateRange from a JSON object, assuming the dates are in YYYY-MM-DD format.
   * @param {object} obj The JSON object containing the date range.
   * @returns {DateRange} The DateRange instance.
   */
  static fromJSON(obj: any) {
    return new DateRange(
      obj.start ? new Date(obj.start + 'T00:00:00') : null,
      obj.end ? new Date(obj.end + 'T00:00:00') : null
    );
  }
}