import React from 'react';
import { StyleSheet, View } from 'react-native';
import DayView from './DayView';
import { useAppState } from './AppStateContext';
import { calculateCycleInfo, getPeriodDaysThisMonth } from '../features/period/cycleUtils';
import { useTheme } from './Theme';
import { startOfDay } from 'date-fns';

const Home: React.FC = () => {
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
  const { ovulationDay, fertileStart, fertileEnd, periodStart } = calculateCycleInfo(periodDays);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      {/* --- Day View for Today (Main Home UI) --- */}
      <DayView
        date={today}
        isPeriod={periodDays.includes(today.toDateString())}
        isFertile={!!(fertileStart && fertileEnd && today >= fertileStart && today <= fertileEnd)}
        isOvulation={!!(ovulationDay && today.toDateString() === ovulationDay.toDateString())}
        onTogglePeriod={date => {
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
        }}
        symptoms={symptomLogs[today.toDateString()] || []}
        onToggleSymptom={(date, symptomName) => {
          const dStr = date.toDateString();
          setSymptomLogs(prev => {
            const current = prev[dStr] || [];
            if (current.includes(symptomName)) {
              return { ...prev, [dStr]: current.filter(s => s !== symptomName) };
            } else {
              return { ...prev, [dStr]: [...current, symptomName] };
            }
          });
        }}
        symptomList={allSymptoms}
        onAddSymptom={(symptomName, emoji) => {
          setAllSymptoms(prev => prev.some(s => s.name === symptomName)
            ? prev
            : [...prev, { name: symptomName, icon: emoji }]);
        }}
        onRemoveSymptom={symptomName => {
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
        }}
        periodDaysThisMonth={getPeriodDaysThisMonth(periodDays, today)}
        weightLog={weightLogs[today.toDateString()]}
        onLogWeight={(value, unit) => {
          setWeightLogs(prev => ({ ...prev, [today.toDateString()]: { value, unit } }));
        }}
        weightUnit={weightUnit}
        onToggleWeightUnit={() => setWeightUnit(weightUnit === 'kg' ? 'lbs' : 'kg')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default Home;
