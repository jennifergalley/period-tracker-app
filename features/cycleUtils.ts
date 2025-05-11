// Utility functions for period and fertility calculations

export function calculateCycleInfo(periodDays: string[]) {
  let ovulationDay: Date | null = null;
  let fertileStart: Date | null = null;
  let fertileEnd: Date | null = null;
  let firstDayOfCycle: Date | null = null;
  if (periodDays.length > 0) {
    firstDayOfCycle = new Date(periodDays[0]);
    ovulationDay = new Date(firstDayOfCycle);

    ovulationDay.setDate(ovulationDay.getDate() + 14);
    fertileStart = new Date(ovulationDay);

    fertileStart.setDate(fertileStart.getDate() - 5);
    fertileEnd = new Date(ovulationDay);
  }
  return { periodStart: firstDayOfCycle, ovulationDay, fertileStart, fertileEnd };
}

export function getPeriodDaysThisMonth(periodDays: string[], date: Date) {
  const month = date.getMonth();
  const year = date.getFullYear();
  return periodDays.filter(d => {
    const dObj = new Date(d);
    return dObj.getMonth() === month && dObj.getFullYear() === year;
  });
}

// Predicts the next period days based on the last period start and a fixed cycle length (default 28 days)
export function getPredictedNextPeriodDays(periodDays: string[], periodLength: number = 5, cycleLength: number = 28): Date[] {
  if (!periodDays.length) return [];

  // Find the most recent period start
  const lastPeriodStart = new Date(periodDays[0]);

  // Predict next period start
  const nextPeriodStart = new Date(lastPeriodStart);
  nextPeriodStart.setDate(nextPeriodStart.getDate() + cycleLength);

  // Generate all predicted period days based on the user's period length
  const predicted: Date[] = [];
  for (let i = 0; i < periodLength; i++) {
    const d = new Date(nextPeriodStart);
    d.setDate(d.getDate() + i);
    predicted.push(d);
  }

  return predicted;
}

