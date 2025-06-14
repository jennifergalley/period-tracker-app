import React, { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '@/components/Theme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Keyboard } from 'react-native';
import { useAppState } from '@/components/AppStateContext';

export default function TabLayout() {
  const { theme } = useTheme();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const appState = useAppState();

  useEffect(() => {
    const show = () => setKeyboardVisible(true);
    const hide = () => setKeyboardVisible(false);
    const subShow = Keyboard.addListener('keyboardDidShow', show);
    const subHide = Keyboard.addListener('keyboardDidHide', hide);
    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.accent,
          tabBarInactiveTintColor: theme.legendText,
          headerStyle: {
            backgroundColor: theme.card,
          },
          headerShadowVisible: false,
          headerTintColor: theme.text,
          tabBarStyle: keyboardVisible
            ? {
                backgroundColor: theme.card,
                position: 'absolute',
                bottom: -100,
                left: 0,
                right: 0,
              }
            : {
                backgroundColor: theme.card,
                position: 'relative',
                bottom: 0,
                left: 0,
                right: 0,
              },
        }}
      >
        <Tabs.Screen
          name="calendar"
          options={{
            title: 'Calendar',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'calendar' : 'calendar-outline'} color={color} size={24}/>
            ),
          }}
        />
        <Tabs.Screen
          name="weight"
          options={{
            title: 'Weight',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'barbell' : 'barbell-outline'} color={color} size={24}/>
            ),
            href: appState.showWeightLog ? undefined : null,
          }}
        />
        <Tabs.Screen
          name="mood"
          options={{
            title: 'Mood',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'happy' : 'happy-outline'} color={color} size={24}/>
            ),
            href: appState.showMoodLog ? undefined : null,
          }}
        />
        <Tabs.Screen
          name="statistics"
          options={{
            title: 'Statistics',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'stats-chart' : 'stats-chart-outline'} color={color} size={24}/>
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'cog' : 'cog-outline'} color={color} size={24}/>
            ),
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
}
