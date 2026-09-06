import React, {useState} from 'react';
import {Alert, Pressable, StyleSheet, Text, View} from 'react-native';
import Screen from '../../components/Screen';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import api from '../../api/client';
import {colors} from '../../theme/colors';

export default function CreateUserScreen({navigation}) {
  const [form, setForm] = useState({name: '', email: '', password: '', phone: '', role: 'DEALER'});
  const [loading, setLoading] = useState(false);
  const set = (key, value) => setForm(v => ({...v, [key]: value}));

  const submit = async () => {
    if (!form.name || !form.email || !form.password) return Alert.alert('Required', 'Name, email and password are required.');
    try {
      setLoading(true);
      await api.post('/users', {...form, email: form.email.trim().toLowerCase()});
      Alert.alert('Created', `${form.role} account created.`);
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Could not create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen contentStyle={{gap: 14}}>
      <View style={styles.roleRow}>
        {['DEALER', 'AGENT'].map(role => (
          <Pressable key={role} onPress={() => set('role', role)} style={[styles.role, form.role === role && styles.selected]}>
            <Text style={[styles.roleText, form.role === role && styles.selectedText]}>{role}</Text>
          </Pressable>
        ))}
      </View>
      <AppInput label="Full name" value={form.name} onChangeText={v => set('name', v)} />
      <AppInput label="Email" value={form.email} onChangeText={v => set('email', v)} autoCapitalize="none" keyboardType="email-address" />
      <AppInput label="Phone (optional)" value={form.phone} onChangeText={v => set('phone', v)} keyboardType="phone-pad" />
      <AppInput label="Initial password" value={form.password} onChangeText={v => set('password', v)} secureTextEntry />
      <AppButton title="Create Account" onPress={submit} loading={loading} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  roleRow: {flexDirection: 'row', gap: 10},
  role: {flex: 1, paddingVertical: 13, alignItems: 'center', borderRadius: 14, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border},
  selected: {backgroundColor: '#E8EEFF', borderColor: colors.primary},
  roleText: {fontWeight: '800', color: colors.muted},
  selectedText: {color: colors.primary},
});
