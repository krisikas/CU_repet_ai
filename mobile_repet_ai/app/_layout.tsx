import { Stack, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';

export default function RootLayout() {
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        const inAuthGroup = segments[0] === '(auth)';

        if (token && inAuthGroup) {
          router.replace({ pathname: '/(drawer)/(tabs)/home' });
        } else if (!token && !inAuthGroup) {
          router.replace('/(auth)');
        }
      } catch (e) {
        console.error("Auth check failed", e);
      } finally {
        setIsReady(true);
      }
    };

    checkAuth();
  }, [segments]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right'
      }}>
        <Stack.Screen name="(auth)/index" />
        <Stack.Screen name="(drawer)" />
        <Stack.Screen name="solve" options={{ presentation: 'card' }} />
        <Stack.Screen name="test" options={{ presentation: 'card' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}