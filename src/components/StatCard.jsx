import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors} from '../theme/colors';

export default function StatCard({label, value, tone = 'default'}) {
  const toneStyle =
    tone === 'danger' ? styles.danger :
    tone === 'success' ? styles.success : styles.default;
  return (
    <View style={[styles.card, toneStyle]}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {flex: 1, minWidth: 145, padding: 16, borderRadius: 18, borderWidth: 1},
  default: {backgroundColor: '#EEF4FF', borderColor: '#D9E5FF'},
  success: {backgroundColor: colors.successSoft, borderColor: '#BBF7D0'},
  danger: {backgroundColor: colors.dangerSoft, borderColor: '#FECACA'},
  value: {fontSize: 28, fontWeight: '800', color: colors.dark},
  label: {marginTop: 4, color: colors.muted, fontWeight: '600'},
});
