import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppStateProvider } from '@/components/AppStateContext';
import { useTheme } from '@/components/Theme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function TabLayout() {
  const { theme } = useTheme();
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
            tabBarStyle: {
              backgroundColor: '#25292e',
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
