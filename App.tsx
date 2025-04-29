import 'react-native-gesture-handler';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import WeightTracker from './components/WeightTracker';
import Calendar from './components/Calendar';
import Home from './components/Home';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AppStateProvider } from './components/AppStateContext';
import Settings from './components/Settings';

const Drawer = createDrawerNavigator();

function AppNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: { backgroundColor: '#181a20' },
        headerTintColor: '#fff',
        drawerStyle: { backgroundColor: '#181a20' },
        drawerActiveTintColor: '#4db8ff',
        drawerInactiveTintColor: '#bbb',
        drawerLabelStyle: { fontWeight: 'bold' },
      }}
    >
      <Drawer.Screen name="Home">
        {() => <Home />}
      </Drawer.Screen>
      <Drawer.Screen name="Period Tracker">
        {() => <Calendar />}
      </Drawer.Screen>
      <Drawer.Screen name="Weight Tracker">
        {() => <WeightTracker />}
      </Drawer.Screen>
      <Drawer.Screen name="Settings" options={{ drawerLabel: 'Settings', drawerItemStyle: { marginTop: 'auto' } }}>
        {() => <Settings />}
      </Drawer.Screen>
    </Drawer.Navigator>
  );
}

export default function App() {
  return (
    <AppStateProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AppStateProvider>
  );
}

const styles = StyleSheet.create({
  weightTrackerContainer: { flex: 1, backgroundColor: '#181a20', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 32 },
  weightTrackerHeading: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
});
