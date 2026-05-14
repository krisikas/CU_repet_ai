import { Drawer } from 'expo-router/drawer';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { useRouter, useGlobalSearchParams } from 'expo-router';
import { Logo } from '../../components/Logo';

export default function DrawerLayout() {
  const router = useRouter();
  const { subject = 'OGE_MATH'  } = useGlobalSearchParams();

  return (
    <Drawer
      drawerContent={(props) => (
        <DrawerContentScrollView {...props}>
          <View style={{ padding: 20, marginBottom: 10 }}>
            <Logo />
            <Text style={styles.drawerHint}>Выберите предмет:</Text>
          </View>
          
          <DrawerItem
            label="ОГЭ Математика"
            icon={({ color }) => <AntDesign name="calculator" size={20} color={color} />}
            onPress={() => router.navigate({ pathname: '/(drawer)/(tabs)/[subject]', params: { subject: 'OGE_MATH' } })}
            focused={subject === 'OGE_MATH' || subject ===  null}
            activeTintColor="#6366f1"
          />
          
          <DrawerItem
            label="ОГЭ Русский язык"
            icon={({ color }) => <Ionicons name="pencil" size={20} color={color} />}
            onPress={() => router.navigate({ pathname: '/(drawer)/(tabs)/[subject]', params: { subject: 'OGE_RUSS' } })} 
            focused={subject === 'OGE_RUSS'}
            activeTintColor="#6366f1"
          />

          <DrawerItem
            label="ОГЭ Физика"
            icon={({ color }) => <Ionicons name="flask" size={20} color={color} />}
            onPress={() => router.navigate({ pathname: '/(drawer)/(tabs)/[subject]', params: { subject: 'OGE_PHIS' } })} 
            focused={subject === 'OGE_PHIS'}
            activeTintColor="#6366f1"
          />
        </DrawerContentScrollView>
      )}
      screenOptions={{
        headerTitle: () => <Logo />,
        headerTintColor: '#6366f1',
      }}
    >
      {/* Скрываем сам путь (tabs) из списка меню */}
      <Drawer.Screen name="(tabs)" options={{ title: 'Repet AI' }} />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawerHint: { fontSize: 12, color: '#94a3b8', marginTop: 10, fontWeight: '600', textTransform: 'uppercase' }
});