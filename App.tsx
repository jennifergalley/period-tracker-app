import 'react-native-gesture-handler';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import WeightTracker from './components/WeightTracker';
import Calendar from './components/Calendar';
import Home from './components/Home';
import { AppStateProvider } from './components/AppStateContext';
import Settings from './components/Settings';
import { ThemeProvider, useTheme } from './components/theme';

const Drawer = createDrawerNavigator();

function AppWithTheme() {
  const { theme } = useTheme();
  return (
    <AppStateProvider>
      <NavigationContainer>
        <Drawer.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: { backgroundColor: theme.card },
            headerTintColor: theme.text,
            drawerStyle: { backgroundColor: theme.card },
            drawerActiveTintColor: theme.accent,
            drawerInactiveTintColor: theme.legendText,
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
      </NavigationContainer>
    </AppStateProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppWithTheme />
    </ThemeProvider>
  );
}
