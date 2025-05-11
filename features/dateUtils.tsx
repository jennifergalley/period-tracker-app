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
