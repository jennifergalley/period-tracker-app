import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/components/Theme';
import { useAppState } from '@/components/AppStateContext';
import { toDateKey } from '@/features/dateUtils';
import {
  handleTogglePeriod,
  handleToggleSymptom,
  handleRemoveSymptom,
  handleLogWeight,
  handleLogText,
} from '@/features/Handlers';
import { CycleUtils } from '@/features/CycleUtils';

type DayViewProps = {
  date: Date;
  isPeriod: boolean;
  isFertile: boolean;
  isOvulation: boolean;
}

export default function DayView(props: DayViewProps) {
  const { theme } = useTheme();
  const {
    date,
    isPeriod,
    isFertile,
    isOvulation,
  } = props;
  const {
    weightLogs,
    setWeightLogs,
    weightUnit,
    textLogs,
    setTextLogs,
    symptomLogs,
    setSymptomLogs,
    allSymptoms,
    setAllSymptoms,
    periodRanges,
    setPeriodRanges,
    autoAddPeriodDays, 
    typicalPeriodLength,
  } = useAppState();

  const [showSymptoms, setShowSymptoms] = useState(true);
  const [showWeight, setShowWeight] = useState(true);

  // Logs for this day
  const textLog = textLogs[toDateKey(date)] || '';
  const symptomLog = symptomLogs[toDateKey(date)] || [];
  const weightLog = weightLogs[toDateKey(date)];

  // Temporary local state for weight input so we can update it in AppState after the user is done typing
  const [weightInputValue, setWeightInputValue] = useState(weightLog !== undefined ? String(weightLog.value) : '');

  // Compute cycle day
  const cycleDay = CycleUtils.getCycleDay(periodRanges, date);

  // Add haptic feedback for long-press delete
  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      {/* --- Main Day View Scrollable Content --- */}
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
        
        {/* --- Date and Cycle Status --- */}
        <Text style={[styles.date, { color: theme.text }]}>{date.toDateString()}</Text>
        {cycleDay && <Text style={[styles.cycleDay, { color: theme.text, marginBottom: 4 }]}>Cycle Day: {cycleDay > 0 ? cycleDay : ''}</Text>}
        {isPeriod && <Text style={[styles.period, { color: theme.period }]}>Period Day</Text>}
        {isFertile && <Text style={[styles.fertile, { color: theme.fertile }]}>Fertile Window</Text>}
        {isOvulation && <Text style={[styles.ovulation, { color: theme.ovulation }]}>Ovulation Day</Text>}

        {/* --- Log Period Button --- */}
        <TouchableOpacity
          style={[styles.weightSaveBtn, { backgroundColor: theme.accent }]}
          onPress={() => handleTogglePeriod(date, periodRanges, setPeriodRanges, autoAddPeriodDays, typicalPeriodLength)}
        >
          <Text style={[styles.weightSaveBtnText, { color: theme.background }]}> 
            {isPeriod
              ? 'Remove Period'
              : 'Log Period'}
          </Text>
        </TouchableOpacity>

        {/* --- Symptom Logging Section --- */}
        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'space-between' }} onPress={() => setShowSymptoms(s => !s)}>
          <Text style={[styles.symptomHeader, { color: theme.text }]}>Log Symptoms</Text>
          <Text style={{ color: theme.accent, fontSize: 18 }}>{showSymptoms ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {showSymptoms && (
          <View style={styles.symptomListVertical}>
            {allSymptoms.map(symptom => (
              <TouchableOpacity
                key={symptom.name}
                style={[styles.symptomRow, { backgroundColor: theme.card, borderColor: theme.border }, 
                  symptomLog.includes(symptom.name) && { backgroundColor: theme.accent, borderColor: theme.accent }]}
                onPress={() => handleToggleSymptom(date, symptom.name, setSymptomLogs)}
                onLongPress={() => {
                  triggerHaptic();
                  Alert.alert(
                    'Remove Symptom',
                    `Remove "${symptom.name}" from your symptom list? This will also remove it from any day it was logged.`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Remove', style: 'destructive', onPress: () => handleRemoveSymptom(symptom.name, setAllSymptoms, setSymptomLogs) },
                    ]
                  );
                }}
              >
                <Text style={styles.symptomEmoji}>{symptom.icon || '📝'}</Text>
                <Text style={[styles.symptomTextVertical, { color: theme.text }, symptomLog.includes(symptom.name) && { color: theme.fabText }]}>{symptom.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* --- Weight Logging Section --- */}
        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'space-between', marginTop: 18 }} onPress={() => setShowWeight(s => !s)}>
          <Text style={[styles.weightHeader, { color: theme.text }]}>Log Weight</Text>
          <Text style={{ color: theme.period, fontSize: 18 }}>{showWeight ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {showWeight && (
          <View style={styles.weightRow}>
            <TextInput
              style={[styles.weightInput, { width: 100, backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.border }]}
              placeholder={weightUnit}
              placeholderTextColor={theme.legendText}
              value={weightInputValue}
              onChangeText={setWeightInputValue}
              onBlur={() => {
                // Only save when input is valid and not empty
                const trimmed = weightInputValue.trim();
                // Allow empty string to clear the log
                if (trimmed === '') {
                  handleLogWeight(undefined, weightUnit, date, setWeightLogs);
                } else {
                  const val = parseFloat(trimmed);
                  console.log('Parsed weight:', trimmed, "to val:", val);
                  if (!isNaN(val)) {
                    handleLogWeight(val, weightUnit, date, setWeightLogs);
                  }
                }
              }}
              keyboardType="numeric"
              inputMode="decimal"
              textAlign="center"
            />
          </View>
        )}

        {/* --- Text Log Section --- */}
        <Text style={[styles.textLogHeader, { color: theme.text }]}>Notes</Text>
        <TextInput
          style={[styles.textLogInput, { backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.border }]}
          multiline
          numberOfLines={6}
          value={textLog}
          onChangeText={text => handleLogText(date, text, setTextLogs)}
          placeholder="Write anything about today..."
          placeholderTextColor={theme.legendText}
          textAlignVertical="top"
          returnKeyType="done"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 24, alignItems: 'center' },
  date: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  cycleDay: { fontWeight: 'bold', marginBottom: 8, fontSize: 18 },
  period: { fontWeight: 'bold', marginBottom: 4, fontSize: 18 },
  fertile: { fontWeight: 'bold', marginBottom: 4, fontSize: 18 },
  ovulation: { fontWeight: 'bold', marginBottom: 4, fontSize: 18 },
  defaultText: { fontSize: 18 },
  symptomHeader: { fontWeight: 'bold', fontSize: 16, marginTop: 18, marginBottom: 8 },
  symptomList: { display: 'none' }, // hide old horizontal style
  symptomListVertical: { width: '100%', marginTop: 4 },
  symptomRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, marginVertical: 2, borderRadius: 10 },
  symptomEmoji: { fontSize: 22, marginRight: 12 },
  symptomTextVertical: { fontSize: 16 },
  addSymptomRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  addSymptomInput: { flex: 1, borderRadius: 8, padding: 8, marginRight: 8, height: 48 },
  addSymptomBtn: { borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16 },
  addSymptomBtnText: { fontWeight: 'bold', fontSize: 15 },
  weightHeader: { fontWeight: 'bold', fontSize: 16 },
  weightRow: { flexDirection: 'row', alignItems: 'center', marginTop: 18, marginBottom: 4 },
  weightInput: { borderRadius: 8, padding: 8, width: 60, marginRight: 8, textAlign: 'center' },
  weightSaveBtn: { borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14 },
  weightSaveBtnText: { fontWeight: 'bold', fontSize: 15 },
  weightLoggedText: { fontSize: 14, marginTop: 2 },
  textLogHeader: { fontWeight: 'bold', fontSize: 16, marginTop: 24, marginBottom: 8, alignSelf: 'flex-start' },
  textLogInput: { minHeight: 120, width: '100%', borderRadius: 10, borderWidth: 1, padding: 12, fontSize: 16, marginBottom: 8 },
});
