import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Share, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../../components/Screen';
import AppButton from '../../components/AppButton';
import VehicleCard from '../../components/VehicleCard';
import { SkeletonList } from '../../components/Skeleton';
import api from '../../api/client';
import { colors } from '../../theme/colors';

const csv = vehicles =>
  [
    'Vehicle Number,Customer Name,Customer CNIC,Chassis Number,Engine Number,Make,Model,Status,Dealer',
    ...vehicles.map(vehicle =>
      [
        vehicle.vehicleNumber,
        vehicle.customerName,
        vehicle.customerCnic,
        vehicle.chassisNumber,
        vehicle.engineNumber,
        vehicle.make,
        vehicle.model,
        vehicle.status,
        vehicle.dealer?.name,
      ]
        .map(value => `"${String(value || '').replace(/"/g, '""')}"`)
        .join(','),
    ),
  ].join('\n');

export default function AgentVehiclesScreen({ route, navigation }) {
  const { status, dealerId, title = 'Vehicle Records' } = route.params || {};
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/vehicles', {
        params: { status, dealerId },
      });
      setVehicles(data);
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Could not load records.',
      );
    } finally {
      setLoading(false);
    }
  }, [dealerId, status]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const download = () =>
    Share.share({ title: `Pehra ${title}`, message: csv(vehicles) });
  return (
    <Screen scroll={false}>
      <AppButton
        title="Download All"
        onPress={download}
        disabled={!vehicles.length}
      />
      <FlatList
        style={{ marginTop: 14 }}
        contentContainerStyle={{ gap: 10, paddingBottom: 30 }}
        data={vehicles}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <VehicleCard
            vehicle={item}
            onPress={() =>
              navigation.navigate('AgentVehicleDetail', { vehicleId: item._id })
            }
          />
        )}
        ListEmptyComponent={
          loading ? (
            <SkeletonList count={4} />
          ) : (
            <Text
              style={{
                textAlign: 'center',
                color: colors.muted,
                marginTop: 30,
              }}
            >
              No records found.
            </Text>
          )
        }
      />
    </Screen>
  );
}
