import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Screen from '../../components/Screen';
import AppButton from '../../components/AppButton';
import {useAuth} from '../../context/AuthContext';
import {colors} from '../../theme/colors';

export default function ProfileScreen() {
  const {user, logout} = useAuth();
  return (
    <Screen>
      <View style={styles.card}>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.role}>{user.role}</Text>
      </View>
      <View style={{height: 16}} />
      <AppButton title="Logout" onPress={logout} variant="danger" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: 18},
  name: {fontSize: 21, fontWeight: '800', color: colors.text},
  email: {marginTop: 4, color: colors.muted},
  role: {marginTop: 12, alignSelf: 'flex-start', color: colors.primary, fontWeight: '800'},
});
