import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../../components/Screen';
import StatCard from '../../components/StatCard';
import Skeleton from '../../components/Skeleton';
import api from '../../api/client';
import { colors } from '../../theme/colors';

export default function AgentDashboardScreen({ navigation }) {
  const [stats, setStats] = useState({ wanted: 0, dealers: 0 });
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      api
        .get('/agent/stats')
        .then(({ data }) => setStats(data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, []),
  );

  return (
    <Screen contentStyle={styles.page}>
      <View>
        <Text style={styles.eyebrow}>FIELD AGENT</Text>
        <Text style={styles.title}>Fast vehicle lookup</Text>
        <Text style={styles.subtitle}>
          Search, review and download the dealer network.
        </Text>
      </View>
      <View style={styles.stats}>
        {loading ? (
          <>
            <Skeleton height={80} radius={18} style={styles.stat} />
            <Skeleton height={80} radius={18} style={styles.stat} />
          </>
        ) : (
          <>
            <Pressable
              style={styles.stat}
              onPress={() => navigation.navigate('AgentWantedVehicles')}
            >
              <StatCard
                label="Total Wanted Vehicles"
                value={stats.wanted}
                tone="danger"
              />
            </Pressable>
            <Pressable
              style={styles.stat}
              onPress={() => navigation.navigate('AgentDealers')}
            >
              <StatCard label="Total Dealers" value={stats.dealers} />
            </Pressable>
          </>
        )}
      </View>
      <Pressable
        onPress={() => navigation.navigate('AgentSearch')}
        style={styles.searchCard}
      >
        <Text style={styles.icon}>⌕</Text>
        <Text style={styles.cardTitle}>Search a vehicle</Text>
        <Text style={styles.cardText}>
          Vehicle Number, Chassis Number or Engine Number
        </Text>
      </Pressable>
      <Pressable
        onPress={() => navigation.navigate('Profile')}
        style={styles.profile}
      >
        <Text style={styles.profileText}>My profile</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: { gap: 22 },
  eyebrow: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 1,
  },
  title: { fontSize: 30, fontWeight: '900', color: colors.text, marginTop: 6 },
  subtitle: { color: colors.muted, marginTop: 7, lineHeight: 20 },
  searchCard: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    padding: 22,
    minHeight: 220,
    justifyContent: 'flex-end',
  },
  icon: { fontSize: 60, color: '#fff', marginBottom: 'auto' },
  cardTitle: { fontSize: 23, fontWeight: '900', color: '#fff' },
  cardText: { color: '#DDE7FF', marginTop: 6, lineHeight: 20 },
  profile: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 15,
  },
  profileText: { textAlign: 'center', fontWeight: '800', color: colors.text },
  stats: { flexDirection: 'row', gap: 10 },
  stat: { flex: 1 },
});
