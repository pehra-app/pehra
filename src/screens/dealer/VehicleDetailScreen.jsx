import React, {useCallback, useState} from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import Screen from '../../components/Screen';
import AppButton from '../../components/AppButton';
import StatusBadge from '../../components/StatusBadge';
import api from '../../api/client';
import {useAuth} from '../../context/AuthContext';
import {colors} from '../../theme/colors';

export default function VehicleDetailScreen({route, navigation}) {
  const {user} = useAuth();
  const {vehicleId} = route.params;
  const [vehicle, setVehicle] = useState(null);

  const load = useCallback(async () => {
    try {
      const {data} = await api.get(`/vehicles/${vehicleId}`);
      setVehicle(data);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Could not load vehicle.');
    }
  }, [vehicleId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const remove = () => {
    Alert.alert('Delete vehicle?', 'This cannot be undone.', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/vehicles/${vehicleId}`);
            navigation.goBack();
          } catch (e) {
            Alert.alert('Error', e.response?.data?.message || 'Could not delete vehicle.');
          }
        },
      },
    ]);
  };

  if (!vehicle) return <Screen><Text>Loading...</Text></Screen>;

  const canManage = user.role === 'ADMIN' || user.role === 'DEALER';

  return (
    <Screen contentStyle={{gap: 16}}>
      <View style={styles.hero}>
        <View style={{flex: 1}}>
          <Text style={styles.number}>{vehicle.vehicleNumber}</Text>
          <Text style={styles.meta}>{vehicle.make || 'Vehicle'} {vehicle.model || ''}</Text>
        </View>
        <StatusBadge status={vehicle.status} />
      </View>
      <View style={styles.card}>
        <Row label="Chassis Number" value={vehicle.chassisNumber} />
        <Row label="Engine Number" value={vehicle.engineNumber} />
        <Row label="Year" value={vehicle.year || '-'} />
        <Row label="Color" value={vehicle.color || '-'} />
        <Row label="Dealer" value={vehicle.dealer?.name || '-'} />
      </View>
      {canManage && (
        <>
          <AppButton title="Edit Vehicle" onPress={() => navigation.navigate('VehicleForm', {vehicleId})} />
          <AppButton title="Delete Vehicle" onPress={remove} variant="danger" />
        </>
      )}
    </Screen>
  );
}

function Row({label, value}) {
  return <View style={styles.row}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{String(value)}</Text></View>;
}

const styles = StyleSheet.create({
  hero: {backgroundColor: '#fff', padding: 18, borderRadius: 18, borderWidth: 1, borderColor: colors.border, flexDirection: 'row'},
  number: {fontSize: 23, fontWeight: '900', color: colors.text},
  meta: {color: colors.muted, marginTop: 4},
  card: {backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16},
  row: {paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border},
  label: {fontSize: 12, color: colors.muted},
  value: {fontWeight: '700', color: colors.text, marginTop: 4},
});
