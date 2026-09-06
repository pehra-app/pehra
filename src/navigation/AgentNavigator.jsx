import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AgentDashboardScreen from '../screens/agent/AgentDashboardScreen';
import AgentSearchScreen from '../screens/agent/AgentSearchScreen';
import SearchResultScreen from '../screens/agent/SearchResultScreen';
import ProfileScreen from '../screens/common/ProfileScreen';

const Stack = createNativeStackNavigator();

export default function AgentNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="AgentDashboard" component={AgentDashboardScreen} options={{title: 'Pehra Agent'}} />
      <Stack.Screen name="AgentSearch" component={AgentSearchScreen} options={{title: 'Vehicle Search'}} />
      <Stack.Screen name="SearchResult" component={SearchResultScreen} options={{title: 'Search Result'}} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}
