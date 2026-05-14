import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { LogoImage } from '../../components/LogoImage';

export default function LoginScreen() {
  const router = useRouter();
  
  // Состояния для полей
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Состояния фокуса для UI
  const [isLoginFocused, setIsLoginFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const handleLogin = async () => {
    if (!login || !password) {
      Alert.alert('Ошибка', 'Введите логин и пароль');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://172.20.10.9:8080/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          login: login,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Храним токен в защищенном хранилище
        await SecureStore.setItemAsync('userToken', data.token);
        // Также можно сохранить инфо о пользователе (но лучше через контекст/Zustand)
        await SecureStore.setItemAsync('userData', JSON.stringify(data.user));

        // Переходим в приложение (заменяем историю, чтобы нельзя было вернуться назад)
        router.replace({ pathname: '/(drawer)/home'});
      } else {
        Alert.alert('Ошибка', data.message || 'Неверный логин или пароль');
      }
    } catch (error) {
      Alert.alert('Ошибка сети', 'Не удалось связаться с сервером. Убедитесь, что бэкенд запущен.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <LogoImage size={150} />
      </View>

      <Text style={styles.title}>
        С возвращением в <Text style={{ fontWeight: '900' }}>репет.<Text style={{ color: '#6366f1' }}>ai</Text></Text>
      </Text>

      <TextInput
        placeholder="Логин"
        placeholderTextColor="#94a3b8"
        value={login}
        onChangeText={setLogin}
        autoCapitalize="none"
        style={[styles.input, isLoginFocused && styles.inputFocused]}
        onFocus={() => setIsLoginFocused(true)}
        onBlur={() => setIsLoginFocused(false)}
      />

      <TextInput
        placeholder="Пароль"
        secureTextEntry
        placeholderTextColor="#94a3b8"
        value={password}
        onChangeText={setPassword}
        style={[styles.input, isPasswordFocused && styles.inputFocused]}
        onFocus={() => setIsPasswordFocused(true)}
        onBlur={() => setIsPasswordFocused(false)}
      />

      <TouchableOpacity 
        style={[styles.btn, loading && { opacity: 0.7 }]} 
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Войти</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={{ marginTop: 20 }}>
        <Text style={styles.link}>
          Нет аккаунта? <Text style={{ color: '#6366f1', fontWeight: 'bold' }}>Регистрация</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', padding: 25 },
  logoContainer: { alignSelf: 'center', marginBottom: 10 },
  title: { fontSize: 26, textAlign: 'center', marginBottom: 30, color: '#0f172a' },
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
  },
  inputFocused: {
    borderColor: '#6366f1',
    backgroundColor: '#f8fafc',
  },
  btn: { backgroundColor: '#6366f1', padding: 20, borderRadius: 22, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { textAlign: 'center', color: '#64748b' }
});