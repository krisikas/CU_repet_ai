import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  FlatList, ActivityIndicator, KeyboardAvoidingView, 
  Platform, Keyboard, Dimensions 
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { Logo } from '../components/Logo';
import { MathText } from '../components/MathText';

// Рассчитываем точную ширину для пузырей сообщений
const { width } = Dimensions.get('window');
const BUBBLE_WIDTH = width * 0.78; // 78% от ширины экрана под контент сообщения

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export default function ChatScreen() {
  const router = useRouter();
  const { topicId, title, subjectName } = useLocalSearchParams();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);

  // Приветственное сообщение от Сократического наставника при старте чата
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        sender: 'ai',
        text: `Привет! Я твой личный наставник по теме **"${title || 'Общий чат'}"**. \n\nЕсли у тебя есть сложный вопрос, непонятная формула или задача, которую не получается разобрать — напиши мне. Постараемся докопаться до сути вместе! Что именно тебя сейчас затрудняет?`,
        timestamp: new Date(),
      }
    ]);
  }, [title]);

  const sendMessage = async () => {
    if (!inputText.trim() || isSending) return;

    const userMessageText = inputText.trim();
    setInputText('');
    
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: userMessageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsSending(true);

    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 60);

    try {
      const token = await SecureStore.getItemAsync('userToken');
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/chat/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic_id: topicId,
          message: userMessageText,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: data.ai_response,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error();
      }
    } catch (error) {
      setInputText(userMessageText);
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
      alert('Не удалось отправить сообщение. Проверьте интернет-соединение.');
    } finally {
      setIsSending(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const renderMessageItem = ({ item }: { item: Message }) => {
    const isAi = item.sender === 'ai';
    return (
      <View style={[styles.messageWrapper, isAi ? styles.aiWrapper : styles.userWrapper]}>
        {isAi && (
          <View style={styles.aiAvatar}>
            <Ionicons name="sparkles" size={11} color="#fff" />
          </View>
        )}
        <View style={[styles.bubble, isAi ? styles.aiBubble : styles.userBubble]}>
          <MathText 
            content={item.text} 
            fontSize={16} 
            color={isAi ? '#334155' : '#fff'} 
          />
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.mainContainer}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0} 
    >
      <Stack.Screen options={{
        headerShown: true,
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#6366f1" />
          </TouchableOpacity>
        ),
        headerTitle: () => (
          <View style={styles.headerTitleContainer}>
            <Logo />
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {subjectName ? `${subjectName} | ` : ''}{title || 'Наставник'}
            </Text>
          </View>
        )
      }} />

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.chatListContainer}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Задай вопрос наставнику..."
          placeholderTextColor="#94a3b8"
          value={inputText}
          onChangeText={setInputText}
          multiline
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          style={[
            styles.input, 
            isInputFocused && styles.inputFocused
          ]}
        />
        <TouchableOpacity 
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]} 
          onPress={sendMessage}
          disabled={!inputText.trim() || isSending}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="arrow-up" size={22} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#fff' },
  backButton: { marginRight: 15 },
  headerTitleContainer: { alignItems: 'center', width: width * 0.6 },
  headerSubtitle: { color: '#64748b', fontSize: 11, marginTop: 1, textAlign: 'center' },
  
  chatListContainer: { paddingHorizontal: 16, paddingVertical: 16 },
  
  // Базовая строка контейнера сообщения
  messageWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: '100%',
    marginBottom: 16,
  },
  aiWrapper: {
    justifyContent: 'flex-start',
  },
  userWrapper: {
    justifyContent: 'flex-end',
  },
  
  aiAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 2,
  },
  
  // Пузырь сообщения теперь имеет фиксированную ширину, чтобы MathText не сжимал его по вертикали
  bubble: { 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    borderRadius: 20,
    width: BUBBLE_WIDTH, // Жестко задаем ширину в 78% экрана
  },
  aiBubble: { 
    backgroundColor: '#f1f5f9', 
    borderBottomLeftRadius: 4, 
  },
  userBubble: { 
    backgroundColor: '#6366f1', 
    borderBottomRightRadius: 4,
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: '#f1f5f9',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 24,
    fontSize: 16,
    maxHeight: 120,
    color: '#1e293b',
  },
  inputFocused: { 
    borderColor: '#6366f1' 
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
});