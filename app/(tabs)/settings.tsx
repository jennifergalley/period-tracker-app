import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, TextInput, Modal, Switch, Pressable, StyleSheet, Platform } from 'react-native';
import { useAppState } from '@/components/AppStateContext';
import { useTheme } from '@/components/Theme';
import * as FileSystem from 'expo-file-system';
import { DEFAULT_SYMPTOMS } from '@/features/SymptomUtils';
import { DateRangeList } from '@/features/DateRangeList';
import { CommonStyles } from '@/components/CommonStyles';

export default function SettingsScreen () {
  const appState = useAppState();
  const { weightUnit, setWeightUnit, setWeightLogs, 
    setPeriodRanges, setSymptomLogs, setAllSymptoms, 
    autoAddPeriodDays, setAutoAddPeriodDays, 
    typicalPeriodLength, setTypicalPeriodLength, 
    showOvulation, setShowOvulation, 
    showFertileWindow, setShowFertileWindow,
    setTextLogs } = useAppState();
  const { theme, themeName, setThemeName } = useTheme();

  const [showSymptomAdded, setShowSymptomAdded] = useState(false);
  const [showAppState, setShowAppState] = useState(false);

  useEffect(() => {
    if (showSymptomAdded) {
      const timer = setTimeout(() => setShowSymptomAdded(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showSymptomAdded]);

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background }}>      
      <Text style={[CommonStyles.heading, { color: theme.text }]}>Settings</Text>
    
      {/* --- Weight Unit Selection --- */}
      <Text style={{ color: theme.text, fontSize: 18, marginBottom: 8 }}>Weight Unit</Text>
      <View style={{ flexDirection: 'row', marginTop: 16 }}>
        <TouchableOpacity style={{ backgroundColor: weightUnit === 'kg' ? theme.accent : theme.card, borderRadius: 8, padding: 12, marginRight: 12 }} onPress={() => setWeightUnit('kg')}>
          <Text style={{ color: weightUnit === 'kg' ? theme.fabText : theme.text, fontWeight: 'bold' }}>kg</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ backgroundColor: weightUnit === 'lbs' ? theme.accent : theme.card, borderRadius: 8, padding: 12 }} onPress={() => setWeightUnit('lbs')}>
          <Text style={{ color: weightUnit === 'lbs' ? theme.fabText : theme.text, fontWeight: 'bold' }}>lbs</Text>
        </TouchableOpacity>
      </View>

      {/* --- Theme Switcher --- */}
      <Text style={{ color: theme.text, fontSize: 18, marginTop: 32, marginBottom: 8 }}>App Theme</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16, justifyContent: 'center' }}>
        <TouchableOpacity
          style={{ backgroundColor: themeName === 'dark' ? theme.accent : theme.card, borderRadius: 8, padding: 12, margin: 6 }}
          onPress={() => setThemeName('dark')}
        >
          <Text style={{ color: themeName === 'dark' ? theme.fabText : theme.text, fontWeight: 'bold' }}>Dark</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ backgroundColor: themeName === 'light' ? theme.accent : theme.card, borderRadius: 8, padding: 12, margin: 6 }}
          onPress={() => setThemeName('light')}
        >
          <Text style={{ color: themeName === 'light' ? theme.fabText : theme.text, fontWeight: 'bold' }}>Light</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ backgroundColor: themeName === 'blue' ? '#1976d2' : theme.card, borderRadius: 8, padding: 12, margin: 6 }}
          onPress={() => setThemeName('blue')}
        >
          <Text style={{ color: themeName === 'blue' ? '#fff' : theme.text, fontWeight: 'bold' }}>Blue</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ backgroundColor: themeName === 'pink' ? '#e91e63' : theme.card, borderRadius: 8, padding: 12, margin: 6 }}
          onPress={() => setThemeName('pink')}
        >
          <Text style={{ color: themeName === 'pink' ? '#fff' : theme.text, fontWeight: 'bold' }}>Pink</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ backgroundColor: themeName === 'mint' ? '#2ec4b6' : theme.card, borderRadius: 8, padding: 12, margin: 6 }}
          onPress={() => setThemeName('mint')}
        >
          <Text style={{ color: themeName === 'mint' ? '#fff' : theme.text, fontWeight: 'bold' }}>Mint</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ backgroundColor: themeName === 'purple' ? '#8f5cff' : theme.card, borderRadius: 8, padding: 12, margin: 6 }}
          onPress={() => setThemeName('purple')}
        >
          <Text style={{ color: themeName === 'purple' ? '#fff' : theme.text, fontWeight: 'bold' }}>Purple</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ backgroundColor: themeName === 'sunny' ? '#ffb300' : theme.card, borderRadius: 8, padding: 12, margin: 6 }}
          onPress={() => setThemeName('sunny')}
        >
          <Text style={{ color: themeName === 'sunny' ? '#fff' : theme.text, fontWeight: 'bold' }}>Sunny</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ backgroundColor: themeName === 'red' ? '#ff1744' : theme.card, borderRadius: 8, padding: 12, margin: 6 }}
          onPress={() => setThemeName('red')}
        >
          <Text style={{ color: themeName === 'red' ? '#fff' : theme.text, fontWeight: 'bold' }}>Red</Text>
        </TouchableOpacity>
      </View>

      {/* --- Period Logging Preference --- */}
      <Text style={{ color: theme.text, fontSize: 18, marginTop: 32, marginBottom: 8 }}>Period Logging</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, width: '90%' }}>
        <Text style={{ color: theme.text, fontSize: 16, flex: 1 }}>
          Auto-add all period days after logging the first day
        </Text>
        <Switch
          value={autoAddPeriodDays}
          onValueChange={setAutoAddPeriodDays}
          trackColor={{ false: theme.border, true: theme.accent }}
          thumbColor={autoAddPeriodDays ? theme.accent : theme.card}
        />
      </View>

      {/* --- Period Auto-Log Length Picker --- */}
      {autoAddPeriodDays && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, width: '90%' }}>
          <Text style={{ color: theme.text, fontSize: 16, flex: 1 }}>
            Typical period length (days):
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Pressable
              onPress={() => setTypicalPeriodLength(l => Math.max(1, l - 1))}
              style={{ backgroundColor: theme.card, borderRadius: 8, padding: 8, marginRight: 8 }}
            >
              <Text style={{ color: theme.text, fontSize: 20 }}>-</Text>
            </Pressable>
            <Text style={{ color: theme.text, fontSize: 18, minWidth: 32, textAlign: 'center' }}>{typicalPeriodLength}</Text>
            <Pressable
              onPress={() => setTypicalPeriodLength(l => Math.min(14, l + 1))}
              style={{ backgroundColor: theme.card, borderRadius: 8, padding: 8, marginLeft: 8 }}
            >
              <Text style={{ color: theme.text, fontSize: 20 }}>+</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* --- Ovulation and Fertile Window Toggles --- */}
      <Text style={{ color: theme.text, fontSize: 18, marginTop: 32, marginBottom: 8 }}>Calendar Settings</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, width: '90%' }}>
        <Text style={{ color: theme.text, fontSize: 16, flex: 1 }}>Show Ovulation Day</Text>
        <Switch
          value={showOvulation}
          onValueChange={setShowOvulation}
          trackColor={{ false: theme.border, true: theme.accent }}
          thumbColor={showOvulation ? theme.accent : theme.card}
        />
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, width: '90%' }}>
        <Text style={{ color: theme.text, fontSize: 16, flex: 1 }}>Show Fertile Window</Text>
        <Switch
          value={showFertileWindow}
          onValueChange={setShowFertileWindow}
          trackColor={{ false: theme.border, true: theme.accent }}
          thumbColor={showFertileWindow ? theme.accent : theme.card}
        />
      </View>

      {/* --- Log Type Visibility Toggles --- */}
      <Text style={{ color: theme.text, fontSize: 18, marginTop: 32, marginBottom: 8 }}>Show Log Types</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, width: '90%' }}>
        <Text style={{ color: theme.text, fontSize: 16, marginBottom: 8 }}>
          This won't delete existing logs, but will hide these inputs on the log entry page.
        </Text>
      </View>
      <View style={{ width: '90%', marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ color: theme.text, fontSize: 16, flex: 1 }}>Symptoms</Text>
          <Switch
            value={appState.showSymptomsLog}
            onValueChange={appState.setShowSymptomsLog}
            trackColor={{ false: theme.border, true: theme.accent }}
            thumbColor={appState.showSymptomsLog ? theme.accent : theme.card}
          />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ color: theme.text, fontSize: 16, flex: 1 }}>Weight</Text>
          <Switch
            value={appState.showWeightLog}
            onValueChange={appState.setShowWeightLog}
            trackColor={{ false: theme.border, true: theme.accent }}
            thumbColor={appState.showWeightLog ? theme.accent : theme.card}
          />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ color: theme.text, fontSize: 16, flex: 1 }}>Sex</Text>
          <Switch
            value={appState.showSexLog}
            onValueChange={appState.setShowSexLog}
            trackColor={{ false: theme.border, true: theme.accent }}
            thumbColor={appState.showSexLog ? theme.accent : theme.card}
          />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ color: theme.text, fontSize: 16, flex: 1 }}>Mood & Mental Health</Text>
          <Switch
            value={appState.showMoodLog}
            onValueChange={appState.setShowMoodLog}
            trackColor={{ false: theme.border, true: theme.accent }}
            thumbColor={appState.showMoodLog ? theme.accent : theme.card}
          />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ color: theme.text, fontSize: 16, flex: 1 }}>Notes</Text>
          <Switch
            value={appState.showNotesLog}
            onValueChange={appState.setShowNotesLog}
            trackColor={{ false: theme.border, true: theme.accent }}
            thumbColor={appState.showNotesLog ? theme.accent : theme.card}
          />
        </View>
      </View>

      {/* --- Show App Storage --- */}
        <TouchableOpacity onPress={() => setShowAppState(s => !s)} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ color: theme.accent, fontWeight: 'bold', fontSize: 16, marginRight: 8 }}>
            {showAppState ? '▼' : '▶'}
          </Text>
          <Text style={{ color: theme.text, fontSize: 15, fontWeight: 'bold'  }}>{showAppState ? 'Hide' : 'Show'} App Storage</Text>
        </TouchableOpacity>
        {showAppState && (
          <View style={[styles.stateBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.stateText, { color: theme.text }]} selectable>
              {JSON.stringify(appState, (key, value) => {
                if (typeof value === 'function') return undefined;
                return value;
              }, 2)}
            </Text>
          </View>
        )}

      {/* --- Delete All Data Button --- */}
      <TouchableOpacity
        style={{ marginTop: 32, backgroundColor: theme.error, borderRadius: 8, padding: 14, alignSelf: 'stretch', marginHorizontal: 24 }}
        onPress={async () => {
          if (Platform.OS === 'web') {
            const confirmed = window.confirm('Are you sure you want to delete all your logged data? This action is NOT reversible.');
            if (!confirmed) return;
            setWeightLogs({});
            setWeightUnit('lbs');
            setPeriodRanges(new DateRangeList());
            setSymptomLogs({});
            setAllSymptoms(DEFAULT_SYMPTOMS);
            setPeriodRanges(new DateRangeList());
            setAutoAddPeriodDays(true);
            setTypicalPeriodLength(5);
            setShowOvulation(true);
            setShowFertileWindow(true);
            setTextLogs({});
          } else {
            Alert.alert(
              'Delete All Logs',
              'Are you sure you want to delete all your logged data? This action is NOT reversible.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete', style: 'destructive', onPress: async () => {
                    try {
                      await FileSystem.deleteAsync(FileSystem.documentDirectory + 'appState.json', { idempotent: true });
                    } catch {}
                    setWeightLogs({});
                    setWeightUnit('lbs');
                    setPeriodRanges(new DateRangeList());
                    setSymptomLogs({});
                    setAllSymptoms(DEFAULT_SYMPTOMS);
                    setPeriodRanges(new DateRangeList());
                    setAutoAddPeriodDays(true);
                    setTypicalPeriodLength(5);
                    setShowOvulation(true);
                    setShowFertileWindow(true);
                    setTextLogs({});
                  }
                }
              ]
            );
          }
        }}
      >
        <Text style={{ color: theme.background, fontWeight: 'bold', textAlign: 'center' }}>Delete All Logs</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  text: {
    color: '#fff', // To be replaced with theme.text
    fontSize: 16,
  },
  stateBox: {
    marginTop: 12,
    borderRadius: 8,
    padding: 12,
    width: '100%',
    maxWidth: 400,
  },
  stateText: {
    color: '#fff', // To be replaced with theme.text
    fontSize: 13,
    fontFamily: 'monospace',
  },
});