import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity, ScrollView, TextInput, Alert, Keyboard, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useAppState } from './AppStateContext';

interface DayViewProps {
  date: Date;
  isPeriod: boolean;
  isFertile: boolean;
  isOvulation: boolean;
  onTogglePeriod: (date: Date) => void;
  symptomList: { name: string; icon: string }[];
  symptoms: string[];
  onToggleSymptom: (date: Date, symptom: string) => void;
  onAddSymptom: (symptom: string) => void;
  onRemoveSymptom: (symptom: string) => void;
  periodDaysThisMonth: string[];
  weightLog?: { value: number; unit: 'kg' | 'lbs' };
  onLogWeight: (value: number, unit: 'kg' | 'lbs') => void;
  weightUnit: 'kg' | 'lbs';
  onToggleWeightUnit: () => void;
}

const DayView: React.FC<DayViewProps> = ({ symptomList, symptoms, ...props }) => {
  const {
    date, isPeriod, isFertile, isOvulation, onTogglePeriod,
    onAddSymptom, onRemoveSymptom, periodDaysThisMonth,
    weightLog, onLogWeight, weightUnit, onToggleWeightUnit
  } = props;

  const [newSymptom, setNewSymptom] = useState('');
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.date}>{date.toDateString()}</Text>
      {isPeriod && <Text style={styles.period}>Period Day</Text>}
      {isFertile && <Text style={styles.fertile}>Fertile Window</Text>}
      {isOvulation && <Text style={styles.ovulation}>Ovulation Day</Text>}
      <Button
        title={
          isPeriod
            ? 'Remove Period'
            : periodDaysThisMonth.length === 0
              ? 'Log first day of period'
              : 'Log Period'
        }
        onPress={() => onTogglePeriod(date)}
      />
      <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'space-between' }} onPress={() => setShowSymptoms(s => !s)}>
        <Text style={styles.symptomHeader}>Log Symptoms</Text>
        <Text style={{ color: '#4db8ff', fontSize: 18 }}>{showSymptoms ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {showSymptoms && (
        <View style={styles.symptomListVertical}>
          {symptomList.map(symptom => (
            <TouchableOpacity
              key={symptom.name}
              style={[styles.symptomRow, symptoms.includes(symptom.name) && styles.symptomRowSelected]}
              onPress={() => props.onToggleSymptom(date, symptom.name)}
              onLongPress={() => {
                triggerHaptic();
                Alert.alert(
                  'Remove Symptom',
                  `Remove "${symptom.name}" from your checklist? This will also remove it from any day it was logged.`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Remove', style: 'destructive', onPress: () => props.onRemoveSymptom(symptom.name) },
                  ]
                );
              }}
            >
              <Text style={styles.symptomEmoji}>{symptom.icon || '📝'}</Text>
              <Text style={[styles.symptomTextVertical, symptoms.includes(symptom.name) && styles.symptomTextSelected]}>{symptom.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {showSymptoms && (
        <View style={styles.addSymptomRow}>
          <TextInput
            ref={addSymptomInputRef}
            style={styles.addSymptomInput}
            placeholder="Add symptom"
            placeholderTextColor="#888"
            value={newSymptom}
            onChangeText={setNewSymptom}
            onSubmitEditing={() => {
              if (newSymptom.trim()) {
                addSymptomInputRef.current?.blur();
                onAddSymptom(newSymptom.trim());
                setNewSymptom('');
                Keyboard.dismiss();
              }
            }}
          />
          <TouchableOpacity
            style={styles.addSymptomBtn}
            onPress={() => {
              if (newSymptom.trim()) {
                addSymptomInputRef.current?.blur();
                onAddSymptom(newSymptom.trim());
                setNewSymptom('');
                Keyboard.dismiss();
              }
            }}
          >
            <Text style={styles.addSymptomBtnText}>Add</Text>
          </TouchableOpacity>
        </View>
      )}
      <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'space-between', marginTop: 18 }} onPress={() => setShowWeight(s => !s)}>
        <Text style={styles.weightHeader}>Log Weight</Text>
        <Text style={{ color: '#ffb6c1', fontSize: 18 }}>{showWeight ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {showWeight && (
        <View style={styles.weightRow}>
          <TextInput
            ref={weightInputRef}
            style={[styles.weightInput, { width: 100 }]}
            placeholder={weightUnit}
            placeholderTextColor="#888"
            value={weightInput}
            onChangeText={setWeightInput}
            keyboardType="numeric"
            textAlign="center"
          />
          <TouchableOpacity
            style={styles.weightSaveBtn}
            onPress={() => {
              const val = parseFloat(weightInput);
              if (!isNaN(val)) {
                weightInputRef.current?.blur();
                onLogWeight(val, weightUnit);
                Keyboard.dismiss();
              }
            }}
          >
            <Text style={styles.weightSaveBtnText}>Save</Text>
          </TouchableOpacity>
        </View>
      )}
      {showWeight && weightLog && (
        <Text style={styles.weightLoggedText}>Logged: {weightLog.value} {weightLog.unit}</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 24, alignItems: 'center' },
  date: { fontSize: 20, fontWeight: 'bold', marginBottom: 12, color: '#fff' },
  period: { color: '#ff5c8a', fontWeight: 'bold', marginBottom: 4, fontSize: 18 },
  fertile: { color: '#4db8ff', fontWeight: 'bold', marginBottom: 4, fontSize: 18 },
  ovulation: { color: '#ffb6c1', fontWeight: 'bold', marginBottom: 4, fontSize: 18 },
  defaultText: { color: '#fff', fontSize: 18 },
  symptomHeader: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginTop: 18, marginBottom: 8 },
  symptomList: { display: 'none' }, // hide old horizontal style
  symptomListVertical: { width: '100%', marginTop: 4 },
  symptomRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, marginVertical: 2, borderRadius: 10, backgroundColor: '#23242a', borderWidth: 1, borderColor: '#444' },
  symptomRowSelected: { backgroundColor: '#4db8ff', borderColor: '#4db8ff' },
  symptomEmoji: { fontSize: 22, marginRight: 12 },
  symptomTextVertical: { color: '#fff', fontSize: 16 },
  symptomTextSelected: { color: '#181a20' },
  addSymptomRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  addSymptomInput: { flex: 1, backgroundColor: '#23242a', color: '#fff', borderRadius: 8, padding: 8, borderWidth: 1, borderColor: '#444', marginRight: 8 },
  addSymptomBtn: { backgroundColor: '#4db8ff', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16 },
  addSymptomBtnText: { color: '#181a20', fontWeight: 'bold', fontSize: 15 },
  weightHeader: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  weightRow: { flexDirection: 'row', alignItems: 'center', marginTop: 18, marginBottom: 4 },
  weightInput: { backgroundColor: '#23242a', color: '#fff', borderRadius: 8, padding: 8, borderWidth: 1, borderColor: '#444', width: 60, marginRight: 8, textAlign: 'center' },
  weightSaveBtn: { backgroundColor: '#ffb6c1', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14 },
  weightSaveBtnText: { color: '#181a20', fontWeight: 'bold', fontSize: 15 },
  weightLoggedText: { color: '#fff', fontSize: 14, marginTop: 2 },
});

export default DayView;
