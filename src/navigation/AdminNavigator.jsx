import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import UsersScreen from '../screens/admin/UsersScreen';
import CreateUserScreen from '../screens/admin/CreateUserScreen';
import AdminVehiclesScreen from '../screens/admin/AdminVehiclesScreen';
import VehicleFormScreen from '../screens/dealer/VehicleFormScreen';
import VehicleDetailScreen from '../screens/dealer/VehicleDetailScreen';
import AgentSearchScreen from '../screens/agent/AgentSearchScreen';
import SearchResultScreen from '../screens/agent/SearchResultScreen';

const Stack = createNativeStackNavigator();

export default function AdminNavigator() {
  return (
    <Stack.Navigator screenOptions={{headerBackTitleVisible: false}}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{title: 'Pehra Admin'}} />
      <Stack.Screen name="Users" component={UsersScreen} />
      <Stack.Screen name="CreateUser" component={CreateUserScreen} options={{title: 'Create Account'}} />
      <Stack.Screen name="AdminVehicles" component={AdminVehiclesScreen} options={{title: 'All Vehicles'}} />
      <Stack.Screen name="VehicleForm" component={VehicleFormScreen} options={{title: 'Vehicle'}} />
      <Stack.Screen name="VehicleDetail" component={VehicleDetailScreen} options={{title: 'Vehicle Details'}} />
      <Stack.Screen name="AgentSearch" component={AgentSearchScreen} options={{title: 'Vehicle Search'}} />
      <Stack.Screen name="SearchResult" component={SearchResultScreen} options={{title: 'Search Result'}} />
    </Stack.Navigator>
  );
}
