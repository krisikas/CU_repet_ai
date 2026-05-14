import React, { useState, useCallback } from 'react';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { TaskCard } from '../../../components/UI';

export default function SubjectScreen() {
  const { subject = 'OGE_MATH' } = useLocalSearchParams<{ subject: string }>();
  const router = useRouter();
  
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const subjectsMap: Record<string, string> = {
    OGE_MATH: 'ОГЭ по Математике',
    OGE_RUSS: 'ОГЭ по Русскому языку',
    OGE_PHIS: 'ОГЭ по Физике',
  };

  const currentSubjectName = subjectsMap[subject] || 'Предмет';

  // Загрузка тем с бэкенда
  const fetchTopics = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      
      // Формируем URL с префиксом предмета
      const response = await fetch(`http://172.20.10.9:8080/api/topics?prefix=${subject}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTopics(data.topics || []);
      } else if (response.status === 401) {
        router.replace('/(auth)');
      } else {
        console.error("Ошибка сервера:", response.status);
      }
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось загрузить каталог заданий");
      console.error(error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [subject]); // Перезапускаем, если сменился предмет

  useFocusEffect(
    useCallback(() => {
      fetchTopics();
    }, [fetchTopics])
  );

  if (loading && topics.length === 0) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.subHeader}>
        <Text style={styles.subTitle}>{currentSubjectName.toUpperCase()}</Text>
      </View>

      <FlatList
  data={topics}
  keyExtractor={(item: any) => item.code}
  renderItem={({ item }) => (
    <TaskCard title={item.title} score={item.level} onAction={() => {}} />
  )}
  // Вот это исправляет "сползание":
  contentContainerStyle={{ padding: 20, flexGrow: 1 }}
  refreshControl={
    <RefreshControl
      refreshing={isRefreshing}
      onRefresh={() => fetchTopics(true)}
      tintColor="#6366f1" // Цвет для iOS
      colors={["#6366f1"]} // Цвет для Android
      progressViewOffset={0} // Важно: не дает смещать контент при инициализации
    />
  }
  // Добавляем, чтобы список не дергался при загрузке
  ListHeaderComponent={loading && topics.length === 0 ? <ActivityIndicator style={{ marginTop: 20 }} color="#6366f1" /> : null}
/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  subHeader: { 
    paddingHorizontal: 20, 
    paddingVertical: 14, 
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  subTitle: { 
    fontSize: 13, 
    color: '#64748b', 
    fontWeight: '800', 
    letterSpacing: 1.5 
  },
  emptyContainer: { flex: 1, alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#94a3b8', fontSize: 16 }
});