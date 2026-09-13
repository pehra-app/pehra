import React, { useState } from 'react';
import { Alert, Image, StyleSheet, Text, View } from 'react-native';
import Screen from '../../components/Screen';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password)
      return Alert.alert('Missing details', 'Enter email and password.');
    try {
      setLoading(true);
      await login(email.trim().toLowerCase(), password);
    } catch (e) {
      Alert.alert(
        'Login failed',
        e.response?.data?.message ||
          'Check your credentials and backend connection.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen contentStyle={styles.page} keyboardAvoiding>
      <View style={styles.hero}>
        <Image
          accessibilityLabel="Pehra"
          resizeMode="contain"
          source={require('../../assets/pehra-logo.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>Pehra</Text>
        <Text style={styles.subtitle}>
          Vehicle lookup and dealer alert system
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sign in</Text>
        <AppInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <AppInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <AppButton title="Continue" onPress={submit} loading={loading} />
        <Text style={styles.note}>
          Accounts are created by an Admin. There is no self-registration.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: { flexGrow: 1, justifyContent: 'center', gap: 28 },
  hero: { alignItems: 'center' },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 22,
  },
  title: { marginTop: 14, fontSize: 32, fontWeight: '900', color: colors.text },
  subtitle: { marginTop: 5, color: colors.muted, textAlign: 'center' },
  card: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 22,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  note: {
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
