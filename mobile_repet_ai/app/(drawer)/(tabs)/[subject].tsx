import React, { useState, useCallback } from 'react';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { TaskCard } from '../../../components/UI';
import { Ionicons } from '@expo/vector-icons';

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

  const fetchTopics = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/topics?prefix=${subject}`, {
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
  }, [subject]);

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
          <TaskCard 
                  title={item.title} 
                  score={item.level} // level с бэка используем как score
                  onAction={() => router.push({
                    pathname: '/solve',
                    params: { 
                      id: item.code, 
                      title: item.title, 
                      subjectName: currentSubjectName 
                    }
                  })} 
                />
        )}
        contentContainerStyle={{ padding: 20, flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchTopics(true)}
            tintColor="#6366f1"
            colors={["#6366f1"]}
            progressViewOffset={0}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Заданий пока нет</Text>
          </View>
        }
        ListHeaderComponent={loading && topics.length === 0 ? <ActivityIndicator style={{ marginTop: 20 }} color="#6366f1" /> : null}
      />
        <TouchableOpacity 
          style={styles.btnHint} 
          onPress={() => router.push({
                    pathname: '/test',
                    // params: { 
                    //   id: item.code, 
                    //   title: item.title, 
                    //   subjectName: currentSubjectName 
                    // }
                  })} 
          // disabled={isSubmitting}
        >
          <>
              <Ionicons name="sparkles" size={18} color='#6366f1' />
              <Text style={[styles.btnText, { color: '#6366f1', marginLeft: 8 }]}>Пройти тест</Text>
            </>
          
        </TouchableOpacity>
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
  emptyText: { color: '#94a3b8', fontSize: 16 },


  btnAnswer: { backgroundColor: '#6366f1', padding: 18, borderRadius: 16, alignItems: 'center' },
  btnHint: { flexDirection: 'row', justifyContent: 'center', padding: 16, marginTop: 12, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  btnNext: { backgroundColor: '#10b981', padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 20 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

});
