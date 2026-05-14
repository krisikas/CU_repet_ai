import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { TaskCard } from '../../components/UI';

export default function SubjectScreen() {
  const { subject } = useLocalSearchParams<{ subject: string }>();
  const router = useRouter();

  const subjectsMap: Record<string, string> = {
    OGE_MATH: 'ОГЭ по Математике',
    OGE_RUSS: 'ОГЭ по Русскому языку',
    OGE_PHIS: 'ОГЭ по Физике',
  };

  const currentSubjectName = subjectsMap[subject];

  return (
    <View style={styles.container}>
      <View style={styles.subHeader}>
        <Text style={styles.subTitle}>{currentSubjectName}</Text>
      </View>

      <FlatList
        data={[
          { id: '3', title: '№ 15 (Геометрия)', score: 0.5 },
          { id: '2', title: '№ 12 (Алгебра)', score: 2.1 }
        ]}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskCard 
            title={item.title} 
            score={item.score} 
            onAction={() => router.push({
              pathname: '/solve',
              params: { id: item.id, title: item.title, subjectName: currentSubjectName }
            })} 
          />
        )}
        contentContainerStyle={{ padding: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  subHeader: { 
    paddingHorizontal: 20, 
    paddingVertical: 12, 
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  subTitle: { 
    fontSize: 15, 
    color: '#64748b', 
    fontWeight: '800', 
    letterSpacing: 1.2 
  }
});