import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right' // Красивая анимация перехода
      }}>
        <Stack.Screen name="(auth)/index" />
        <Stack.Screen name="(drawer)" />
        {/* Эти экраны открываются поверх Drawer */}
        <Stack.Screen name="solve" options={{ presentation: 'card' }} />
        <Stack.Screen name="test" options={{ presentation: 'card' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}