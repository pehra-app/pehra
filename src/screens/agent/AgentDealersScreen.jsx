import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Share, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../../components/Screen';
import AppButton from '../../components/AppButton';
import { SkeletonList } from '../../components/Skeleton';
import api from '../../api/client';
import { colors } from '../../theme/colors';

export default function AgentDealersScreen({ navigation }) {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      setDealers((await api.get('/users')).data);
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Could not load dealers.',
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
  const download = () =>
    Share.share({
      title: 'Pehra Dealer Records',
      message: [
        'Dealer Name,Email,Phone,Status',
        ...dealers.map(
          dealer =>
            `"${dealer.name || ''}","${dealer.email || ''}","${
              dealer.phone || ''
            }","${dealer.isActive ? 'Active' : 'Inactive'}"`,
        ),
      ].join('\n'),
    });
  return (
    <Screen scroll={false}>
      <AppButton
        title="Download All"
        onPress={download}
        disabled={!dealers.length}
      />
      <FlatList
        style={{ marginTop: 14 }}
        contentContainerStyle={{ gap: 10, paddingBottom: 30 }}
        data={dealers}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>
              {item.email}
              {item.phone ? ` • ${item.phone}` : ''}
            </Text>
            <AppButton
              title="View Records"
              variant="secondary"
              onPress={() =>
                navigation.navigate('AgentDealerRecords', {
                  dealerId: item._id,
                  dealerName: item.name,
                })
              }
            />
          </View>
        )}
        ListEmptyComponent={
          loading ? (
            <SkeletonList count={4} />
          ) : (
            <Text style={styles.empty}>No dealers found.</Text>
          )
        }
      />
    </Screen>
  );
}
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 16,
    gap: 8,
  },
  name: { fontSize: 18, fontWeight: '800', color: colors.text },
  meta: { color: colors.muted },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 30 },
});
