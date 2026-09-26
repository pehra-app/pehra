import React, { useCallback, useMemo, useState } from 'react';
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

export default function AlertsScreen({ navigation }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const unreadCount = useMemo(
    () => alerts.filter(alert => !alert.read).length,
    [alerts],
  );

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

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        headerRight: () => (
          <Pressable
            accessibilityRole="button"
            onPress={async () => {
              try {
                await api.patch('/alerts/read-all', {
                  read: unreadCount === 0,
                });
                await load();
              } catch (e) {
                Alert.alert(
                  'Error',
                  e.response?.data?.message || 'Could not update alerts.',
                );
              }
            }}
            style={styles.headerAction}
          >
            <Text style={styles.headerActionText}>
              {unreadCount > 0 ? 'Mark all read' : 'Mark all unread'}
            </Text>
          </Pressable>
        ),
      });
    }, [load, navigation, unreadCount]),
  );

  const markAlertRead = async alertId => {
    try {
      await api.patch(`/alerts/${alertId}/read`);
      setAlerts(current =>
        current.map(alert =>
          alert._id === alertId ? { ...alert, read: true } : alert,
        ),
      );
    } catch (e) {
      Alert.alert(
        'Error',
        e.response?.data?.message || 'Could not update alert.',
      );
    }
  };

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
          <Pressable
            accessibilityRole="button"
            onPress={() => markAlertRead(item._id)}
            style={[styles.card, !item.read && styles.unreadCard]}
          >
            <Text style={styles.title}>Wanted vehicle located</Text>
            {!item.read && <Text style={styles.unreadBadge}>Unread</Text>}
            <Text style={styles.vehicle}>
              {item.vehicle?.vehicleNumber || 'Vehicle'}
            </Text>
            <Text style={styles.text}>{item.message}</Text>
            <Text style={styles.time}>
              {new Date(item.createdAt).toLocaleString()}
            </Text>
            <View style={styles.actionsRow}>
              <Pressable
                accessibilityRole="button"
                onPress={() => remove(item._id)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </Pressable>
              {!item.read && (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => markAlertRead(item._id)}
                  style={styles.readButton}
                >
                  <Text style={styles.readText}>Mark read</Text>
                </Pressable>
              )}
            </View>
          </Pressable>
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
  unreadCard: {
    borderColor: colors.danger,
    backgroundColor: '#FEE2E2',
  },
  title: { fontWeight: '900', color: colors.danger },
  unreadBadge: {
    alignSelf: 'flex-start',
    marginTop: 6,
    backgroundColor: colors.danger,
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  vehicle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
    marginTop: 6,
  },
  text: { color: colors.text, marginTop: 7, lineHeight: 20 },
  time: { fontSize: 11, color: colors.muted, marginTop: 10 },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginTop: 14,
    flexWrap: 'wrap',
  },
  deleteButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.danger,
  },
  deleteText: { color: '#fff', fontWeight: '800' },
  readButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  readText: { color: '#fff', fontWeight: '800' },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 30 },
  headerAction: {
    marginRight: 14,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  headerActionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
});
