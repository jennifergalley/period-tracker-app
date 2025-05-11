// Utility functions for weight log management

function isAfter(date: Date, compareDate: Date) {
  return date.getTime() > compareDate.getTime();
}

function isBefore(date: Date, compareDate: Date) {
  return date.getTime() < compareDate.getTime();
}

export function filterAndSortWeightLogs(weightLogs: any, startDate: Date, endDate: Date) {
  return Object.entries(weightLogs)
    .map(([date, entry]: any) => ({
      date: new Date(date),
      value: entry.value,
      unit: entry.unit || 'kg',
    }))
    .filter(entry => !isBefore(entry.date, startDate) && !isAfter(entry.date, endDate))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function prepareWeightChartData(logEntries: any[]) {
  return {
    labels: logEntries.map(e => `${e.date.getMonth() + 1}/${e.date.getDate()}`),
    datasets: [
      {
        data: logEntries.map(e => e.value),
        color: (opacity = 1) => `rgba(77, 184, 255, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };
}

export function addOrUpdateWeightLog(prevLogs: any, logDate: Date, value: number, unit: string, originalLogDate: Date | null) {
  const logs = { ...prevLogs };
  const dateKey = logDate.toDateString();
  if (originalLogDate && originalLogDate.toDateString() !== dateKey) {
    // Remove old entry if editing date
    delete logs[originalLogDate.toDateString()];
  }
  logs[dateKey] = { value, unit };
  return logs;
}

export function deleteWeightLog(prevLogs: any, logDate: Date) {
  const logs = { ...prevLogs };
  delete logs[logDate.toDateString()];
  return logs;
}
