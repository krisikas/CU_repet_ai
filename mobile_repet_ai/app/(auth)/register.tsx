import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LogoImage } from '../../components/LogoImage';

export default function RegisterScreen() {
  const router = useRouter();
  
  // Состояния для полей
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  // Состояния фокуса
  const [isLoginFocused, setIsLoginFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isNameFocused, setIsNameFocused] = useState(false);

  const handleRegister = async () => {
    if (!login || !password || !name) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/register`, { // Проверь эндпоинт на бэке
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          login: login,
          password: password,
          name: name
        }),
      });

      if (response.ok) {
        Alert.alert(
          'Успех!', 
          'Регистрация прошла успешно. Теперь войдите в свой аккаунт.',
          [{ text: 'ОК', onPress: () => router.push('/(auth)') }]
        );
      } else {
        const data = await response.json();
        Alert.alert('Ошибка', data.message || 'Такой пользователь уже существует');
      }
    } catch (error) {
      Alert.alert('Ошибка сети', 'Не удалось связаться с сервером');
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
        Регистрация в <Text style={{ fontWeight: '900' }}>репет.<Text style={{ color: '#6366f1' }}>ai</Text></Text>
      </Text>

      <TextInput
        placeholder="Ваше имя"
        placeholderTextColor="#94a3b8"
        value={name}
        onChangeText={setName}
        style={[styles.input, isNameFocused && styles.inputFocused]}
        onFocus={() => setIsPasswordFocused(true)}
        onBlur={() => setIsPasswordFocused(false)}
      />

      <TextInput
        placeholder="Придумайте логин"
        placeholderTextColor="#94a3b8"
        value={login}
        onChangeText={setLogin}
        autoCapitalize="none"
        style={[styles.input, isLoginFocused && styles.inputFocused]}
        onFocus={() => setIsLoginFocused(true)}
        onBlur={() => setIsLoginFocused(false)}
      />

      <TextInput
        placeholder="Придумайте пароль"
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
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Зарегистрироваться</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(auth)')} style={{ marginTop: 20 }}>
        <Text style={styles.link}>
          Есть аккаунт? <Text style={{ color: '#6366f1', fontWeight: 'bold' }}>Вход</Text>
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
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  inputFocused: {
    borderColor: '#6366f1',
    backgroundColor: '#f8fafc',
    shadowColor: '#6366f1',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  btn: { backgroundColor: '#6366f1', padding: 20, borderRadius: 22, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { textAlign: 'center', color: '#64748b' }
});