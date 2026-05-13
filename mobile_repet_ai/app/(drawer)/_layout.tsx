import { Drawer } from 'expo-router/drawer';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { useRouter, useGlobalSearchParams } from 'expo-router';
import { Logo } from '../../components/Logo'; 


export default function DrawerLayout() {
  const router = useRouter();
  const { subject } = useGlobalSearchParams();

  return (
    <Drawer
      drawerContent={(props) => (
        <DrawerContentScrollView {...props}>
          <View style={{ padding: 20, marginBottom: 10 }}>
             <Logo/>
          </View>
          
          <DrawerItem
            label="ОГЭ Математика"
            icon={({ color, size }) => <AntDesign name="calculator" size={size} color={color} />}
            onPress={() => router.navigate({ pathname: '/[subject]', params: { subject: 'OGE_MATH' } })}
            focused={subject === 'OGE_MATH'}
            activeTintColor="#6366f1"
          />
          
          <DrawerItem
            label="ОГЭ Русский язык"
            icon={({ color, size }) => <Ionicons name="pencil" size={size} color={color} />}
            onPress={() => router.navigate({ pathname: '/[subject]', params: { subject: 'OGE_RUSS' } })} 
            focused={subject === 'OGE_RUSS'}
            activeTintColor="#6366f1"
          />

          <DrawerItem
            label="ОГЭ Физика"
            icon={({ color, size }) => <Ionicons name="flask" size={size} color={color} />}
            onPress={() => router.navigate({ pathname: '/[subject]', params: { subject: 'OGE_PHIS' } })} 
            focused={subject === 'OGE_PHIS'}
            activeTintColor="#6366f1"
          />
        </DrawerContentScrollView>
      )}
      screenOptions={{
        headerTitle: () => <Logo/>,
        headerTintColor: '#6366f1',
        drawerActiveTintColor: '#6366f1',
      }}
    >
      <Drawer.Screen 
        name="[subject]" 
        options={{ 
          drawerLabel: 'Главная',
          title: 'Repet AI',
          drawerItemStyle: { display: 'none' } 
        }} 
      />
    </Drawer>
  );
}
