import React from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useAuth} from '../context/AuthContext';
import LoginScreen from '../screens/auth/LoginScreen';
import AdminNavigator from './AdminNavigator';
import DealerNavigator from './DealerNavigator';
import AgentNavigator from './AgentNavigator';
import {colors} from '../theme/colors';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const {user, booting} = useAuth();

  if (booting) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="Login" component={LoginScreen} />
      </Stack.Navigator>
    );
  }

  if (user.role === 'ADMIN') return <AdminNavigator />;
  if (user.role === 'DEALER') return <DealerNavigator />;
  return <AgentNavigator />;
}

const styles = StyleSheet.create({
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background},
});
