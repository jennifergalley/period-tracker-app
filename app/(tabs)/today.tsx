import React from 'react';
import { StyleSheet, View } from 'react-native';
import DayView from '@/components/DayView';
import { useAppState } from '@/components/AppStateContext';
import { calculateCycleInfo, getPeriodDaysThisMonth } from '@/features/cycleUtils';
import { useTheme } from '@/components/Theme';
import { startOfDay } from '@/features/dateUtils';
import type { WeightUnit } from '@/components/AppStateContext';

export default function HomeScreen() {
  const { theme } = useTheme();
  const {
    weightLogs, setWeightLogs,
    weightUnit, setWeightUnit,
    periodDays, setPeriodDays,
    symptomLogs, setSymptomLogs,
    allSymptoms, setAllSymptoms,
    autoAddPeriodDays,
  } = useAppState();
  
  const today = startOfDay(new Date());

  // Use utility function for cycle info
  const { ovulationDay, fertileStart, fertileEnd } = calculateCycleInfo(periodDays);

  // --- Extracted Handlers ---
  function handleTogglePeriod(date: Date) {
    const dStr = date.toDateString();
    const month = date.getMonth();
    const year = date.getFullYear();
    const periodDaysThisMonth = periodDays.filter(d => {
      const dObj = new Date(d);
      return dObj.getMonth() === month && dObj.getFullYear() === year;
    });
    if (!periodDays.includes(dStr)) {
      if (autoAddPeriodDays && periodDaysThisMonth.length === 0) {
        const newDays = Array.from({ length: 5 }, (_, i) => {
          const newDate = new Date(date);
          newDate.setDate(newDate.getDate() + i);
          return newDate.toDateString();
        });
        setPeriodDays(prev => [...prev, ...newDays]
          .filter((v, i, arr) => arr.indexOf(v) === i)
          .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
        );
      } else {
        setPeriodDays(prev => [...prev, dStr]
          .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
        );
      }
    } else {
      setPeriodDays(prev => prev.filter(d => d !== dStr));
    }
  }

  function handleToggleSymptom(date: Date, symptomName: string) {
    const dStr = date.toDateString();
    setSymptomLogs(prev => {
      const current = prev[dStr] || [];
      if (current.includes(symptomName)) {
        return { ...prev, [dStr]: current.filter(s => s !== symptomName) };
      } else {
        return { ...prev, [dStr]: [...current, symptomName] };
      }
    });
  }

  function handleAddSymptom(symptomName: string, emoji: string) {
    setAllSymptoms(prev => prev.some(s => s.name === symptomName)
      ? prev
      : [...prev, { name: symptomName, icon: emoji }]);
  }

  function handleRemoveSymptom(symptomName: string) {
    setAllSymptoms(prev => prev.filter(s => s.name !== symptomName));
    setSymptomLogs(prev => {
      const updated: { [date: string]: string[] } = {};
      for (const date in prev) {
        const filtered = prev[date].filter(s => s !== symptomName);
        if (filtered.length > 0) {
          updated[date] = filtered;
        }
      }
      return updated;
    });
  }

  function handleLogWeight(value: number, unit: WeightUnit) {
    setWeightLogs(prev => ({ ...prev, [today.toDateString()]: { value, unit } }));
  }

  function handleToggleWeightUnit() {
    setWeightUnit(weightUnit === 'kg' ? 'lbs' : 'kg');
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      {/* --- Day View for Today (Main Home UI) --- */}
      <DayView
        date={today}
        isPeriod={periodDays.includes(today.toDateString())}
        isFertile={!!(fertileStart && fertileEnd && today >= fertileStart && today <= fertileEnd)}
        isOvulation={!!(ovulationDay && today.toDateString() === ovulationDay.toDateString())}
        onTogglePeriod={handleTogglePeriod}
        symptoms={symptomLogs[today.toDateString()] || []}
        onToggleSymptom={handleToggleSymptom}
        symptomList={allSymptoms}
        onAddSymptom={handleAddSymptom}
        onRemoveSymptom={handleRemoveSymptom}
        periodDaysThisMonth={getPeriodDaysThisMonth(periodDays, today)}
        weightLog={weightLogs[today.toDateString()]}
        onLogWeight={handleLogWeight}
        weightUnit={weightUnit}
        onToggleWeightUnit={handleToggleWeightUnit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});
