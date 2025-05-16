import { DateRange } from "@/features/DateRange";

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// Helper to get days in month
export function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

// Helper to get first day of week (0=Sunday)
export function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

// Helper to check if a date is today
export function isToday(date: Date) {
  const TODAY = startOfDay(new Date());
  const d = startOfDay(date);
  return d.getTime() === TODAY.getTime();
}

// Helper function to format a date range for display in the UI
export function formatDateRange(range: DateRange): string {
  if (range.isEmpty()) return 'No dates selected';
  
  const startDate = range.start!;
  const endDate = range.end!;
  
  // Same day
  if (toDateKey(startDate) === toDateKey(endDate)) {
    return formatDate(startDate);
  }
  
  // Different days
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

// Format a single date in a human-readable format
export function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = { 
    month: 'short', 
    day: 'numeric' 
  };
  
  return date.toLocaleDateString('en-US', options);
}

// Format a date with year for logs that span multiple years
export function formatDateWithYear(date: Date): string {
  const options: Intl.DateTimeFormatOptions = { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  };
  
  return date.toLocaleDateString('en-US', options);
}

// Add N days to a date
export function datePlusNDays(date: Date, n: number): Date {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + n);
  return newDate;
}

// Utility to get YYYY-MM-DD from a Date
export function toDateKey(date: Date | string): string {
  if (typeof date === 'string') {
    // If already in YYYY-MM-DD, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
    // If in another string format, parse to Date
    date = new Date(date);
  }
  return date.toISOString().slice(0, 10);
}
