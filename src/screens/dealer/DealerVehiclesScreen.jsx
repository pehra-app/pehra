import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../../components/Screen';
import VehicleCard from '../../components/VehicleCard';
import AppButton from '../../components/AppButton';
import { SkeletonList } from '../../components/Skeleton';
import api from '../../api/client';
import { downloadTablePdf } from '../../services/pdfExport';
import { colors } from '../../theme/colors';

export default function DealerVehiclesScreen({ navigation }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

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

  const download = async () => {
    setExporting(true);
    try {
      await downloadTablePdf({
        title: 'Dealer Vehicle Records',
        subtitle: 'Wanted vehicle records',
        fileName: 'pehra-dealer-vehicle-records',
        columns: [
          'Vehicle',
          'Customer',
          'CNIC',
          'Chassis',
          'Engine',
          'Make / Model',
          'Status',
        ],
        rows: vehicles.map(vehicle => [
          vehicle.vehicleNumber,
          vehicle.customerName,
          vehicle.customerCnic,
          vehicle.chassisNumber,
          vehicle.engineNumber,
          `${vehicle.make || ''} ${vehicle.model || ''}`.trim(),
          vehicle.status,
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
      <AppButton
        title="+ Add Vehicle"
        onPress={() => navigation.navigate('VehicleForm', { mode: 'create' })}
      />
      <AppButton
        title="Download All"
        onPress={download}
        loading={exporting}
        disabled={!vehicles.length}
        variant="secondary"
        style={{ marginTop: 12 }}
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
              No vehicles yet.
            </Text>
          )
        }
      />
    </Screen>
  );
}
