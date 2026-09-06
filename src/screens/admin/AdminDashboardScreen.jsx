import React, {useCallback, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import Screen from '../../components/Screen';
import StatCard from '../../components/StatCard';
import api from '../../api/client';
import {useAuth} from '../../context/AuthContext';
import {colors} from '../../theme/colors';

export default function AdminDashboardScreen({navigation}) {
  const {logout} = useAuth();
  const [stats, setStats] = useState({dealers: 0, agents: 0, vehicles: 0, wanted: 0});

  useFocusEffect(useCallback(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).catch(() => {});
  }, []));

  const actions = [
    ['Manage Accounts', 'Create, view and activate users', () => navigation.navigate('Users')],
    ['All Vehicles', 'View and manage vehicle records', () => navigation.navigate('AdminVehicles')],
    ['Search Vehicle', 'Use the same lookup available to Agents', () => navigation.navigate('AgentSearch')],
  ];

  return (
    <Screen>
      <View style={styles.header}>
        <View><Text style={styles.eyebrow}>ADMIN CONTROL</Text><Text style={styles.title}>Pehra overview</Text></View>
        <Pressable onPress={logout}><Text style={styles.logout}>Logout</Text></Pressable>
      </View>
      <View style={styles.stats}>
        <StatCard label="Dealers" value={stats.dealers} />
        <StatCard label="Agents" value={stats.agents} />
        <StatCard label="Vehicles" value={stats.vehicles} tone="success" />
        <StatCard label="Wanted" value={stats.wanted} tone="danger" />
      </View>
      <Text style={styles.section}>Admin actions</Text>
      <View style={styles.list}>
        {actions.map(([title, subtitle, onPress]) => (
          <Pressable key={title} onPress={onPress} style={styles.action}>
            <View style={{flex: 1}}><Text style={styles.actionTitle}>{title}</Text><Text style={styles.actionSub}>{subtitle}</Text></View>
            <Text style={styles.arrow}>›</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  eyebrow: {fontSize: 11, fontWeight: '900', color: colors.primary, letterSpacing: 1},
  title: {fontSize: 26, fontWeight: '900', color: colors.text, marginTop: 4},
  logout: {color: colors.danger, fontWeight: '800'},
  stats: {flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 20},
  section: {marginTop: 26, marginBottom: 10, fontSize: 16, fontWeight: '800', color: colors.text},
  list: {gap: 10},
  action: {flexDirection: 'row', backgroundColor: '#fff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.border, alignItems: 'center'},
  actionTitle: {fontWeight: '800', color: colors.text},
  actionSub: {fontSize: 12, color: colors.muted, marginTop: 4},
  arrow: {fontSize: 28, color: colors.muted},
});
