import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AgentDashboardScreen from '../screens/agent/AgentDashboardScreen';
import AgentSearchScreen from '../screens/agent/AgentSearchScreen';
import SearchResultScreen from '../screens/agent/SearchResultScreen';
import ProfileScreen from '../screens/common/ProfileScreen';
import AgentDealersScreen from '../screens/agent/AgentDealersScreen';
import AgentVehiclesScreen from '../screens/agent/AgentVehiclesScreen';
import AgentDealerRecordsScreen from '../screens/agent/AgentDealerRecordsScreen';
import VehicleDetailScreen from '../screens/dealer/VehicleDetailScreen';

const Stack = createNativeStackNavigator();

export default function AgentNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AgentDashboard"
        component={AgentDashboardScreen}
        options={{ title: 'Pehra Agent' }}
      />
      <Stack.Screen
        name="AgentSearch"
        component={AgentSearchScreen}
        options={{ title: 'Vehicle Search' }}
      />
      <Stack.Screen
        name="SearchResult"
        component={SearchResultScreen}
        options={{ title: 'Search Result' }}
      />
      <Stack.Screen
        name="AgentWantedVehicles"
        component={AgentVehiclesScreen}
        options={{ title: 'Wanted Vehicles' }}
        initialParams={{ status: 'WANTED', title: 'Wanted Vehicles' }}
      />
      <Stack.Screen
        name="AgentDealers"
        component={AgentDealersScreen}
        options={{ title: 'Dealers' }}
      />
      <Stack.Screen
        name="AgentDealerRecords"
        component={AgentDealerRecordsScreen}
        options={{ title: 'Dealer Records' }}
      />
      <Stack.Screen
        name="AgentVehicleDetail"
        component={VehicleDetailScreen}
        options={{ title: 'Vehicle Record' }}
      />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}
