import { CycleUtils } from '@/features/CycleUtils';
import type { WeightUnit } from '@/components/AppStateContext';
import { DateRangeList } from '@/features/DateRangeList';
import { toDateKey } from '@/features/DateUtils';

// Types for period range and symptom
type PeriodRanges = DateRangeList;
type SetPeriodRanges = React.Dispatch<React.SetStateAction<PeriodRanges>>;
type SetSymptomLogs = React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
type Symptom = { name: string; icon: string };
type SetAllSymptoms = React.Dispatch<React.SetStateAction<Symptom[]>>;
type SetWeightLogs = React.Dispatch<React.SetStateAction<Record<string, { value: number; unit: WeightUnit }>>>;
type SetWeightUnit = React.Dispatch<React.SetStateAction<WeightUnit>>;
type SetTextLogs = React.Dispatch<React.SetStateAction<Record<string, string>>>;
type SetSexLogs = React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
type SetMoodLogs = React.Dispatch<React.SetStateAction<{ [date: string]: { mood: number; anxiety: number; depression: number } }>>;

export function handleTogglePeriod(
  date: Date,
  periodRanges: PeriodRanges,
  setPeriodRanges: SetPeriodRanges,
  autoAddPeriodDays: boolean,
  daysToAutoAdd: number = 4,
  setSelectedDay: (date: Date) => void = () => {},
) {
  CycleUtils.logPeriod(date, periodRanges, setPeriodRanges, autoAddPeriodDays, daysToAutoAdd);
  setSelectedDay(date); // Force a re-render
}

export function handleToggleSymptom(
  date: Date,
  symptomName: string,
  setSymptomLogs: SetSymptomLogs
) {
  const dStr = toDateKey(date);
  setSymptomLogs(prev => {
    const current = prev[dStr] || [];
    if (current.includes(symptomName)) {
      // If the symptom is already logged, remove it
      return { ...prev, [dStr]: current.filter(s => s !== symptomName) };
    } else {
      // If the symptom is not logged, add it
      return { ...prev, [dStr]: [...current, symptomName] };
    }
  });
}

export function handleAddSymptom(
  symptomName: string,
  emoji: string,
  setAllSymptoms: SetAllSymptoms
) {
  setAllSymptoms(prev => prev.some(s => s.name === symptomName)
    ? prev
    : [...prev, { name: symptomName, icon: emoji }]);
}

export function handleRemoveSymptom(
  symptomName: string,
  setAllSymptoms: SetAllSymptoms,
  setSymptomLogs: SetSymptomLogs
) {
  setAllSymptoms(prev => prev.filter(s => s.name !== symptomName));
  setSymptomLogs(prev => {
    const updated: Record<string, string[]> = {};
    for (const date in prev) {
      const filtered = prev[date].filter(s => s !== symptomName);
      if (filtered.length > 0) {
        updated[date] = filtered;
      }
    }
    return updated;
  });
}

// TODO: Can we not store the weight unit in the logs? I think just date: value would suffice
export function handleLogWeight(
  value: number | undefined,
  unit: WeightUnit,
  today: Date,
  setWeightLogs: SetWeightLogs
) {
  if (value === undefined) {
    // Remove the log for today
    setWeightLogs(prev => {
      const { [toDateKey(today)]: _, ...rest } = prev;
      return rest;
    });
    return;
  }

  // Add or update the log for today
  setWeightLogs(prev => ({ ...prev, [toDateKey(today)]: { value, unit } }));
}

export function handleToggleWeightUnit(
  weightUnit: WeightUnit,
  setWeightUnit: SetWeightUnit
) {
  setWeightUnit(weightUnit === 'kg' ? 'lbs' : 'kg');
}

export function handleDayPress(
  date: Date,
  setSelectedDay: (date: Date) => void,
  setDayModalVisible: (visible: boolean) => void
) {
  setSelectedDay(date);
  setDayModalVisible(true);
}

export function handleLogText(
  date: Date,
  text: string,
  setTextLogs: SetTextLogs
) {
  const dStr = toDateKey(date);
  setTextLogs(prev => {
    if (text.trim() === '') {
      // Remove empty logs
      const { [dStr]: _, ...rest } = prev;
      return rest;
    }
    return { ...prev, [dStr]: text };
  });
}

export function handleToggleSexLog(
  date: Date,
  sexType: string,
  setSexLogs: SetSexLogs
) {
  const dStr = toDateKey(date);
  setSexLogs(prev => {
    const current = prev[dStr] || [];
    if (current.includes(sexType)) {
      // If the sex type is already logged, remove it
      return { ...prev, [dStr]: current.filter(s => s !== sexType) };
    } else {
      // If the sex type is not logged, add it
      return { ...prev, [dStr]: [...current, sexType] };
    }
  });
}

// Mood/Anxiety/Depression log handler
export function handleLogMood(
  date: Date,
  field: 'mood' | 'anxiety' | 'depression',
  value: number,
  setMoodLogs: SetMoodLogs
) {
  const dStr = toDateKey(date);
  setMoodLogs(prev => {
    const prevEntry = prev[dStr] || { mood: 0, anxiety: 0, depression: 0 };
    const updated = { ...prevEntry, [field]: value };
    // If all fields are 0, remove the entry
    if (updated.mood === 0 && updated.anxiety === 0 && updated.depression === 0) {
      const { [dStr]: _, ...rest } = prev;
      return rest;
    }
    return { ...prev, [dStr]: updated };
  });
}