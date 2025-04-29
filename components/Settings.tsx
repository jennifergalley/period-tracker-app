import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAppState } from './AppStateContext';

const Settings: React.FC = () => {
  const { weightUnit, setWeightUnit } = useAppState();
  return (
    <View style={{ flex: 1, backgroundColor: '#181a20', alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 16 }}>Settings</Text>
      <Text style={{ color: '#fff', fontSize: 16, marginBottom: 8 }}>Preferred Weight Unit</Text>
      <View style={{ flexDirection: 'row' }}>
        <Text style={{ color: weightUnit === 'kg' ? '#4db8ff' : '#fff', fontWeight: 'bold', fontSize: 18, marginRight: 16 }}>kg</Text>
        <Text style={{ color: '#fff', fontSize: 18 }}>/</Text>
        <Text style={{ color: weightUnit === 'lbs' ? '#4db8ff' : '#fff', fontWeight: 'bold', fontSize: 18, marginLeft: 16 }}>lbs</Text>
      </View>
      <View style={{ flexDirection: 'row', marginTop: 16 }}>
        <TouchableOpacity style={{ backgroundColor: weightUnit === 'kg' ? '#4db8ff' : '#23242a', borderRadius: 8, padding: 12, marginRight: 12 }} onPress={() => setWeightUnit('kg')}>
          <Text style={{ color: weightUnit === 'kg' ? '#181a20' : '#fff', fontWeight: 'bold' }}>kg</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ backgroundColor: weightUnit === 'lbs' ? '#4db8ff' : '#23242a', borderRadius: 8, padding: 12 }} onPress={() => setWeightUnit('lbs')}>
          <Text style={{ color: weightUnit === 'lbs' ? '#181a20' : '#fff', fontWeight: 'bold' }}>lbs</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Settings;
