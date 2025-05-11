import React, { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppStateProvider } from '@/components/AppStateContext';
import { useTheme } from '@/components/Theme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Keyboard } from 'react-native';

export default function TabLayout() {
  const { theme } = useTheme();
  const [keyboardVisible, setKeyboardVisible] = useState(false);

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
      <AppStateProvider>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: theme.accent,
            headerStyle: {
              backgroundColor: '#25292e',
            },
            headerShadowVisible: false,
            headerTintColor: '#fff',
            tabBarStyle: keyboardVisible
              ? {
                  backgroundColor: '#25292e',
                  position: 'absolute',
                  bottom: -100,
                  left: 0,
                  right: 0,
                }
              : {
                  backgroundColor: '#25292e',
                  position: 'relative',
                  bottom: 0,
                  left: 0,
                  right: 0,
                },
          }}
        >
          <Tabs.Screen
            name="today"
            options={{
              title: 'Today',
              tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ? 'calendar-clear' : 'calendar-clear-outline'} color={color} size={24} />
              ),
            }}
          />
          <Tabs.Screen
            name="calendar"
            options={{
              title: 'Calendar',
              tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ? 'calendar' : 'calendar-outline'} color={color} size={24}/>
              ),
            }}
          />
          <Tabs.Screen
            name="weight"
            options={{
              title: 'Weight Tracker',
              tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ? 'barbell' : 'barbell-outline'} color={color} size={24}/>
              ),
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: 'Settings',
              tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ? 'cog' : 'cog-outline'} color={color} size={24}/>
              ),
            }}
          />
        </Tabs>
      </AppStateProvider>
    </GestureHandlerRootView>
  );
}
