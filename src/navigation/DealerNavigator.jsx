import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DealerDashboardScreen from '../screens/dealer/DealerDashboardScreen';
import DealerVehiclesScreen from '../screens/dealer/DealerVehiclesScreen';
import VehicleFormScreen from '../screens/dealer/VehicleFormScreen';
import VehicleDetailScreen from '../screens/dealer/VehicleDetailScreen';
import AlertsScreen from '../screens/dealer/AlertsScreen';
import ProfileScreen from '../screens/common/ProfileScreen';
import {colors} from '../theme/colors';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function VehicleStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="DealerVehicles" component={DealerVehiclesScreen} options={{title: 'Vehicles'}} />
      <Stack.Screen name="VehicleForm" component={VehicleFormScreen} options={{title: 'Vehicle'}} />
      <Stack.Screen name="VehicleDetail" component={VehicleDetailScreen} options={{title: 'Vehicle Details'}} />
    </Stack.Navigator>
  );
}

export default function DealerNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarActiveTintColor: colors.primary,
        headerShown: true,
        tabBarIcon: ({color, size}) => {
          const icons = {
            Home: 'home-outline',
            Vehicles: 'car-outline',
            Alerts: 'notifications-outline',
            Profile: 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}>
      <Tab.Screen name="Home" component={DealerDashboardScreen} options={{title: 'Pehra'}} />
      <Tab.Screen name="Vehicles" component={VehicleStack} options={{headerShown: false}} />
      <Tab.Screen name="Alerts" component={AlertsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
