import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/components/Theme';
import { useAppState } from '@/components/AppStateContext';

type DayViewProps = {
  date: Date;
  isPeriod: boolean;
  isFertile: boolean;
  isOvulation: boolean;
  onTogglePeriod: (date: Date) => void;
  symptomList: { name: string; icon: string }[];
  symptoms: string[];
  onToggleSymptom: (date: Date, symptom: string) => void;
  onAddSymptom: (symptom: string, emoji: string) => void;
  onRemoveSymptom: (symptom: string) => void;
  periodDaysThisMonth: string[];
  weightLog?: { value: number; unit: 'kg' | 'lbs' };
  onLogWeight: (value: number, unit: 'kg' | 'lbs') => void;
  weightUnit: 'kg' | 'lbs';
  onToggleWeightUnit: () => void;
}

export default function DayView(props: DayViewProps) {
  const { theme } = useTheme();
  const {
    date, isPeriod, isFertile, isOvulation, onTogglePeriod,
    weightLog, onLogWeight, 
  } = props;
    const {
      weightUnit,
      textLogs, setTextLogs
    } = useAppState();

  const [showSymptoms, setShowSymptoms] = useState(true);
  const [weightInput, setWeightInput] = useState(weightLog ? String(weightLog.value) : '');
  const [showWeight, setShowWeight] = useState(true);
  const weightInputRef = useRef<TextInput>(null);
  const [showToast, setShowToast] = useState(false);

  // Text log state for this day
  const dStr = date.toDateString();
  const [textLog, setTextLog] = useState(textLogs[dStr] || '');

  // Update input if user switches days
  React.useEffect(() => {
    setWeightInput(weightLog ? String(weightLog.value) : '');
  }, [weightLog]);

  // Update textLog state if user switches days
  React.useEffect(() => {
    setTextLog(textLogs[dStr] || '');
  }, [dStr]);

  // Save text log to context on unmount (modal close)
  React.useEffect(() => {
    return () => {
      setTextLogs(prev => {
        if (textLog.trim() === '') {
          // Remove empty logs
          const { [dStr]: _, ...rest } = prev;
          return rest;
        }
        return { ...prev, [dStr]: textLog };
      });
    };
  }, [textLog, dStr, setTextLogs]);

  // Add haptic feedback for long-press delete
  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // Save all data handler
  const handleSave = () => {
    // Close the keyboard
    Keyboard.dismiss();

    // Save weight
    const val = parseFloat(weightInput);
    if (!isNaN(val)) {
      onLogWeight(val, weightUnit);
    }
    // Save notes
    setTextLogs(prev => {
      if (textLog.trim() === '') {
        const { [dStr]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [dStr]: textLog };
    });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
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
        {isPeriod && <Text style={[styles.period, { color: theme.period }]}>Period Day</Text>}
        {isFertile && <Text style={[styles.fertile, { color: theme.fertile }]}>Fertile Window</Text>}
        {isOvulation && <Text style={[styles.ovulation, { color: theme.ovulation }]}>Ovulation Day</Text>}

        {/* --- Log Period Button --- */}
        <TouchableOpacity
          style={[styles.weightSaveBtn, { backgroundColor: theme.accent }]}
          onPress={() => onTogglePeriod(date)}
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
            {props.symptomList.map(symptom => (
              <TouchableOpacity
                key={symptom.name}
                style={[styles.symptomRow, { backgroundColor: theme.card, borderColor: theme.border }, 
                  props.symptoms.includes(symptom.name) && { backgroundColor: theme.accent, borderColor: theme.accent }]}
                onPress={() => props.onToggleSymptom(date, symptom.name)}
                onLongPress={() => {
                  triggerHaptic();
                  Alert.alert(
                    'Remove Symptom',
                    `Remove "${symptom.name}" from your symptom list? This will also remove it from any day it was logged.`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Remove', style: 'destructive', onPress: () => props.onRemoveSymptom(symptom.name) },
                    ]
                  );
                }}
              >
                <Text style={styles.symptomEmoji}>{symptom.icon || '📝'}</Text>
                <Text style={[styles.symptomTextVertical, { color: theme.text }, props.symptoms.includes(symptom.name) && { color: theme.fabText }]}>{symptom.name}</Text>
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
              ref={weightInputRef}
              style={[styles.weightInput, { width: 100, backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.border }]}
              placeholder={weightUnit}
              placeholderTextColor={theme.legendText}
              value={weightInput}
              onChangeText={setWeightInput}
              keyboardType="numeric"
              inputMode="decimal"
              textAlign="center"
              onBlur={() => {
                const val = parseFloat(weightInput);
                if (!isNaN(val)) {
                  onLogWeight(val, weightUnit);
                }
              }}
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
          onChangeText={setTextLog}
          placeholder="Write anything about today..."
          placeholderTextColor={theme.legendText}
          textAlignVertical="top"
          returnKeyType="done"
        />
      </ScrollView>
      {/* --- Save Button at Bottom --- */}
      <TouchableOpacity
        style={{ margin: 24, backgroundColor: theme.accent, borderRadius: 10, paddingVertical: 16, alignItems: 'center' }}
        onPress={handleSave}
        accessibilityLabel="Save entry"
      >
        <Text style={{ color: theme.background, fontWeight: 'bold', fontSize: 18 }}>Save</Text>
      </TouchableOpacity>
      {showToast && (
        <View style={{
          position: 'absolute',
          bottom: 40,
          alignSelf: 'center',
          backgroundColor: theme.accent,
          borderRadius: 8,
          paddingVertical: 10,
          paddingHorizontal: 24,
          zIndex: 100,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 6,
        }}>
          <Text style={{ color: theme.background, fontWeight: 'bold', fontSize: 16 }}>Entry saved!</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 24, alignItems: 'center' },
  date: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
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
