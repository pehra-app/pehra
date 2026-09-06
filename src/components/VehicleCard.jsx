import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {colors} from '../theme/colors';
import StatusBadge from './StatusBadge';

export default function VehicleCard({vehicle, onPress}) {
  return (
    <Pressable onPress={onPress} style={({pressed}) => [styles.card, pressed && {opacity: 0.9}]}>
      <View style={styles.row}>
        <View style={{flex: 1}}>
          <Text style={styles.title}>{vehicle.vehicleNumber}</Text>
          <Text style={styles.meta}>{vehicle.make || 'Vehicle'} {vehicle.model || ''}</Text>
        </View>
        <StatusBadge status={vehicle.status} />
      </View>
      <Text style={styles.line}>Chassis: {vehicle.chassisNumber}</Text>
      <Text style={styles.line}>Engine: {vehicle.engineNumber}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 16,
    gap: 6,
  },
  row: {flexDirection: 'row', gap: 12, alignItems: 'flex-start'},
  title: {fontSize: 17, fontWeight: '800', color: colors.text},
  meta: {marginTop: 3, color: colors.muted},
  line: {fontSize: 13, color: colors.muted},
});
