import React, {useEffect, useState} from 'react';
import {Alert, Pressable, StyleSheet, Text, View} from 'react-native';
import Screen from '../../components/Screen';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import api from '../../api/client';
import {colors} from '../../theme/colors';

const empty = {
  vehicleNumber: '',
  chassisNumber: '',
  engineNumber: '',
  make: '',
  model: '',
  year: '',
  color: '',
  status: 'CLEAR',
};

export default function VehicleFormScreen({route, navigation}) {
  const vehicleId = route.params?.vehicleId;
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const set = (key, value) => setForm(v => ({...v, [key]: value}));

  useEffect(() => {
    if (vehicleId) {
      api.get(`/vehicles/${vehicleId}`).then(({data}) => {
        setForm({
          vehicleNumber: data.vehicleNumber || '',
          chassisNumber: data.chassisNumber || '',
          engineNumber: data.engineNumber || '',
          make: data.make || '',
          model: data.model || '',
          year: data.year ? String(data.year) : '',
          color: data.color || '',
          status: data.status || 'CLEAR',
        });
      }).catch(() => Alert.alert('Error', 'Could not load vehicle.'));
    }
  }, [vehicleId]);

  const submit = async () => {
    if (!form.vehicleNumber || !form.chassisNumber || !form.engineNumber) {
      return Alert.alert('Required', 'Vehicle, chassis and engine numbers are required.');
    }
    try {
      setLoading(true);
      const payload = {...form, year: form.year ? Number(form.year) : undefined};
      if (vehicleId) await api.put(`/vehicles/${vehicleId}`, payload);
      else await api.post('/vehicles', payload);
      Alert.alert('Saved', 'Vehicle record saved.');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Could not save vehicle.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen contentStyle={{gap: 13}}>
      <Text style={styles.heading}>{vehicleId ? 'Edit vehicle' : 'New vehicle'}</Text>
      <AppInput label="Vehicle Number / Registration Number" value={form.vehicleNumber} onChangeText={v => set('vehicleNumber', v.toUpperCase())} autoCapitalize="characters" />
      <AppInput label="Chassis Number" value={form.chassisNumber} onChangeText={v => set('chassisNumber', v.toUpperCase())} autoCapitalize="characters" />
      <AppInput label="Engine Number" value={form.engineNumber} onChangeText={v => set('engineNumber', v.toUpperCase())} autoCapitalize="characters" />
      <AppInput label="Make (optional)" value={form.make} onChangeText={v => set('make', v)} />
      <AppInput label="Model (optional)" value={form.model} onChangeText={v => set('model', v)} />
      <View style={styles.row}>
        <View style={{flex: 1}}><AppInput label="Year" value={form.year} onChangeText={v => set('year', v)} keyboardType="number-pad" /></View>
        <View style={{flex: 1}}><AppInput label="Color" value={form.color} onChangeText={v => set('color', v)} /></View>
      </View>
      <Text style={styles.label}>Vehicle Status</Text>
      <View style={styles.row}>
        {['CLEAR', 'WANTED'].map(status => (
          <Pressable key={status} onPress={() => set('status', status)} style={[styles.choice, form.status === status && (status === 'WANTED' ? styles.wanted : styles.clear)]}>
            <Text style={[styles.choiceText, form.status === status && {color: status === 'WANTED' ? colors.danger : colors.success}]}>{status}</Text>
          </Pressable>
        ))}
      </View>
      <AppButton title={vehicleId ? 'Update Vehicle' : 'Save Vehicle'} onPress={submit} loading={loading} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: {fontSize: 22, fontWeight: '900', color: colors.text},
  row: {flexDirection: 'row', gap: 10},
  label: {fontSize: 13, fontWeight: '700', color: colors.text},
  choice: {flex: 1, paddingVertical: 13, alignItems: 'center', borderRadius: 14, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border},
  clear: {backgroundColor: colors.successSoft, borderColor: '#86EFAC'},
  wanted: {backgroundColor: colors.dangerSoft, borderColor: '#FCA5A5'},
  choiceText: {fontWeight: '900', color: colors.muted},
});
