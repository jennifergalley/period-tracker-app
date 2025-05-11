import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, TextInput, Modal, Switch, Pressable, StyleSheet } from 'react-native';
import { useAppState } from '@/components/AppStateContext';
import { useTheme } from '@/components/Theme';
import * as FileSystem from 'expo-file-system';
import { DEFAULT_SYMPTOMS } from '../../features/symptomUtils';

const EMOJI_OPTIONS = Array.from(new Set([
  '😀','😁','😂','🤣','😊','😍','😎','😢','😭','😡','😱','😴','🤒','🤕','🤢','🤧','🥵','🥶','🥳','😇','🤠','🤡','💩','👻','💤','💢','🤕','💨','😡','😴','🤲','🍽️','📝','💥','🧠','🧴','🍔','🤧','😷','🤒','🤕','😵','🤯','🥴','🥺','😬','😳','😶','😐','😑','😒','🙄','😏','😣','😖','😫','😩','🥱','😤','😠','😡','🤬','😈','👿','💀','☠️','🤡','👹','👺','👻','👽','👾','🤖','😺','😸','😹','😻','😼','😽','🙀','😿','😾','🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐽','🐸','🐵','🙈','🙉','🙊','🐒','🐔','🐧','🐦','🐤','🐣','🐥','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐜','🦟','🦗','🕷️','🦂','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🦍','🦧','🐘','🦛','🦏','🐪','🐫','🦒','🦘','🦥','🦦','🦨','🦡','🐁','🐀','🐇','🐿️','🦔'
]));

export default function SettingsScreen () {
  const appState = useAppState();
  const { weightUnit, setWeightUnit, setWeightLogs, 
    setPeriodDays, setSymptomLogs, setAllSymptoms, 
    autoAddPeriodDays, setAutoAddPeriodDays, periodAutoLogLength, 
    setPeriodAutoLogLength, showOvulation, setShowOvulation, 
    showFertileWindow, setShowFertileWindow } = useAppState();
  const { theme, themeName, setThemeName } = useTheme();
  const { accentColor, setAccentColor } = useAppState();
  const [newSymptom, setNewSymptom] = useState('');
  const [newSymptomEmoji, setNewSymptomEmoji] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
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

      {/* --- Weight Unit Selection --- */}
      <Text style={{ color: theme.text, fontSize: 18, marginBottom: 8 }}>Preferred Unit</Text>
      <View style={{ flexDirection: 'row', marginTop: 16 }}>
        <TouchableOpacity style={{ backgroundColor: weightUnit === 'kg' ? theme.accent : theme.card, borderRadius: 8, padding: 12, marginRight: 12 }} onPress={() => setWeightUnit('kg')}>
          <Text style={{ color: weightUnit === 'kg' ? theme.fabText : theme.text, fontWeight: 'bold' }}>kg</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ backgroundColor: weightUnit === 'lbs' ? theme.accent : theme.card, borderRadius: 8, padding: 12 }} onPress={() => setWeightUnit('lbs')}>
          <Text style={{ color: weightUnit === 'lbs' ? theme.fabText : theme.text, fontWeight: 'bold' }}>lbs</Text>
        </TouchableOpacity>
      </View>

      {/* --- Theme Switcher --- */}
      <Text style={{ color: theme.text, fontSize: 18, marginTop: 32, marginBottom: 8 }}>Preferred Theme</Text>
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

      {/* --- Accent Color Picker --- */}
      <Text style={{ color: theme.text, fontSize: 18, marginBottom: 8 }}>Accent Color</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <TextInput
          style={{
            height: 40,
            width: 120,
            borderRadius: 8,
            backgroundColor: theme.inputBg,
            color: theme.inputText,
            borderColor: theme.border,
            borderWidth: 1,
            padding: 8,
            marginRight: 12,
            fontFamily: 'monospace',
            fontSize: 16,
          }}
          value={accentColor}
          onChangeText={setAccentColor}
          placeholder="#4db8ff"
          placeholderTextColor={theme.legendText}
          maxLength={9}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: accentColor, borderWidth: 1, borderColor: theme.border }} />
      </View>

      {/* --- Custom Symptoms Management --- */}
      <Text style={{ color: theme.text, fontSize: 18, marginTop: 32, marginBottom: 8 }}>Add Custom Symptoms</Text>
      <View style={{ width: '90%', marginBottom: 16 }}>

        {/* --- Add Custom Symptom Row --- */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          <TouchableOpacity
            onPress={() => setShowEmojiPicker(true)}
            style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: theme.inputBg, borderColor: theme.border, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}
          >
            <Text style={{ fontSize: 24 }}>{newSymptomEmoji || '😀'}</Text>
          </TouchableOpacity>

          <TextInput
            style={{ flex: 1, height: 48, borderRadius: 8, backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.border, borderWidth: 1, padding: 8, marginRight: 8 }}
            placeholder="Add custom symptom"
            placeholderTextColor={theme.legendText}
            value={newSymptom}
            onChangeText={setNewSymptom}
            onSubmitEditing={() => {
              if (newSymptom.trim()) {
                setAllSymptoms(prev => prev.some(s => s.name === newSymptom.trim())
                  ? prev
                  : [{ name: newSymptom.trim(), icon: newSymptomEmoji.trim() || '📝' }, ...prev]);
                setNewSymptom('');
                setNewSymptomEmoji('');
                setShowSymptomAdded(true);
              }
            }}
          />

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
        </View>

        {/* --- Emoji Picker Modal for Custom Symptom --- */}
        <Modal
          visible={showEmojiPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowEmojiPicker(false)}
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <View style={{ backgroundColor: theme.background, borderRadius: 12, overflow: 'hidden', elevation: 8, width: '90%', maxWidth: 400, height: 380, justifyContent: 'center', alignItems: 'center', padding: 12 }}>
              <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>Pick an emoji</Text>

              <ScrollView contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }} style={{ maxHeight: 260, width: '100%' }}>
                {EMOJI_OPTIONS.map(emoji => (
                  <TouchableOpacity
                    key={emoji}
                    style={{ padding: 8, margin: 2, borderRadius: 8, backgroundColor: newSymptomEmoji === emoji ? theme.accent : 'transparent' }}
                    onPress={() => {
                      setNewSymptomEmoji(emoji);
                      setShowEmojiPicker(false);
                    }}
                  >
                    <Text style={{ fontSize: 28 }}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity
                style={{ marginTop: 8, padding: 10, alignSelf: 'center', backgroundColor: theme.card, borderRadius: 8 }}
                onPress={() => setShowEmojiPicker(false)}
              >
                <Text style={{ color: theme.text, fontWeight: 'bold' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>

      {/* --- Symptom added confirmation --- */}
      {showSymptomAdded && (
        <View style={{ position: 'absolute', top: 60, alignSelf: 'center', backgroundColor: theme.accent, borderRadius: 8, padding: 12, zIndex: 100 }}>
          <Text style={{ color: theme.background, fontWeight: 'bold', fontSize: 16 }}>Symptom added!</Text>
        </View>
      )}

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
          thumbColor={autoAddPeriodDays ? theme.fabText : theme.card}
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
              onPress={() => setPeriodAutoLogLength(l => Math.max(1, l - 1))}
              style={{ backgroundColor: theme.card, borderRadius: 8, padding: 8, marginRight: 8 }}
            >
              <Text style={{ color: theme.text, fontSize: 20 }}>-</Text>
            </Pressable>
            <Text style={{ color: theme.text, fontSize: 18, minWidth: 32, textAlign: 'center' }}>{periodAutoLogLength}</Text>
            <Pressable
              onPress={() => setPeriodAutoLogLength(l => Math.min(14, l + 1))}
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
          thumbColor={showOvulation ? theme.fabText : theme.card}
        />
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, width: '90%' }}>
        <Text style={{ color: theme.text, fontSize: 16, flex: 1 }}>Show Fertile Window</Text>
        <Switch
          value={showFertileWindow}
          onValueChange={setShowFertileWindow}
          trackColor={{ false: theme.border, true: theme.accent }}
          thumbColor={showFertileWindow ? theme.fabText : theme.card}
        />
      </View>

        <TouchableOpacity onPress={() => setShowAppState(s => !s)} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ color: theme.accent, fontWeight: 'bold', fontSize: 16, marginRight: 8 }}>
            {showAppState ? '▼' : '▶'}
          </Text>
          <Text style={{ color: theme.text, fontSize: 15, fontWeight: 'bold'  }}>(DEBUG) {showAppState ? 'Hide' : 'Show'} App State</Text>
        </TouchableOpacity>
        {showAppState && (
          <View style={styles.stateBox}>
            <Text style={styles.stateText} selectable>
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
        <Text style={{ color: theme.background, fontWeight: 'bold', textAlign: 'center' }}>Delete All Logs</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#25292e',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  text: {
    color: '#fff',
    fontSize: 16,
  },
  stateBox: {
    marginTop: 12,
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 12,
    width: '100%',
    maxWidth: 400,
  },
  stateText: {
    color: '#ffd33d',
    fontSize: 13,
    fontFamily: 'monospace',
  },
});