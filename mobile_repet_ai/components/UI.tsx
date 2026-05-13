import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ProgressProps { score: number }
export const ProgressBar: React.FC<ProgressProps> = ({ score }) => {
  const color = score <= 1 ? '#ef4444' : score <= 2 ? '#eab308' : '#22c55e';
  return (
    <View style={styles.barBg}>
      <View style={[styles.barFill, { width: `${(score / 3) * 100}%`, backgroundColor: color }]} />
    </View>
  );
};

interface CardProps { title: string; score: number; onAction: () => void }
export const TaskCard: React.FC<CardProps> = ({ title, score, onAction }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{title}</Text>
    <View style={styles.cardRow}>
      <ProgressBar score={score} />
      <Text style={styles.scoreText}>{Math.round(score/3*100)}%</Text>
    </View>
    <TouchableOpacity style={styles.btnMini} onPress={onAction}>
      <Text style={styles.btnMiniText}>Решать!</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  barBg: { height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, flex: 1, marginRight: 10 },
  barFill: { height: '100%', borderRadius: 4 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 24, marginBottom: 16, borderWidth: 1, borderColor: '#f1f5f9' },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#1e293b', marginBottom: 12 },
  cardRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  scoreText: { color: '#64748b', fontWeight: '600', fontSize: 12 },
  btnMini: { backgroundColor: '#f5f3ff', padding: 12, borderRadius: 14, alignItems: 'center' },
  btnMiniText: { color: '#6366f1', fontWeight: '700' },
});