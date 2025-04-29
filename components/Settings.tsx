import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useAppState } from './AppStateContext';
import { useTheme } from './theme';
import * as FileSystem from 'expo-file-system';
import { DEFAULT_SYMPTOMS } from '../features/symptoms/symptomUtils';

const Settings: React.FC = () => {
  const { weightUnit, setWeightUnit, setWeightLogs, setPeriodDays, setSymptomLogs, setAllSymptoms } = useAppState();
  const { theme, themeName, setThemeName } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.background, alignItems: 'center', justifyContent: 'center' }}>
      {/* --- Settings Header --- */}
      <Text style={{ color: theme.text, fontSize: 22, fontWeight: 'bold', marginBottom: 16 }}>Settings</Text>
      {/* --- Weight Unit Selection --- */}
      <Text style={{ color: theme.text, fontSize: 18, marginBottom: 8 }}>Preferred Weight Unit</Text>
      <View style={{ flexDirection: 'row', marginTop: 16 }}>
        <TouchableOpacity style={{ backgroundColor: weightUnit === 'kg' ? theme.accent : theme.card, borderRadius: 8, padding: 12, marginRight: 12 }} onPress={() => setWeightUnit('kg')}>
          <Text style={{ color: weightUnit === 'kg' ? theme.fabText : theme.text, fontWeight: 'bold' }}>kg</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ backgroundColor: weightUnit === 'lbs' ? theme.accent : theme.card, borderRadius: 8, padding: 12 }} onPress={() => setWeightUnit('lbs')}>
          <Text style={{ color: weightUnit === 'lbs' ? theme.fabText : theme.text, fontWeight: 'bold' }}>lbs</Text>
        </TouchableOpacity>
      </View>
      {/* --- Theme Switcher --- */}
      <Text style={{ color: theme.text, fontSize: 18, marginTop: 32, marginBottom: 8 }}>Theme</Text>
      <View style={{ flexDirection: 'row', marginBottom: 16 }}>
        <TouchableOpacity
          style={{ backgroundColor: themeName === 'dark' ? theme.accent : theme.card, borderRadius: 8, padding: 12, marginRight: 12 }}
          onPress={() => setThemeName('dark')}
        >
          <Text style={{ color: themeName === 'dark' ? theme.fabText : theme.text, fontWeight: 'bold' }}>Dark</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ backgroundColor: themeName === 'light' ? theme.accent : theme.card, borderRadius: 8, padding: 12 }}
          onPress={() => setThemeName('light')}
        >
          <Text style={{ color: themeName === 'light' ? theme.fabText : theme.text, fontWeight: 'bold' }}>Light</Text>
        </TouchableOpacity>
      </View>
      {/* --- Delete All Data Button --- */}
      <TouchableOpacity
        style={{ marginTop: 32, backgroundColor: theme.error, borderRadius: 8, padding: 14, alignSelf: 'stretch', marginHorizontal: 24 }}
        onPress={async () => {
          Alert.alert(
            'Delete All App Data',
            'Are you sure you want to delete all app data? This action is NOT reversible.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete', style: 'destructive', onPress: async () => {
                  try {
                    await FileSystem.deleteAsync(FileSystem.documentDirectory + 'appState.json', { idempotent: true });
                  } catch {}
                  // Optionally, reset state in context (forces UI update)
                  setWeightLogs({});
                  setWeightUnit('lbs');
                  setPeriodDays([]);
                  setSymptomLogs({});
                  setAllSymptoms(DEFAULT_SYMPTOMS);
                }
              }
            ]
          );
        }}
      >
        <Text style={{ color: theme.background, fontWeight: 'bold', textAlign: 'center' }}>Delete All App Data</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Settings;
