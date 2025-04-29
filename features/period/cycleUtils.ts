// Utility functions for period and fertility calculations

export function calculateCycleInfo(periodDays: string[]) {
  let ovulationDay: Date | null = null;
  let fertileStart: Date | null = null;
  let fertileEnd: Date | null = null;
  let periodStart: Date | null = null;
  if (periodDays.length > 0) {
    periodStart = new Date(periodDays[0]);
    ovulationDay = new Date(periodStart);
    ovulationDay.setDate(ovulationDay.getDate() + 14);
    fertileStart = new Date(ovulationDay);
    fertileStart.setDate(fertileStart.getDate() - 6);
    fertileEnd = new Date(ovulationDay);
    fertileEnd.setDate(fertileEnd.getDate() + 1);
  }
  return { periodStart, ovulationDay, fertileStart, fertileEnd };
}

export function getPeriodDaysThisMonth(periodDays: string[], date: Date) {
  const month = date.getMonth();
  const year = date.getFullYear();
  return periodDays.filter(d => {
    const dObj = new Date(d);
    return dObj.getMonth() === month && dObj.getFullYear() === year;
  });
}
