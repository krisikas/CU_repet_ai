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

interface Task {
  task_id: number;
  topic: string;
  content: string;
}

interface LocalAnswer {
  answer: string;
  thoughts: string;
}

export default function TestScreen() {
  const router = useRouter();
  const { subject = 'OGE_MATH' } = useLocalSearchParams<{ subject: string }>();

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testId, setTestId] = useState<number | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [answersStore, setAnswersStore] = useState<Record<number, LocalAnswer>>({});

  const [testResult, setTestResult] = useState<any>(null);

  const currentTask = tasks[currentIndex];
  const currentAnswer = currentTask ? answersStore[currentTask.task_id]?.answer || '' : '';
  const currentThoughts = currentTask ? answersStore[currentTask.task_id]?.thoughts || '' : '';

  const fetchTest = useCallback(async () => {
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/test/start?subject=${subject}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (response.ok && data.tasks && data.tasks.length > 0) {
        setTestId(data.test_id);
        setTasks(data.tasks);
      } else {
        Alert.alert("Ошибка", data.error || "Не удалось сгенерировать тест");
        router.back();
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Ошибка", "Сервер тестирования недоступен");
    } finally {
      setLoading(false);
    }
  }, [subject]);

  useEffect(() => {
    fetchTest();
  }, [fetchTest]);

  const handleInputChange = (field: 'answer' | 'thoughts', value: string) => {
    if (!currentTask) return;
    setAnswersStore(prev => ({
      ...prev,
      [currentTask.task_id]: {
        answer: field === 'answer' ? value : prev[currentTask.task_id]?.answer || '',
        thoughts: field === 'thoughts' ? value : prev[currentTask.task_id]?.thoughts || ''
      }
    }));
  };

  const handleNext = () => {
    if (currentIndex < tasks.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleFinishTest = async () => {
    Keyboard.dismiss();
    setIsSubmitting(true);

    const payloadAnswers = tasks.map(t => ({
      task_id: t.task_code,
      student_answer: answersStore[t.task_id]?.answer || '',
      student_thoughts: answersStore[t.task_id]?.thoughts || ''
    }));

    try {
      const token = await SecureStore.getItemAsync('userToken');
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/test/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test_id: testId,
          answers: payloadAnswers
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setTestResult(data); // Переключает экран на показ результатов
      } else {
        Alert.alert("Ошибка", "Не удалось отправить тест на проверку");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Ошибка связи", "Сервер не ответил на результаты теста");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={{ marginTop: 12, color: '#64748b' }}>Составляем индивидуальный тест...</Text>
      </View>
    );
  }

  if (testResult) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff', padding: 20 }}>
        <Stack.Screen options={{ headerTitle: "Результаты теста", headerLeft: () => null }} />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}>
          <View style={styles.resultHeader}>
            <Ionicons name="trophy" size={48} color="#f59e0b" />
            <Text style={styles.resultScore}>{testResult.score} из {testResult.total}</Text>
            <Text style={styles.resultSub}>Правильных ответов</Text>
          </View>

          <View style={styles.aiReportBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <Ionicons name="sparkles" size={20} color="#8b5cf6" />
              <Text style={styles.aiReportTitle}> ДИАГНОСТИЧЕСКИЙ ОТЧЕТ ИИ:</Text>
            </View>
            <MathText content={testResult.ai_report} fontSize={16} color="#4c1d95" />
          </View>

          <TouchableOpacity style={styles.btnAnswer} onPress={() => router.replace('/(tabs)/catalog')}>
            <Text style={styles.btnText}>Вернуться в каталог</Text>
          </TouchableOpacity>
        </ScrollView>
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
        headerTitle: () => (
          <View style={{ alignItems: 'center' }}>
            <Logo />
            <Text style={{ color: '#64748b', fontSize: 11 }}>
              Вводное тестирование ({currentIndex + 1}/{tasks.length})
            </Text>
          </View>
        )
      }} />

      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 30 }}>
        
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${((currentIndex + 1) / tasks.length) * 100}%` }]} />
        </View>

        <View style={styles.taskCard}>
          <Text style={styles.taskLabel}>ТЕМА: {currentTask?.topic}</Text>
          <MathText content={currentTask?.content || ''} fontSize={19} />
          
          {currentTask?.task_id && (
            <View style={styles.imageContainer}>
              <AutoHeightImage
                width={Dimensions.get('window').width - 80}
                source={{ uri: `https://repet-ai-tasks.storage.yandexcloud.net/${currentTask.task_id}.png` }}
              />
            </View>
          )}
        </View>

        <TextInput 
          placeholder="Ваш ответ" 
          value={currentAnswer}
          onChangeText={(val) => handleInputChange('answer', val)}
          style={styles.input} 
        />

        <TextInput 
          placeholder="Ход решения (ИИ учтет это при анализе ошибок)" 
          multiline 
          value={currentThoughts}
          onChangeText={(val) => handleInputChange('thoughts', val)}
          textAlignVertical="top"
          style={[styles.input, styles.textArea]} 
        />

        <View style={styles.navRow}>
          <TouchableOpacity 
            style={[styles.btnNav, currentIndex === 0 && styles.btnDisabled]} 
            onPress={handlePrev}
            disabled={currentIndex === 0}
          >
            <Ionicons name="arrow-back" size={20} color={currentIndex === 0 ? "#cbd5e1" : "#475569"} />
            <Text style={[styles.btnNavText, currentIndex === 0 && { color: "#cbd5e1" }]}>Назад</Text>
          </TouchableOpacity>

          {currentIndex === tasks.length - 1 ? (
            <TouchableOpacity 
              style={[styles.btnAnswer, { flex: 1, marginTop: 0 }]} 
              onPress={handleFinishTest}
              // disabled={isSubmitting}
            >
              {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Завершить тест</Text>}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.btnNav, { flex: 1, justifyContent: 'center', backgroundColor: '#6366f1' }]} onPress={handleNext}>
              <Text style={[styles.btnNavText, { color: '#fff' }]}>Дальше</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  container: { flex: 1, padding: 20 },
  progressBarBg: { height: 6, backgroundColor: '#e2e8f0', borderRadius: 3, marginBottom: 20 },
  progressBarFill: { height: 6, backgroundColor: '#6366f1', borderRadius: 3 },
  taskCard: { backgroundColor: '#f8fafc', padding: 20, borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: '#f1f5f9' },
  taskLabel: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', marginBottom: 10, letterSpacing: 1 },
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
  
  navRow: { flexDirection: 'row', gap: 12, marginTop: 8, alignItems: 'center' },
  btnNav: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#fff', gap: 8 },
  btnDisabled: { borderColor: '#f1f5f9', backgroundColor: '#f8fafc' },
  btnNavText: { fontWeight: '600', fontSize: 16, color: '#475569' },
  
  btnAnswer: { backgroundColor: '#6366f1', padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  // Стили для экрана результатов
  resultHeader: { alignItems: 'center', marginVertical: 30 },
  resultScore: { fontSize: 36, fontWeight: '900', color: '#1e293b', marginTop: 12 },
  resultSub: { color: '#64748b', fontSize: 14, fontWeight: '500' },
  aiReportBox: { padding: 20, backgroundColor: '#f5f3ff', borderRadius: 20, borderLeftWidth: 5, borderLeftColor: '#8b5cf6', marginBottom: 30 },
  aiReportTitle: { fontSize: 11, fontWeight: '900', color: '#8b5cf6', letterSpacing: 0.5 },
});