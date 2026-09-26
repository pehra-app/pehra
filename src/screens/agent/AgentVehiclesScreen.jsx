import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../../components/Screen';
import AppButton from '../../components/AppButton';
import VehicleCard from '../../components/VehicleCard';
import { SkeletonList } from '../../components/Skeleton';
import api from '../../api/client';
import { downloadTablePdf } from '../../services/pdfExport';
import { colors } from '../../theme/colors';

export default function AgentVehiclesScreen({ route, navigation }) {
  const { status, dealerId, title = 'Vehicle Records' } = route.params || {};
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');

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

  const getSortValue = item => {
    if (sortBy === 'createdAt') return item.createdAt || '';
    if (sortBy === 'dealer.name') return item.dealer?.name || '';
    return item[sortBy] || item.customerName || '';
  };

  const sortedVehicles = [...vehicles].sort((left, right) => {
    const valueA = String(getSortValue(left));
    const valueB = String(getSortValue(right));
    return valueA.localeCompare(valueB, undefined, { numeric: true });
  });

  const download = async () => {
    setExporting(true);
    try {
      await downloadTablePdf({
        title,
        subtitle: 'Vehicle records',
        fileName: `pehra-${title}-records`,
        columns: [
          'Vehicle',
          'Customer',
          'CNIC',
          'Chassis',
          'Engine',
          'Make / Model',
          'Status',
          'Dealer',
        ],
        rows: sortedVehicles.map(vehicle => [
          vehicle.vehicleNumber,
          vehicle.customerName,
          vehicle.customerCnic,
          vehicle.chassisNumber,
          vehicle.engineNumber,
          `${vehicle.make || ''} ${vehicle.model || ''}`.trim(),
          vehicle.status,
          vehicle.dealer?.name,
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
    <Screen scroll={false}>
      <Text style={{ color: colors.muted, marginBottom: 10 }}>Sort by</Text>
      <View
        style={{
          flexDirection: 'row',
          gap: 8,
          marginBottom: 12,
          flexWrap: 'wrap',
        }}
      >
        {[
          ['createdAt', 'Newest'],
          ['vehicleNumber', 'Vehicle'],
          ['customerName', 'Customer'],
          ['dealer.name', 'Dealer'],
        ].map(([key, label]) => (
          <AppButton
            key={key}
            title={label}
            variant={sortBy === key ? 'primary' : 'secondary'}
            onPress={() => setSortBy(key)}
            style={{ flex: 1, minWidth: 110 }}
          />
        ))}
      </View>
      <AppButton
        title="Download All"
        onPress={download}
        loading={exporting}
        disabled={!vehicles.length}
      />
      <FlatList
        style={{ marginTop: 14 }}
        contentContainerStyle={{ gap: 10, paddingBottom: 30 }}
        data={sortedVehicles}
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
