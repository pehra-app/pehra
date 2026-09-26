import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Screen from '../../components/Screen';
import StatCard from '../../components/StatCard';
import Skeleton from '../../components/Skeleton';
import api from '../../api/client';
import { colors } from '../../theme/colors';
import { getUnreadAlertCount } from '../../utils/alertUtils';

export default function DealerDashboardScreen({ navigation }) {
  const [stats, setStats] = useState({
    total: 0,
    clear: 0,
    wanted: 0,
    alerts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [unreadAlertCount, setUnreadAlertCount] = useState(0);

  const loadAlerts = useCallback(async () => {
    try {
      const { data } = await api.get('/alerts');
      setUnreadAlertCount(getUnreadAlertCount(data));
    } catch (error) {
      setUnreadAlertCount(0);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      Promise.all([
        api.get('/dealer/stats').then(r => setStats(r.data)),
        loadAlerts(),
      ])
        .catch(() => {})
        .finally(() => setLoading(false));

      navigation.setOptions({
        headerRight: () => (
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('Alerts')}
            style={styles.headerButton}
          >
            <Ionicons name="notifications-outline" size={22} color="#fff" />
            {unreadAlertCount > 0 && (
              <View style={styles.badgeWrap}>
                <Text style={styles.badgeText}>{unreadAlertCount}</Text>
              </View>
            )}
          </Pressable>
        ),
      });
    }, [loadAlerts, navigation, unreadAlertCount]),
  );

  return (
    <Screen>
      <Text style={styles.eyebrow}>DEALER</Text>
      <Text style={styles.title}>Vehicle control</Text>
      <Text style={styles.subtitle}>
        Keep your vehicle records simple and searchable.
      </Text>
      <View style={styles.stats}>
        {loading ? (
          [1, 2, 3, 4].map(item => (
            <Skeleton
              key={item}
              height={80}
              radius={18}
              style={styles.statSkeleton}
            />
          ))
        ) : (
          <>
            <StatCard label="Total" value={stats.total} />
            {/* <StatCard label="Clear" value={stats.clear} tone="success" /> */}
            <StatCard label="Wanted" value={stats.wanted} tone="danger" />
            <StatCard label="Alerts" value={stats.alerts} />
          </>
        )}
      </View>
      <Pressable
        onPress={() => navigation.navigate('Vehicles')}
        style={styles.cta}
      >
        <Text style={styles.ctaTitle}>Manage vehicles</Text>
        <Text style={styles.ctaText}>
          Add, edit, delete or mark a vehicle wanted.
        </Text>
      </Pressable>
      <Pressable
        onPress={() => navigation.navigate('Wanted')}
        style={styles.warningCard}
      >
        <Text style={styles.warningTitle}>Defaulter / Wanted Customers</Text>
        <Text style={styles.warningText}>
          Review flagged customer records before creating a vehicle record.
        </Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 1,
  },
  title: { fontSize: 28, fontWeight: '900', color: colors.text, marginTop: 5 },
  subtitle: { color: colors.muted, marginTop: 5 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 22 },
  statSkeleton: { flex: 1, minWidth: 145 },
  cta: {
    marginTop: 22,
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 20,
  },
  ctaTitle: { fontSize: 18, fontWeight: '900', color: '#fff' },
  ctaText: { marginTop: 5, color: '#DDE7FF' },
  warningCard: {
    marginTop: 12,
    backgroundColor: colors.warningSoft,
    borderColor: '#FCD34D',
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  warningTitle: { color: colors.warning, fontSize: 18, fontWeight: '900' },
  warningText: { color: '#92400E', marginTop: 5 },
  headerButton: {
    position: 'relative',
    marginRight: 14,
    padding: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  badgeWrap: {
    position: 'absolute',
    right: -2,
    top: -4,
    backgroundColor: '#F43F5E',
    minWidth: 18,
    height: 18,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
});
