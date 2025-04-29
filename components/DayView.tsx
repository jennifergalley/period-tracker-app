import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Keyboard } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from './theme';

interface DayViewProps {
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

const EMOJI_OPTIONS = Array.from(new Set([
  '😀','😁','😂','🤣','😊','😍','😎','😢','😭','😡','😱','😴','🤒','🤕','🤢','🤧','🥵','🥶','🥳','😇','🤠','🤡','💩','👻','💤','💢','🤕','💨','😡','😴','🤲','🍽️','📝','💥','🧠','🧴','🍔','🤧','😷','🤒','🤕','😵','🤯','🥴','🥺','😬','😳','😶','😐','😑','😒','🙄','😏','😣','😖','😫','😩','🥱','😤','😠','😡','🤬','😈','👿','💀','☠️','🤡','👹','👺','👻','👽','👾','🤖','😺','😸','😹','😻','😼','😽','🙀','😿','😾','🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐽','🐸','🐵','🙈','🙉','🙊','🐒','🐔','🐧','🐦','🐤','🐣','🐥','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐜','🦟','🦗','🕷️','🦂','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🦍','🦧','🐘','🦛','🦏','🐪','🐫','🦒','🦘','🦥','🦦','🦨','🦡','🐁','🐀','🐇','🐿️','🦔'
]));

const DayView: React.FC<DayViewProps> = ({ symptomList, symptoms, ...props }) => {
  const { theme } = useTheme();
  const {
    date, isPeriod, isFertile, isOvulation, onTogglePeriod,
    onAddSymptom, onRemoveSymptom, periodDaysThisMonth,
    weightLog, onLogWeight, weightUnit, onToggleWeightUnit
  } = props;

  const [newSymptom, setNewSymptom] = useState('');
  const [newSymptomEmoji, setNewSymptomEmoji] = useState('');
  const [showSymptoms, setShowSymptoms] = useState(false);
  const [weightInput, setWeightInput] = useState(weightLog ? String(weightLog.value) : '');
  const [showWeight, setShowWeight] = useState(false);
  const weightInputRef = useRef<TextInput>(null);
  const addSymptomInputRef = useRef<TextInput>(null);

  // Update input if user switches days
  React.useEffect(() => {
    setWeightInput(weightLog ? String(weightLog.value) : '');
  }, [weightLog]);

  // Add haptic feedback for long-press delete
  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <>
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
              : periodDaysThisMonth.length === 0
                ? 'Log first day of period'
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
            {symptomList.map(symptom => (
              <TouchableOpacity
                key={symptom.name}
                style={[styles.symptomRow, { backgroundColor: theme.card, borderColor: theme.border }, symptoms.includes(symptom.name) && { backgroundColor: theme.accent, borderColor: theme.accent }]}
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
                <Text style={[styles.symptomTextVertical, { color: theme.text }, symptoms.includes(symptom.name) && { color: theme.fabText }]}>{symptom.name}</Text>
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
              textAlign="center"
            />
            <TouchableOpacity
              style={[styles.weightSaveBtn, { backgroundColor: theme.accent }]}
              onPress={() => {
                const val = parseFloat(weightInput);
                if (!isNaN(val)) {
                  weightInputRef.current?.blur();
                  onLogWeight(val, weightUnit);
                  Keyboard.dismiss();
                }
              }}
            >
              <Text style={[styles.weightSaveBtnText, { color: theme.background }]}>Save</Text>
            </TouchableOpacity>
          </View>
        )}
        {showWeight && weightLog && (
          <Text style={[styles.weightLoggedText, { color: theme.text }]}>Logged: {weightLog.value} {weightLog.unit}</Text>
        )}
      </ScrollView>
    </>
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
});

export default DayView;
