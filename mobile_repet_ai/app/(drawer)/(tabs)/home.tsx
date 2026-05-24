import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  useFocusEffect(
    useCallback(() => {
      loadAllData();

    console.log(process.env.EXPO_PUBLIC_API_URL);
    }, [])
  );

  const loadAllData = async () => {
    setIsRefreshing(true);
    try {
      const localUser = await SecureStore.getItemAsync('userData');
      if (localUser) setUser(JSON.parse(localUser));

      const token = await SecureStore.getItemAsync('userToken');
      
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
      } else if (response.status === 401) {
        handleLogout();
      } else{
        console.error("Ошибка при получении:", response.status );
      }
    } catch (error) {
      console.error("Ошибка при загрузке профиля:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('userData');
    router.replace('/(auth)');
  };

  if (loading && !profileData) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadAllData()}
            tintColor="#6366f1"
            colors={["#6366f1"]}
            progressViewOffset={0}
          />
        }>
      <Text style={styles.welcomeText}>Добрый день!</Text>
      
      <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.[0] || user?.login?.[0] || '?'}</Text>
          </View>
          <View>
            <Text style={styles.userName}>{user?.name || profileData?.login}</Text>
            <Text style={styles.userLogin}>@{profileData?.login}</Text>
          </View>
      </View>

      <Text style={styles.sectionTitle}>Твои успехи</Text>

      <View style={[styles.headerCard, { backgroundColor: profileData?.is_active_today ? '#fff7ed' : '#f1f5f9', borderColor: profileData?.is_active_today ? '#ffedd5' : '#e2e8f0' }]}>
        <View style={styles.streakInfo}>
          <FontAwesome5 
            name="fire" 
            size={40} 
            color={profileData?.is_active_today ? "#f97316" : '#afafaf'} 
          />
          <View>
            <Text style={[styles.streakValue, {color: profileData?.is_active_today ? '#ea580c' : '#64748b'}]}>
              {profileData?.current_streak || 0} дней
            </Text>
            <Text style={[styles.streakLabel, {color: profileData?.is_active_today ? '#9a3412' : '#94a3b8'}]}>
              {profileData?.is_active_today ? "Регулярной учёбы" : 'Продолжи серию!'}
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.headerCard, { backgroundColor: '#f0f9ff', borderColor: '#e0f2fe' }]}>
        <View style={styles.trophyInfo}>
          <FontAwesome5 name="trophy" size={32} color="#0ea5e9" />
          <View>
            <Text style={[styles.trophyValue, { color: '#0369a1' }]}>
              {profileData?.exercises_count || 0} упражнений
            </Text>
            <Text style={[styles.trophyLabel, { color: '#0ea5e9' }]}>Выполнил за всё время</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.chatBtn} onPress={() => router.push('/chat')}>
        <Ionicons name="sparkles" size={24} color="#fff" />
        <Text style={styles.chatBtnText}>ИИ Репет чат</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Выйти</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  welcomeText: { fontSize: 22, fontWeight: '800', marginBottom: 20, color: '#0f172a' },
  
  headerCard: { padding: 20, borderRadius: 24, marginBottom: 20, borderWidth: 1 },
  streakInfo: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  streakValue: { fontSize: 24, fontWeight: '900'},
  streakLabel: { fontSize: 14 },
  
  trophyInfo: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  trophyValue: { fontSize: 24, fontWeight: '900' },
  
  trophyLabel: { fontSize: 14 },
  
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 15, color: '#64748b' },
  userCard: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 30 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#6366f1', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  
  userName: { fontSize: 18, fontWeight: '700' },
  userLogin: { color: '#94a3b8' },
  chatBtn: { backgroundColor: '#6366f1', padding: 20, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 10 },
  
  chatBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  logoutBtn: { marginTop: 30, alignItems: 'center', paddingBottom: 40 },
  logoutText: { color: '#ef4444', fontWeight: '600' }
});