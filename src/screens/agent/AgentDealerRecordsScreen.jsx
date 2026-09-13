import React from 'react';
import AgentVehiclesScreen from './AgentVehiclesScreen';

export default function AgentDealerRecordsScreen({ route, navigation }) {
  return (
    <AgentVehiclesScreen
      route={{
        params: {
          ...route.params,
          title: `${route.params.dealerName} Records`,
        },
      }}
      navigation={navigation}
    />
  );
}
