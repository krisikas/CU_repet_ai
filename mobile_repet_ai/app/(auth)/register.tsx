import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LogoImage } from '../../components/LogoImage'; 
import React, { useState } from 'react';

export default function LoginScreen() {
  const router = useRouter();
  const [isLoginFocused, setIsLoginFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <LogoImage size={150} />
      </View>

      <Text style={styles.title}>Регистрация в <Text style={{ fontWeight: '900' }}>репет.<Text style={{ color: '#6366f1'}}>ai</Text></Text></Text>
      <TextInput 
        placeholder="Логин" 
        placeholderTextColor="#94a3b8"
        style={[
          styles.input, 
          isLoginFocused && styles.inputFocused
        ]} 
        onFocus={() => setIsLoginFocused(true)}
        onBlur={() => setIsLoginFocused(false)}
      />
      <TextInput 
        placeholder="Пороль" 
        secureTextEntry 
        placeholderTextColor="#94a3b8"
        style={[
          styles.input, 
          isPasswordFocused && styles.inputFocused
        ]} 
        onFocus={() => setIsPasswordFocused(true)}
        onBlur={() => setIsPasswordFocused(false)}
      />

      <TouchableOpacity style={styles.btn} onPress={() => router.navigate({ pathname: '/[subject]', params: { subject: 'OGE_MATH' } })}>
        <Text style={styles.btnText}>Войти</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(auth)')} style={{ marginTop: 20 }}>
        <Text style={styles.link}>
          Есть аккаунта? <Text style={{ color: '#6366f1', fontWeight: 'bold' }}>Вход</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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

  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', padding: 25 },
  logoContainer: { 
    alignSelf: 'center', 
    marginBottom: 10,
  },
  title: { fontSize: 26, textAlign: 'center', marginBottom: 30, color: '#0f172a' },
  // input: { backgroundColor: '#f8fafc', padding: 20, borderRadius: 22, marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9' },
  btn: { backgroundColor: '#6366f1', padding: 20, borderRadius: 22, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { textAlign: 'center', color: '#64748b' }
});