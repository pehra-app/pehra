import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/auth/LoginScreen';
// Admin mobile navigation is retained for reference but disabled. Admin users
// are now served by the admin-web portal.
// import AdminNavigator from './AdminNavigator';
import DealerNavigator from './DealerNavigator';
import AgentNavigator from './AgentNavigator';
import StartupSplash from '../components/StartupSplash';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, booting } = useAuth();

  if (booting) return <StartupSplash />;

  if (!user) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
      </Stack.Navigator>
    );
  }

  // Mobile ADMIN access is disabled. Keep the previous route commented out so
  // the admin navigation code remains available for reference.
  // if (user.role === 'ADMIN') return <AdminNavigator />;
  if (user.role === 'DEALER') return <DealerNavigator />;
  return <AgentNavigator />;
}
