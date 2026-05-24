import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ScrollView, ActivityIndicator, Dimensions, Alert,
  KeyboardAvoidingView, Platform, Keyboard 
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import AutoHeightImage from 'react-native-auto-height-image';
import { Logo } from '../components/Logo';
import { MathText } from '../components/MathText';

export default function SolveScreen() {
  const router = useRouter();
  const { id, title, subjectName } = useLocalSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [task, setTask] = useState<any>(null);
  const [answer, setAnswer] = useState('');
  const [thoughts, setThoughts] = useState('');
  
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [lastMode, setLastMode] = useState<'hint' | 'check' | null>(null); // Трекаем режим
  
  const [isAnswerFocused, setIsAnswerFocused] = useState(false);
  const [isThoughtsFocused, setIsThoughtsFocused] = useState(false);

  const fetchRandomTask = useCallback(async () => {
    setLoading(true);
    setAiResponse(null);
    setIsCorrect(null);
    setLastMode(null);
    setAnswer('');
    setThoughts('');
    
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/tasks/random?topic=${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (response.ok) {
        setTask(data);
      } else {
        Alert.alert("Упс!", "Задания этого типа закончились");
        router.back();
      }
    } catch (error) {
      Alert.alert("Ошибка", "Проблемы с подключением к серверу");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRandomTask();
  }, [fetchRandomTask]);

  const handleTaskSubmit = async (mode: 'hint' | 'check') => {
    setAiResponse(null);
    if (!answer.trim() && mode === 'check') {
      Alert.alert("Внимание", "Сначала введи ответ");
      return;
    }

    Keyboard.dismiss(); // Скрываем клавиатуру при отправке
    setIsSubmitting(true);
    setLastMode(mode);

    try {
      const token = await SecureStore.getItemAsync('userToken');
      const response = await fetch(`${process.env.API_URL}/api/tasks/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task_id: task.task_id,
          mode: mode,
          student_answer: answer,
          student_thoughts: thoughts,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAiResponse(data.ai_response);
        setIsCorrect(mode === 'check' ? data.is_correct : null);
      }
    } catch (error) {
      Alert.alert("Ошибка", "Сервер не отвечает");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#fff' }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0} 
    >
      <Stack.Screen options={{
        headerShown: true,
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 15 }}>
            <Ionicons name="chevron-back" size={28} color="#6366f1" />
          </TouchableOpacity>
        ),
        headerTitle: () => (
          <View style={{ alignItems: 'center' }}>
            <Logo />
            <Text style={{ color: '#64748b', fontSize: 11}} numberOfLines={1}>{subjectName} | {title}</Text>
          </View>
        )
      }} />

      <ScrollView 
        style={styles.container} 
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.taskCard}>
          <Text style={styles.taskLabel}>ЗАДАНИЕ #{task?.task_id}</Text>
          <MathText content={task?.content || ''} fontSize={18} />
          
          <View style={styles.imageContainer}>
            <AutoHeightImage
              width={Dimensions.get('window').width - 80}
              source={{ uri: `https://repet-ai-tasks.storage.yandexcloud.net/${task.task_id}.png` }}
            />
          </View>
        </View>

        {/* Блок ответа от ИИ с разным оформлением */}
        {aiResponse && (
          <View style={[
            styles.aiBox, 
            lastMode === 'hint' && styles.aiBoxHint,
            isCorrect === true && styles.aiBoxCorrect,
            isCorrect === false && styles.aiBoxWrong
          ]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Ionicons 
                name={lastMode === 'hint' ? "bulb-outline" : isCorrect ? "checkmark-circle" : "close-circle"} 
                size={18} 
                color={lastMode === 'hint' ? '#f59e0b' : isCorrect ? '#10b981' : '#ef4444'} 
              />
              <Text style={[
                styles.aiTitle, 
                lastMode === 'hint' && {color: '#f59e0b'},
                isCorrect === true && {color: '#10b981'}, 
                isCorrect === false && {color: '#ef4444'}
              ]}>
                {lastMode === 'hint' ? ' ПОДСКАЗКА' : isCorrect === true ? ' ПРАВИЛЬНО!' : ' ЕСТЬ ОШИБКА'}
              </Text>
            </View>
            <MathText content={aiResponse} fontSize={16} color="#334155" />
          </View>
        )}

        <TextInput 
          placeholder="Ответ" 
          placeholderTextColor="#94a3b8" 
          value={answer}
          onChangeText={setAnswer}
          style={[styles.input, isAnswerFocused && styles.inputFocused]} 
          onFocus={() => setIsAnswerFocused(true)}
          onBlur={() => setIsAnswerFocused(false)}
        />

        <TextInput 
          placeholder="Ход решения (необязательно)" 
          placeholderTextColor="#94a3b8" 
          multiline 
          value={thoughts}
          onChangeText={setThoughts}
          textAlignVertical="top"
          style={[styles.input, styles.textArea, isThoughtsFocused && styles.inputFocused]} 
          onFocus={() => setIsThoughtsFocused(true)}
          onBlur={() => setIsThoughtsFocused(false)}
        />

        <TouchableOpacity 
          style={styles.btnAnswer} 
          onPress={() => handleTaskSubmit('check')}
          disabled={isSubmitting}
        >
          {isSubmitting && lastMode === 'check' ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Проверить</Text>}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.btnHint} 
          onPress={() => handleTaskSubmit('hint')}
          disabled={isSubmitting}
        >
          {isSubmitting && lastMode === 'hint' ? <ActivityIndicator color="#6366f1" /> : (
            <>
              <Ionicons name="sparkles" size={18} color='#6366f1' />
              <Text style={[styles.btnText, { color: '#6366f1', marginLeft: 8 }]}>Нужна помощь</Text>
            </>
          )}
        </TouchableOpacity>
        
        {isCorrect && (
          <TouchableOpacity style={styles.btnNext} onPress={fetchRandomTask}>
            <Text style={styles.btnText}>Следующая задача</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, padding: 20 },
  taskCard: { backgroundColor: '#f8fafc', padding: 20, borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: '#f1f5f9' },
  taskLabel: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', marginBottom: 10 },
  imageContainer: { marginTop: 15, alignSelf: 'center' },
  
  input: { 
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    padding: 16,
    borderRadius: 16,
    fontSize: 16, 
    marginBottom: 12,
  },
  textArea: { height: 100 },
  inputFocused: { borderColor: '#6366f1' },
  
  btnAnswer: { backgroundColor: '#6366f1', padding: 18, borderRadius: 16, alignItems: 'center' },
  btnHint: { flexDirection: 'row', justifyContent: 'center', padding: 16, marginTop: 12, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  btnNext: { backgroundColor: '#10b981', padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 20 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  aiBox: { padding: 18, borderRadius: 18, marginBottom: 20, borderLeftWidth: 4 },
  aiBoxHint: { backgroundColor: '#fffbeb', borderLeftColor: '#f59e0b' }, // Теплый желтый для подсказки
  aiBoxCorrect: { backgroundColor: '#f0fdf4', borderLeftColor: '#10b981' }, // Зеленый
  aiBoxWrong: { backgroundColor: '#fef2f2', borderLeftColor: '#ef4444' }, // Красный
  aiTitle: { fontSize: 12, fontWeight: 'bold' },
});