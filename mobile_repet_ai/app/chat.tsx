import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';

export default function ChatScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'AI Репетитор', headerShown: true }} />
      <Text style={styles.info}>Здесь будет чат с нейронкой...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  info: { color: '#64748b' }
});