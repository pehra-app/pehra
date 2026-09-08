import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../../components/Screen';
import VehicleCard from '../../components/VehicleCard';
import AppButton from '../../components/AppButton';
import { SkeletonList } from '../../components/Skeleton';
import api from '../../api/client';
import { colors } from '../../theme/colors';

export default function AdminVehiclesScreen({ navigation }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/vehicles');
      setVehicles(data);
    } catch (e) {
      Alert.alert(
        'Error',
        e.response?.data?.message || 'Could not load vehicles.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <Screen scroll={false}>
      <AppButton
        title="+ Add Vehicle"
        onPress={() => navigation.navigate('VehicleForm', { mode: 'create' })}
      />
      <FlatList
        style={{ marginTop: 14 }}
        contentContainerStyle={{ gap: 10, paddingBottom: 30 }}
        data={vehicles}
        keyExtractor={v => v._id}
        renderItem={({ item }) => (
          <VehicleCard
            vehicle={item}
            onPress={() =>
              navigation.navigate('VehicleDetail', { vehicleId: item._id })
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
              No vehicles found.
            </Text>
          )
        }
      />
    </Screen>
  );
}
