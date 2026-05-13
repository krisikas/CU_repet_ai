import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export default function SolveScreen() {
  const [hint, setHint] = useState<string | null>(null);

  const getAiHint = () => {
    setHint('Анализирую...');
    setTimeout(() => {
      setHint('Попробуй перенести все члены уравнения в левую часть и вынести общий множитель.');
    }, 800);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.taskCard}>
        <Text style={styles.taskLabel}>ЗАДАНИЕ</Text>
        <Text style={styles.taskText}>Решите уравнение: x² - 5x + 6 = 0</Text>
      </View>

      <TextInput placeholder="Твой ответ" style={styles.input} />
      <TextInput placeholder="Твои рассуждения..." multiline style={[styles.input, { height: 100 }]} />

      <TouchableOpacity style={styles.aiBtn} onPress={getAiHint}>
        <Text style={styles.aiBtnText}>Подсказка AI ✨</Text>
      </TouchableOpacity>

      {hint && (
        <View style={styles.aiResponse}>
          <Text style={styles.aiResponseText}>{hint}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  taskCard: { backgroundColor: '#f1f5f9', padding: 20, borderRadius: 20, marginBottom: 20 },
  taskLabel: { fontSize: 10, fontWeight: 'bold', color: '#64748b', marginBottom: 5 },
  taskText: { fontSize: 18, color: '#1e293b', fontWeight: '600' },
  input: { backgroundColor: '#f8fafc', padding: 18, borderRadius: 16, marginBottom: 15, borderWidth: 1, borderColor: '#f1f5f9' },
  aiBtn: { backgroundColor: '#6366f1', padding: 18, borderRadius: 16, alignItems: 'center' },
  aiBtnText: { color: '#fff', fontWeight: 'bold' },
  aiResponse: { marginTop: 20, padding: 20, backgroundColor: '#f5f3ff', borderRadius: 20, borderLeftWidth: 4, borderLeftColor: '#8b5cf6' },
  aiResponseText: { color: '#5b21b6', lineHeight: 22 }
});