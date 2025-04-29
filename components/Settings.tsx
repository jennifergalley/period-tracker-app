import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAppState } from './AppStateContext';
import { useTheme } from './theme';

const Settings: React.FC = () => {
  const { weightUnit, setWeightUnit } = useAppState();
  const { theme, themeName, setThemeName } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.background, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: theme.text, fontSize: 22, fontWeight: 'bold', marginBottom: 16 }}>Settings</Text>
      <Text style={{ color: theme.text, fontSize: 16, marginBottom: 8 }}>Preferred Weight Unit</Text>
      <View style={{ flexDirection: 'row' }}>
        <Text style={{ color: weightUnit === 'kg' ? theme.accent : theme.text, fontWeight: 'bold', fontSize: 18, marginRight: 16 }}>kg</Text>
        <Text style={{ color: theme.text, fontSize: 18 }}>/</Text>
        <Text style={{ color: weightUnit === 'lbs' ? theme.accent : theme.text, fontWeight: 'bold', fontSize: 18, marginLeft: 16 }}>lbs</Text>
      </View>
      <View style={{ flexDirection: 'row', marginTop: 16 }}>
        <TouchableOpacity style={{ backgroundColor: weightUnit === 'kg' ? theme.accent : theme.card, borderRadius: 8, padding: 12, marginRight: 12 }} onPress={() => setWeightUnit('kg')}>
          <Text style={{ color: weightUnit === 'kg' ? theme.fabText : theme.text, fontWeight: 'bold' }}>kg</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ backgroundColor: weightUnit === 'lbs' ? theme.accent : theme.card, borderRadius: 8, padding: 12 }} onPress={() => setWeightUnit('lbs')}>
          <Text style={{ color: weightUnit === 'lbs' ? theme.fabText : theme.text, fontWeight: 'bold' }}>lbs</Text>
        </TouchableOpacity>
      </View>
      {/* Theme Switcher */}
      <Text style={{ color: theme.text, fontSize: 16, marginTop: 32, marginBottom: 8 }}>Theme</Text>
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
    </View>
  );
};

export default Settings;
