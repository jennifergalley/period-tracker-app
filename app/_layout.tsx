import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppStateProvider } from '@/components/AppStateContext';


export default function RootLayout() {
  return (
    <AppStateProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" />
    </AppStateProvider>
  );
}
