import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
// Импортируем компонент логотипа, который мы создали выше
import { LogoImage } from '../../components/LogoImage'; 

export default function LoginScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <LogoImage size={150} />
      </View>

      <Text style={styles.title}>С возвращением в <Text style={{ fontWeight: '900' }}>репет.<Text style={{ color: '#6366f1'}}>ai</Text></Text></Text>
      
      <TextInput 
        placeholder="Email" 
        style={styles.input} 
        placeholderTextColor="#94a3b8" 
        autoCapitalize="none"
      />
      <TextInput 
        placeholder="Пароль" 
        secureTextEntry 
        style={styles.input} 
        placeholderTextColor="#94a3b8" 
      />

      <TouchableOpacity style={styles.btn} onPress={() => router.navigate({ pathname: '/[subject]', params: { subject: 'OGE_MATH' } })}>
        <Text style={styles.btnText}>Войти</Text>
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
  logoContainer: { 
    alignSelf: 'center', 
    marginBottom: 10,
  },
  title: { fontSize: 26, textAlign: 'center', marginBottom: 30, color: '#0f172a' },
  input: { backgroundColor: '#f8fafc', padding: 20, borderRadius: 22, marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9' },
  btn: { backgroundColor: '#6366f1', padding: 20, borderRadius: 22, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { textAlign: 'center', color: '#64748b' }
});