import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Logo } from '../components/Logo'; 
import React, { useState } from 'react';
import { Image } from 'expo-image';
import AutoHeightImage from 'react-native-auto-height-image';
import { Dimensions } from 'react-native';

export default function SolveScreen() {
  const [isAnswerFocused, setIsAnswerFocused] = useState(false);
  const [isThoughtsFocused, setIsThoughtsFocused] = useState(false);

  const router = useRouter();
  const { id, title, subjectName} = useLocalSearchParams();
  const [hint, setHint] = useState('');
  
  const getAiHint = () => {
    setHint('Думаю...');
    setTimeout(() => {
      setHint('Вспомни, что sin(π/2 - x) = cos(x). Это поможет упростить уравнение!');
    }, 1000);
  };
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
            <Text style={{ color: '#64748b', fontSize: 13}}>{subjectName} | {title}</Text>
          </View>
        )
      }} />
      <ScrollView style={styles.container}>
        <View style={styles.taskCard}>
          <Text style={styles.taskLabel}>ЗАДАНИЕ</Text>
          <Text style={styles.taskText}>Решите уравнение: x² - 5x + 6 = 0</Text>
          {/*<View style={styles.taskImageWrapper}>*/}
            <AutoHeightImage
              width={Dimensions.get('window').width * 0.7}
              source={{ uri: "https://repet-ai-tasks.storage.yandexcloud.net/images.jpg" }}
              style={styles.taskImage} 
            />
          {/*</View>*/}
        </View>

        <TextInput 
          placeholder="Введите ответ" 
          placeholderTextColor="#94a3b8"
          style={[
            styles.input, 
            isAnswerFocused && styles.inputFocused
          ]} 
          onFocus={() => setIsAnswerFocused(true)}
          onBlur={() => setIsAnswerFocused(false)}
        />

        <TextInput 
          placeholder="Мои мысли и ход решения..." 
          placeholderTextColor="#94a3b8"
          multiline 
          textAlignVertical="top"
          style={[
            styles.input, 
            styles.textArea, 
            isThoughtsFocused && styles.inputFocused
          ]} 
          onFocus={() => setIsThoughtsFocused(true)}
          onBlur={() => setIsThoughtsFocused(false)}
        />

        <TouchableOpacity style={styles.btnAnswer} onPress={getAiHint}>
          <Text style={styles.btnText}>Ответить!</Text>
        </TouchableOpacity>


        <TouchableOpacity style={styles.btnHint} onPress={getAiHint}>
          <Text style={[styles.btnText, {color: '#536175'}]}>Получить подсказку</Text>
        </TouchableOpacity>

        {hint ? (
          <View style={styles.aiBox}>
            <Text style={styles.aiTitle}>Совет от ИИ Репета:</Text>
            <Text style={styles.aiText}>{hint}</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  taskCard: { backgroundColor: '#f1f5f9', padding: 20, borderRadius: 20, marginBottom: 20 },
  taskLabel: { fontSize: 10, fontWeight: 'bold', color: '#64748b', marginBottom: 5 },
  taskText: { fontSize: 18, color: '#1e293b', fontWeight: '600' },
  taskImageWrapper: { width: '80%', alignSelf: 'center', height: 'auto'},
  taskImage: { 
    alignSelf: 'left',
    flex: 1,
    width: '100%',
    resizeMode: 'contain',
  },
  logoText: { fontSize: 16, fontWeight: '900' },
  // taskText: { fontSize: 12, color: '#64748b', fontWeight: '500' },
  // taskBox: { backgroundColor: '#f1f5f9', padding: 25, borderRadius: 24, minHeight: 200 },
  container: { flex: 1, backgroundColor: '#fff', padding: 20},


  input: { 
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    fontSize: 16, 
    color: '#0f172a',
    marginBottom: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1, 
  },
  textArea: {
    height: 120,
    paddingTop: 14, 
  },
  inputFocused: {
    borderColor: '#6366f1',
    backgroundColor: '#f8fafc',
    shadowColor: '#6366f1',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  btnAnswer: { backgroundColor: '#6366f1', padding: 20, borderRadius: 18, alignItems: 'center' },
  btnHint: {padding: 20, borderStyle: 'dashed', borderWidth: 2, borderColor: '#d1d1e1', borderRadius: 24, alignItems: 'center', marginTop: 10},
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  aiBox: { marginTop: 25, padding: 20, backgroundColor: '#f5f3ff', borderRadius: 24, borderLeftWidth: 5, borderLeftColor: '#8b5cf6', marginBottom: 30 },
  aiTitle: { fontSize: 12, fontWeight: '800', color: '#8b5cf6', marginBottom: 5 },
  aiText: { color: '#4c1d95', lineHeight: 22 }
});