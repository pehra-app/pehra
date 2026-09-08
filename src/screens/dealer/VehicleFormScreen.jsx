import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Screen from '../../components/Screen';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import api from '../../api/client';
import { colors } from '../../theme/colors';

const empty = {
  customerName: '',
  customerCnic: '',
  vehicleNumber: '',
  chassisNumber: '',
  engineNumber: '',
  make: '',
  model: '',
  year: '',
  color: '',
  status: 'CLEAR',
};

export default function VehicleFormScreen({ route, navigation }) {
  const vehicleId = route.params?.vehicleId;
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [customerBlocked, setCustomerBlocked] = useState(false);
  const set = (key, value) => setForm(v => ({ ...v, [key]: value }));

  useEffect(() => {
    if (vehicleId) {
      api
        .get(`/vehicles/${vehicleId}`)
        .then(({ data }) => {
          setForm({
            customerName: data.customerName || '',
            customerCnic: data.customerCnic || '',
            vehicleNumber: data.vehicleNumber || '',
            chassisNumber: data.chassisNumber || '',
            engineNumber: data.engineNumber || '',
            make: data.make || '',
            model: data.model || '',
            year: data.year ? String(data.year) : '',
            color: data.color || '',
            status: data.status || 'CLEAR',
          });
        })
        .catch(() => Alert.alert('Error', 'Could not load vehicle.'));
    }
  }, [vehicleId]);

  const checkCustomer = async () => {
    if (!form.customerName.trim() || !form.customerCnic.trim()) return;
    try {
      const { data } = await api.get('/vehicles/customer-match', {
        params: {
          customerName: form.customerName.trim(),
          customerCnic: form.customerCnic.trim(),
          ...(vehicleId ? { excludeId: vehicleId } : {}),
        },
      });
      if (data.matches?.length) {
        const match = data.matches[0];
        setCustomerBlocked(true);
        Alert.alert(
          'Wanted customer record',
          `${form.customerName.trim()} (${form.customerCnic.trim()}) has a wanted vehicle record.\n\nVehicle: ${
            match.vehicleNumber
          }\nChassis: ${match.chassisNumber}\nDealer: ${
            match.dealer?.name || 'Unknown dealer'
          }`,
        );
      }
    } catch {}
  };

  const submit = async () => {
    if (customerBlocked) return;
    if (
      !form.customerName.trim() ||
      !form.customerCnic.trim() ||
      !form.vehicleNumber ||
      !form.chassisNumber ||
      !form.engineNumber
    ) {
      return Alert.alert(
        'Required',
        'Customer name, CNIC, vehicle, chassis and engine numbers are required.',
      );
    }
    try {
      setLoading(true);
      const payload = {
        ...form,
        year: form.year ? Number(form.year) : undefined,
      };
      if (vehicleId) await api.put(`/vehicles/${vehicleId}`, payload);
      else await api.post('/vehicles', payload);
      Alert.alert('Saved', 'Vehicle record saved.');
      navigation.goBack();
    } catch (e) {
      if (e.response?.status === 409) setCustomerBlocked(true);
      Alert.alert(
        'Error',
        e.response?.data?.message || 'Could not save vehicle.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen contentStyle={{ gap: 13 }}>
      <Text style={styles.heading}>
        {vehicleId ? 'Edit vehicle' : 'New vehicle'}
      </Text>
      <AppInput
        label="Customer Name"
        value={form.customerName}
        onChangeText={v => set('customerName', v)}
        onBlur={checkCustomer}
        autoCapitalize="words"
        disabled={customerBlocked}
      />
      <AppInput
        label="Customer CNIC"
        value={form.customerCnic}
        onChangeText={v => set('customerCnic', v)}
        onBlur={checkCustomer}
        keyboardType="number-pad"
        placeholder="35202-1234567-1"
        disabled={customerBlocked}
      />
      <AppInput
        label="Vehicle Number / Registration Number"
        value={form.vehicleNumber}
        onChangeText={v => set('vehicleNumber', v.toUpperCase())}
        autoCapitalize="characters"
        disabled={customerBlocked}
      />
      <AppInput
        label="Chassis Number"
        value={form.chassisNumber}
        onChangeText={v => set('chassisNumber', v.toUpperCase())}
        autoCapitalize="characters"
        disabled={customerBlocked}
      />
      <AppInput
        label="Engine Number"
        value={form.engineNumber}
        onChangeText={v => set('engineNumber', v.toUpperCase())}
        autoCapitalize="characters"
        disabled={customerBlocked}
      />
      <AppInput
        label="Make (optional)"
        value={form.make}
        onChangeText={v => set('make', v)}
        disabled={customerBlocked}
      />
      <AppInput
        label="Model (optional)"
        value={form.model}
        onChangeText={v => set('model', v)}
        disabled={customerBlocked}
      />
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <AppInput
            label="Year"
            value={form.year}
            onChangeText={v => set('year', v)}
            keyboardType="number-pad"
            disabled={customerBlocked}
          />
        </View>
        <View style={{ flex: 1 }}>
          <AppInput
            label="Color"
            value={form.color}
            onChangeText={v => set('color', v)}
            disabled={customerBlocked}
          />
        </View>
      </View>
      <Text style={styles.label}>Vehicle Status</Text>
      <View style={styles.row}>
        {['CLEAR', 'WANTED'].map(status => (
          <Pressable
            key={status}
            disabled={customerBlocked}
            onPress={() => set('status', status)}
            style={[
              styles.choice,
              form.status === status &&
                (status === 'WANTED' ? styles.wanted : styles.clear),
              customerBlocked && styles.disabled,
            ]}
          >
            <Text
              style={[
                styles.choiceText,
                form.status === status && {
                  color: status === 'WANTED' ? colors.danger : colors.success,
                },
              ]}
            >
              {status}
            </Text>
          </Pressable>
        ))}
      </View>
      <AppButton
        title={vehicleId ? 'Update Vehicle' : 'Save Vehicle'}
        onPress={submit}
        loading={loading}
        disabled={customerBlocked}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 22, fontWeight: '900', color: colors.text },
  row: { flexDirection: 'row', gap: 10 },
  label: { fontSize: 13, fontWeight: '700', color: colors.text },
  choice: {
    flex: 1,
    paddingVertical: 13,
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
  },
  clear: { backgroundColor: colors.successSoft, borderColor: '#86EFAC' },
  wanted: { backgroundColor: colors.dangerSoft, borderColor: '#FCA5A5' },
  choiceText: { fontWeight: '900', color: colors.muted },
  disabled: { opacity: 0.55 },
});
