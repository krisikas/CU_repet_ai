import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Logo } from '../components/Logo'; 

export default function SolveScreen() {
  const router = useRouter();
  const { task, subjectName } = useLocalSearchParams();

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Stack.Screen options={{
        headerShown: true,
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 15 }}>
            <Ionicons name="chevron-back" size={28} color="#6366f1" />
          </TouchableOpacity>
        ),
        headerTitle: () => (
          <View style={{ flexDirection: 'column', alignItems: 'center' }}>
            <Logo/>
            <Text style={{ color: '#64748b', fontSize: 13}}>ОГЭ {subjectName} • №{task} klsjdfsjfsdjfsl</Text>
          </View>
        )
      }} />

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={styles.taskBox}>
          <Text style={styles.taskDesc}>Условие задачи появится здесь...</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  logoText: { fontSize: 16, fontWeight: '900' },
  taskText: { fontSize: 12, color: '#64748b', fontWeight: '500' },
  taskBox: { backgroundColor: '#f1f5f9', padding: 25, borderRadius: 24, minHeight: 200 }
});