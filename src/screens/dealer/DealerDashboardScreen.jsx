import React, {useCallback, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import Screen from '../../components/Screen';
import StatCard from '../../components/StatCard';
import api from '../../api/client';
import {colors} from '../../theme/colors';

export default function DealerDashboardScreen({navigation}) {
  const [stats, setStats] = useState({total: 0, clear: 0, wanted: 0, alerts: 0});

  useFocusEffect(useCallback(() => {
    api.get('/dealer/stats').then(r => setStats(r.data)).catch(() => {});
  }, []));

  return (
    <Screen>
      <Text style={styles.eyebrow}>DEALER</Text>
      <Text style={styles.title}>Vehicle control</Text>
      <Text style={styles.subtitle}>Keep your vehicle records simple and searchable.</Text>
      <View style={styles.stats}>
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Clear" value={stats.clear} tone="success" />
        <StatCard label="Wanted" value={stats.wanted} tone="danger" />
        <StatCard label="Alerts" value={stats.alerts} />
      </View>
      <Pressable onPress={() => navigation.navigate('Vehicles')} style={styles.cta}>
        <Text style={styles.ctaTitle}>Manage vehicles</Text>
        <Text style={styles.ctaText}>Add, edit, delete or mark a vehicle wanted.</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: {fontSize: 11, fontWeight: '900', color: colors.primary, letterSpacing: 1},
  title: {fontSize: 28, fontWeight: '900', color: colors.text, marginTop: 5},
  subtitle: {color: colors.muted, marginTop: 5},
  stats: {flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 22},
  cta: {marginTop: 22, backgroundColor: colors.primary, borderRadius: 20, padding: 20},
  ctaTitle: {fontSize: 18, fontWeight: '900', color: '#fff'},
  ctaText: {marginTop: 5, color: '#DDE7FF'},
});
