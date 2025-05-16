import React from 'react';
import { StyleSheet, View } from 'react-native';
import DayView from '@/components/DayView';
import { useAppState } from '@/components/AppStateContext';
import { useTheme } from '@/components/Theme';
import { startOfDay, toDateKey } from '@/features/dateUtils';
import {
  handleTogglePeriod,
  handleToggleSymptom,
  handleAddSymptom,
  handleRemoveSymptom,
} from '@/features/Handlers';

export default function HomeScreen() {
  const { theme } = useTheme();
  const {
    weightLogs, setWeightLogs,
    weightUnit,
    periodRanges, setPeriodRanges,
    symptomLogs, setSymptomLogs,
    allSymptoms, setAllSymptoms,
    autoAddPeriodDays, typicalPeriodLength: periodAutoLogLength,
    predictedOvulationDay, predictedFertileWindow,
  } = useAppState();
  
  const today = startOfDay(new Date());

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      {/* --- Day View for Today (Main Home UI) --- */}
      <DayView
        date={today}
        isPeriod={periodRanges.containsDate(today)}
        isFertile={!!(predictedFertileWindow.containsDate(today))}
        isOvulation={!!(predictedOvulationDay && toDateKey(predictedOvulationDay) === toDateKey(today))}
        onTogglePeriod={(date: Date) => {
          handleTogglePeriod(date, periodRanges, setPeriodRanges, autoAddPeriodDays, periodAutoLogLength);
        }}
        symptoms={symptomLogs[toDateKey(today)] || []}
        onToggleSymptom={(date, symptomName) => handleToggleSymptom(date, symptomName, setSymptomLogs)}
        symptomList={allSymptoms}
        onAddSymptom={(symptomName, emoji) => handleAddSymptom(symptomName, emoji, setAllSymptoms)}
        onRemoveSymptom={symptomName => handleRemoveSymptom(symptomName, setAllSymptoms, setSymptomLogs)}
        weightLog={weightLogs[toDateKey(today)]}
        onLogWeight={(value: number, unit: 'kg' | 'lbs') => {
          setWeightLogs(prev => ({ ...prev, [toDateKey(today)]: { value, unit } }));
        }}
        weightUnit={weightUnit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});
