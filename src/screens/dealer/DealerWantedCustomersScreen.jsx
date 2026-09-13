import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../../components/Screen';
import VehicleCard from '../../components/VehicleCard';
import { SkeletonList } from '../../components/Skeleton';
import api from '../../api/client';
import { colors } from '../../theme/colors';

export default function DealerWantedCustomersScreen({ navigation }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setVehicles((await api.get('/vehicles/wanted-customers')).data);
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Could not load wanted customers.',
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
      <Text style={{ color: colors.muted, marginBottom: 14 }}>
        Check this list before adding a new customer vehicle record.
      </Text>
      <FlatList
        contentContainerStyle={{ gap: 10, paddingBottom: 30 }}
        data={vehicles}
        keyExtractor={vehicle => vehicle._id}
        renderItem={({ item }) => (
          <VehicleCard
            vehicle={item}
            onPress={() =>
              navigation.navigate('Vehicles', {
                screen: 'VehicleDetail',
                params: { vehicleId: item._id },
              })
            }
          />
        )}
        ListEmptyComponent={
          loading ? (
            <SkeletonList count={4} />
          ) : (
            <Text
              style={{
                color: colors.muted,
                textAlign: 'center',
                marginTop: 30,
              }}
            >
              No wanted customers found.
            </Text>
          )
        }
      />
    </Screen>
  );
}
