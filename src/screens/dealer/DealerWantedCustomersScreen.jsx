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
import AppInput from '../../components/AppInput';
import StatusBadge from '../../components/StatusBadge';
import { SkeletonList } from '../../components/Skeleton';
import api from '../../api/client';
import { colors } from '../../theme/colors';

export default function DealerWantedCustomersScreen({ navigation }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('vehicleNumber');

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

  const visibleVehicles = useMemo(() => {
    const query = search.trim().toUpperCase();
    return vehicles
      .filter(
        vehicle =>
          !query ||
          [
            vehicle.customerName,
            vehicle.customerCnic,
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
      <Text style={{ color: colors.muted, marginBottom: 14 }}>
        Check this list before adding a new customer vehicle record.
      </Text>
      <AppInput
        label="Search wanted customers and vehicles"
        placeholder="Name, CNIC, chassis, engine or vehicle number"
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
        style={styles.list}
        contentContainerStyle={{ gap: 10, paddingBottom: 30 }}
        data={visibleVehicles}
        keyExtractor={vehicle => vehicle._id}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            onPress={() =>
              navigation.navigate('Vehicles', {
                screen: 'VehicleDetail',
                params: { vehicleId: item._id },
              })
            }
          >
            <View style={styles.cardHeader}>
              <View style={styles.customer}>
                <Text style={styles.customerName}>
                  {item.customerName || 'Unknown customer'}
                </Text>
                <Text style={styles.cnic}>
                  CNIC: {item.customerCnic || '-'}
                </Text>
              </View>
              <StatusBadge status={item.status} />
            </View>
            <Text style={styles.vehicleNumber}>{item.vehicleNumber}</Text>
            <Text style={styles.meta}>
              {item.make || 'Vehicle'} {item.model || ''}
            </Text>
            <Text style={styles.detail}>Chassis: {item.chassisNumber}</Text>
            <Text style={styles.detail}>Engine: {item.engineNumber}</Text>
            <Text style={styles.detail}>
              Year: {item.year || '-'} Color: {item.color || '-'}
            </Text>
          </Pressable>
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

const styles = StyleSheet.create({
  list: { marginTop: 14 },
  sortLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 12,
  },
  sortRow: { flexDirection: 'row', gap: 8 },
  sortButton: {
    flex: 1,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
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
    lineHeight: 16,
    textAlign: 'center',
  },
  sortTextActive: { color: colors.primary },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 16,
    gap: 6,
  },
  pressed: { opacity: 0.9 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  customer: { flex: 1 },
  customerName: { color: colors.text, fontSize: 18, fontWeight: '900' },
  cnic: { color: colors.danger, fontSize: 13, fontWeight: '700', marginTop: 4 },
  vehicleNumber: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    marginTop: 6,
  },
  meta: { color: colors.muted },
  detail: { color: colors.muted, fontSize: 13 },
});
