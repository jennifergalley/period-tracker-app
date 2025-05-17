import React, { useState, useRef, useEffect } from 'react';
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
  
  // State for editing a symptom
  const [editingSymptom, setEditingSymptom] = useState<{ name: string; icon: string } | null>(null);
  const [editSymptomName, setEditSymptomName] = useState('');
  const [editSymptomIcon, setEditSymptomIcon] = useState('');

  const [newSymptom, setNewSymptom] = useState('');
  const [newSymptomEmoji, setNewSymptomEmoji] = useState('');
  const [showSymptomAdded, setShowSymptomAdded] = useState(false);
  const [showAppState, setShowAppState] = useState(false);

  useEffect(() => {
    if (showSymptomAdded) {
      const timer = setTimeout(() => setShowSymptomAdded(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showSymptomAdded]);
  
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

  useEffect(() => {
    if (editingSymptom) {
      setNewSymptom(editingSymptom.name);
      setNewSymptomEmoji(editingSymptom.icon);
    }
  }, [editingSymptom]);

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
        {cycleDay > 0 && (
          <Text style={[styles.cycleDay, { color: theme.text, marginBottom: 4 }]}>Cycle Day: {cycleDay}</Text>
        )}
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
                  symptomLog.includes(symptom.name) && { backgroundColor: theme.accent, borderColor: theme.accent }]
                }
                onPress={() => handleToggleSymptom(date, symptom.name, setSymptomLogs)}
                onLongPress={() => {
                  triggerHaptic();
                  Alert.alert(
                    'Symptom Options',
                    `Edit or remove "${symptom.name}"?`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Edit', onPress: () => {
                        setEditingSymptom({ name: symptom.name, icon: symptom.icon });
                        setEditSymptomName(symptom.name);
                        setEditSymptomIcon(symptom.icon);
                      } },
                      { text: 'Remove', style: 'destructive', onPress: () => handleRemoveSymptom(symptom.name, setAllSymptoms, setSymptomLogs) },
                    ]
                  );
                }}
              >
                <Text style={styles.symptomEmoji}>{symptom.icon || '📝'}</Text>
                <Text style={[styles.symptomTextVertical, { color: theme.text }, symptomLog.includes(symptom.name) && { color: theme.fabText }]}>{symptom.name}</Text>
              </TouchableOpacity>
            ))}

            {/* --- Add/Edit Custom Symptom Row --- */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
              <TextInput
                style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: theme.inputBg, borderColor: theme.border, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginRight: 8, fontSize: 20, textAlign: 'center', color: theme.inputText }}
                placeholder="😀"
                placeholderTextColor={theme.legendText}
                value={newSymptomEmoji}
                onChangeText={text => setNewSymptomEmoji(text.slice(0, 2))}
                maxLength={2}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TextInput
                style={{ flex: 1, height: 48, borderRadius: 8, backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.border, borderWidth: 1, padding: 8, marginRight: 8 }}
                placeholder="Add custom symptom"
                placeholderTextColor={theme.legendText}
                value={newSymptom}
                onChangeText={setNewSymptom}
                onSubmitEditing={() => {
                  if (editingSymptom) {
                    // Save edit
                    const trimmedName = newSymptom.trim();
                    const trimmedIcon = newSymptomEmoji.trim() || '📝';
                    if (!trimmedName) return;
                    setAllSymptoms(prev => prev.map(s =>
                      s.name === (editingSymptom?.name ?? '') ? { name: trimmedName, icon: trimmedIcon } : s
                    ));
                    setEditingSymptom(null);
                    setNewSymptom('');
                    setNewSymptomEmoji('');
                  } else if (newSymptom.trim()) {
                    setAllSymptoms(prev => prev.some(s => s.name === newSymptom.trim())
                      ? prev
                      : [{ name: newSymptom.trim(), icon: newSymptomEmoji.trim() || '📝' }, ...prev]);
                    setNewSymptom('');
                    setNewSymptomEmoji('');
                    setShowSymptomAdded(true);
                  }
                }}
              />
              {editingSymptom ? (
                <>
                  <TouchableOpacity
                    style={{ backgroundColor: theme.accent, borderRadius: 8, paddingVertical: 12, paddingHorizontal: 16 }}
                    onPress={() => {
                      const trimmedName = newSymptom.trim();
                      const trimmedIcon = newSymptomEmoji.trim() || '📝';
                      if (!trimmedName) return;
                      setAllSymptoms(prev => prev.map(s =>
                        s.name === (editingSymptom?.name ?? '') ? { name: trimmedName, icon: trimmedIcon } : s
                      ));
                      setEditingSymptom(null);
                      setNewSymptom('');
                      setNewSymptomEmoji('');
                    }}
                  >
                    <Text style={{ color: theme.background, fontWeight: 'bold' }}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ backgroundColor: theme.period, borderRadius: 8, paddingVertical: 12, paddingHorizontal: 16, marginLeft: 8 }}
                    onPress={() => {
                      setEditingSymptom(null);
                      setNewSymptom('');
                      setNewSymptomEmoji('');
                    }}
                  >
                    <Text style={{ color: theme.background, fontWeight: 'bold' }}>Cancel</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={{ backgroundColor: theme.accent, borderRadius: 8, paddingVertical: 12, paddingHorizontal: 16 }}
                  onPress={() => {
                    if (newSymptom.trim()) {
                      setAllSymptoms(prev => prev.some(s => s.name === newSymptom.trim())
                        ? prev
                        : [{ name: newSymptom.trim(), icon: newSymptomEmoji.trim() || '📝' }, ...prev]);
                      setNewSymptom('');
                      setNewSymptomEmoji('');
                      setShowSymptomAdded(true);
                    }
                  }}
                >
                  <Text style={{ color: theme.background, fontWeight: 'bold' }}>Add</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* --- Symptom added confirmation --- */}
            {showSymptomAdded && (
              <View style={{ position: 'absolute', top: 60, alignSelf: 'center', backgroundColor: theme.accent, borderRadius: 8, padding: 12, zIndex: 100 }}>
                <Text style={{ color: theme.background, fontWeight: 'bold', fontSize: 16 }}>Symptom added!</Text>
              </View>
            )}
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
