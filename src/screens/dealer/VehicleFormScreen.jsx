import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Screen from '../../components/Screen';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import Skeleton from '../../components/Skeleton';
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
  const [initialLoading, setInitialLoading] = useState(Boolean(vehicleId));
  const [customerBlocked, setCustomerBlocked] = useState(false);
  const [wantedMatch, setWantedMatch] = useState(null);
  const set = (key, value) => setForm(v => ({ ...v, [key]: value }));

  useEffect(() => {
    const customerCnic = form.customerCnic.trim();
    if (!customerCnic) {
      setWantedMatch(null);
      setCustomerBlocked(false);
      return undefined;
    }

    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get('/vehicles/customer-match', {
          params: {
            customerCnic,
            ...(vehicleId ? { excludeId: vehicleId } : {}),
          },
        });
        const match = data.matches?.[0] || null;
        setWantedMatch(match);
        setCustomerBlocked(Boolean(match));
        if (match) {
          Alert.alert(
            'Wanted customer detected',
            `CNIC ${customerCnic} matches a wanted customer record.\n\nVehicle: ${
              match.vehicleNumber
            }\nDealer: ${match.dealer?.name || 'Unknown dealer'}`,
          );
        }
      } catch {}
    }, 350);

    return () => clearTimeout(timer);
  }, [form.customerCnic, vehicleId]);

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
        .catch(() => Alert.alert('Error', 'Could not load vehicle.'))
        .finally(() => setInitialLoading(false));
    }
  }, [vehicleId]);

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

  if (initialLoading) {
    return (
      <Screen contentStyle={{ gap: 13 }}>
        <Skeleton width="45%" height={27} />
        <Skeleton height={72} />
        <Skeleton height={72} />
        <Skeleton height={72} />
        <Skeleton height={72} />
        <Skeleton height={72} />
        <Skeleton height={50} radius={14} />
      </Screen>
    );
  }

  return (
    <Screen contentStyle={{ gap: 13 }}>
      <Text style={styles.heading}>
        {vehicleId ? 'Edit vehicle' : 'New vehicle'}
      </Text>
      <AppInput
        label="Customer Name"
        value={form.customerName}
        onChangeText={v => set('customerName', v)}
        autoCapitalize="words"
        disabled={customerBlocked}
      />
      <AppInput
        label="Customer CNIC"
        value={form.customerCnic}
        onChangeText={v => {
          set('customerCnic', v);
          setWantedMatch(null);
          setCustomerBlocked(false);
        }}
        keyboardType="number-pad"
        placeholder="35202-1234567-1"
      />
      {wantedMatch && (
        <View style={styles.warning}>
          <Text style={styles.warningTitle}>WANTED / DEFAULTER CUSTOMER</Text>
          <Text style={styles.warningText}>
            This CNIC matches a wanted customer record. Vehicle{' '}
            {wantedMatch.vehicleNumber} is registered by{' '}
            {wantedMatch.dealer?.name || 'another dealer'}.
          </Text>
        </View>
      )}
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
  warning: {
    backgroundColor: colors.dangerSoft,
    borderColor: '#FCA5A5',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 5,
  },
  warningTitle: { color: colors.danger, fontWeight: '900', fontSize: 13 },
  warningText: { color: '#991B1B', lineHeight: 19 },
});
