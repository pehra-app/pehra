import React from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AuthProvider} from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import {colors} from './src/theme/colors';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
