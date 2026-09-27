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
import AppButton from '../../components/AppButton';
import StatusBadge from '../../components/StatusBadge';
import { SkeletonList } from '../../components/Skeleton';
import api from '../../api/client';
import { downloadTablePdf } from '../../services/pdfExport';
import { colors } from '../../theme/colors';

export default function DealerWantedCustomersScreen({ navigation }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('vehicleNumber');
  const [exporting, setExporting] = useState(false);

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

  const download = async () => {
    setExporting(true);
    try {
      await downloadTablePdf({
        title: 'Wanted Customer Records',
        subtitle: 'Customer and vehicle records',
        fileName: 'pehra-wanted-customer-records',
        columns: [
          'Customer',
          'CNIC',
          'Vehicle',
          'Chassis',
          'Engine',
          'Status',
          'Dealer',
        ],
        rows: visibleVehicles.map(vehicle => [
          vehicle.customerName,
          vehicle.customerCnic,
          vehicle.vehicleNumber,
          vehicle.chassisNumber,
          vehicle.engineNumber,
          vehicle.status,
          vehicle.dealer?.name || 'Unknown dealer',
        ]),
      });
      Alert.alert('Download complete', 'The PDF was saved in Downloads/Pehra.');
    } catch (error) {
      Alert.alert(
        'Export failed',
        error.message || 'Could not create the PDF.',
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <Screen scroll={false} noPadding>
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={visibleVehicles}
        keyExtractor={vehicle => vehicle._id}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={{ gap: 10 }}>
            <Text style={styles.headerText}>
              Check this list before adding a new customer vehicle record.
            </Text>
            <AppInput
              label="Search wanted customers and vehicles"
              placeholder="Name, CNIC, chassis, engine or vehicle No"
              value={search}
              onChangeText={setSearch}
              autoCapitalize="characters"
            />
            <AppButton
              title="Download All"
              onPress={download}
              loading={exporting}
              disabled={!visibleVehicles.length}
              variant="secondary"
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
                    style={[
                      styles.sortText,
                      sortBy === key && styles.sortTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
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
          </View>
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
  list: { flex: 1 },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16, // set to 0 if you want it flush with the tab bar
    gap: 10,
  },
  headerText: {
    color: colors.muted,
    marginBottom: 4,
    fontSize: 13,
    lineHeight: 18,
  },
  sortLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
    marginBottom: 0,
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
