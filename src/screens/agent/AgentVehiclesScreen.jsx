import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Text } from 'react-native';
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
        rows: vehicles.map(vehicle => [
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
      <AppButton
        title="Download All"
        onPress={download}
        loading={exporting}
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
