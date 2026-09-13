import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../../components/Screen';
import VehicleCard from '../../components/VehicleCard';
import AppButton from '../../components/AppButton';
import AppInput from '../../components/AppInput';
import { SkeletonList } from '../../components/Skeleton';
import api from '../../api/client';
import { colors } from '../../theme/colors';

export default function DealerVehiclesScreen({ navigation }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('vehicleNumber');

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

  const visibleVehicles = useMemo(() => {
    const query = search.trim().toUpperCase();
    return vehicles
      .filter(
        vehicle =>
          !query ||
          [
            vehicle.chassisNumber,
            vehicle.engineNumber,
            vehicle.vehicleNumber,
          ].some(value =>
            String(value || '')
              .toUpperCase()
              .includes(query),
          ),
      )
      .sort((left, right) =>
        String(left[sortBy] || '').localeCompare(String(right[sortBy] || '')),
      );
  }, [search, sortBy, vehicles]);

  return (
    <Screen scroll={false}>
      <AppButton
        title="+ Add Vehicle"
        onPress={() => navigation.navigate('VehicleForm', { mode: 'create' })}
      />
      <AppInput
        label="Search vehicle records"
        placeholder="Chassis, engine or vehicle number"
        value={search}
        onChangeText={setSearch}
        autoCapitalize="characters"
      />
      <Text style={styles.sortLabel}>Sort by</Text>
      <View style={styles.sortRow}>
        {[
          ['vehicleNumber', 'Vehicle Number'],
          ['chassisNumber', 'Chassis Number'],
          ['engineNumber', 'Engine Number'],
        ].map(([key, label]) => (
          <Pressable
            key={key}
            onPress={() => setSortBy(key)}
            style={[
              styles.sortButton,
              sortBy === key && styles.sortButtonActive,
            ]}
          >
            <Text
              style={[styles.sortText, sortBy === key && styles.sortTextActive]}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>
      <FlatList
        style={{ marginTop: 14 }}
        contentContainerStyle={{ gap: 10, paddingBottom: 30 }}
        data={visibleVehicles}
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
              No vehicles yet.
            </Text>
          )
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  sortLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  sortRow: { flexDirection: 'row', gap: 8 },
  sortButton: {
    flex: 1,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  sortButtonActive: { backgroundColor: '#E8EEFF', borderColor: colors.primary },
  sortText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  sortTextActive: { color: colors.primary },
});
