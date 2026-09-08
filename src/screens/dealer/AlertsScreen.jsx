import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../../components/Screen';
import { SkeletonList } from '../../components/Skeleton';
import api from '../../api/client';
import { colors } from '../../theme/colors';

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/alerts');
      setAlerts(data);
    } catch (e) {
      Alert.alert(
        'Error',
        e.response?.data?.message || 'Could not load alerts.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const remove = alertId => {
    Alert.alert('Delete alert?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/alerts/${alertId}`);
            setAlerts(current =>
              current.filter(alert => alert._id !== alertId),
            );
          } catch (e) {
            Alert.alert(
              'Error',
              e.response?.data?.message || 'Could not delete alert.',
            );
          }
        },
      },
    ]);
  };

  return (
    <Screen scroll={false}>
      <FlatList
        contentContainerStyle={{ gap: 10, paddingBottom: 30 }}
        data={alerts}
        keyExtractor={a => a._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>Wanted vehicle located</Text>
            <Text style={styles.vehicle}>
              {item.vehicle?.vehicleNumber || 'Vehicle'}
            </Text>
            <Text style={styles.text}>{item.message}</Text>
            <Text style={styles.time}>
              {new Date(item.createdAt).toLocaleString()}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => remove(item._id)}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          loading ? (
            <SkeletonList count={3} />
          ) : (
            <Text style={styles.empty}>No alerts yet.</Text>
          )
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 18,
    padding: 16,
  },
  title: { fontWeight: '900', color: colors.danger },
  vehicle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
    marginTop: 6,
  },
  text: { color: colors.text, marginTop: 7, lineHeight: 20 },
  time: { fontSize: 11, color: colors.muted, marginTop: 10 },
  deleteButton: {
    alignSelf: 'flex-start',
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.danger,
  },
  deleteText: { color: '#fff', fontWeight: '800' },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 30 },
});
