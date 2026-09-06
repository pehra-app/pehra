import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Screen from '../../components/Screen';
import AppButton from '../../components/AppButton';
import {colors} from '../../theme/colors';

export default function SearchResultScreen({route, navigation}) {
  const {result} = route.params;

  if (!result.found) {
    return (
      <Screen contentStyle={styles.center}>
        <View style={[styles.circle, {backgroundColor: '#EEF2F7'}]}><Text style={styles.symbol}>?</Text></View>
        <Text style={styles.title}>No record found</Text>
        <Text style={styles.sub}>No vehicle matches “{result.searchedValue}”.</Text>
        <AppButton title="Search Again" onPress={() => navigation.goBack()} />
      </Screen>
    );
  }

  const vehicle = result.vehicle;
  const wanted = vehicle.status === 'WANTED';

  return (
    <Screen contentStyle={styles.center}>
      <View style={[styles.circle, {backgroundColor: wanted ? colors.dangerSoft : colors.successSoft}]}>
        <Text style={[styles.symbol, {color: wanted ? colors.danger : colors.success}]}>{wanted ? '!' : '✓'}</Text>
      </View>
      <Text style={[styles.status, {color: wanted ? colors.danger : colors.success}]}>{wanted ? 'WANTED VEHICLE' : 'CLEAR'}</Text>
      <Text style={styles.number}>{vehicle.vehicleNumber}</Text>
      <View style={styles.card}>
        <Row label="Chassis" value={vehicle.chassisNumber} />
        <Row label="Engine" value={vehicle.engineNumber} />
        <Row label="Make / Model" value={`${vehicle.make || '-'} ${vehicle.model || ''}`.trim()} />
        <Row label="Dealer" value={vehicle.dealer?.name || '-'} />
      </View>
      {wanted && <Text style={styles.alertText}>Dealer alert has been created automatically.</Text>}
      <AppButton title="Search Another Vehicle" onPress={() => navigation.popToTop()} />
    </Screen>
  );
}

function Row({label, value}) {
  return <View style={styles.row}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  center: {alignItems: 'stretch', gap: 14},
  circle: {width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', alignSelf: 'center'},
  symbol: {fontSize: 52, fontWeight: '900', color: colors.muted},
  status: {textAlign: 'center', fontSize: 17, fontWeight: '900', letterSpacing: 1},
  title: {textAlign: 'center', fontSize: 24, fontWeight: '900', color: colors.text},
  sub: {textAlign: 'center', color: colors.muted, marginBottom: 12},
  number: {textAlign: 'center', fontSize: 30, fontWeight: '900', color: colors.text},
  card: {backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 18, paddingHorizontal: 16},
  row: {paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.border},
  label: {fontSize: 11, color: colors.muted},
  value: {fontSize: 15, fontWeight: '700', color: colors.text, marginTop: 4},
  alertText: {textAlign: 'center', color: colors.danger, fontWeight: '700'},
});
