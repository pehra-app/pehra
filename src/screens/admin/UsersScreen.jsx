import React, {useCallback, useState} from 'react';
import {Alert, FlatList, Pressable, StyleSheet, Text, View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import Screen from '../../components/Screen';
import AppButton from '../../components/AppButton';
import api from '../../api/client';
import {colors} from '../../theme/colors';

export default function UsersScreen({navigation}) {
  const [users, setUsers] = useState([]);

  const load = useCallback(async () => {
    try {
      const {data} = await api.get('/users');
      setUsers(data);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Could not load users.');
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const toggle = async user => {
    try {
      await api.patch(`/users/${user._id}/status`, {isActive: !user.isActive});
      load();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Could not update account.');
    }
  };

  return (
    <Screen scroll={false}>
      <AppButton title="+ Create Dealer / Agent" onPress={() => navigation.navigate('CreateUser')} />
      <FlatList
        style={{marginTop: 14}}
        contentContainerStyle={{gap: 10, paddingBottom: 30}}
        data={users}
        keyExtractor={item => item._id}
        renderItem={({item}) => (
          <View style={styles.card}>
            <View style={{flex: 1}}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>{item.email}</Text>
              <Text style={styles.role}>{item.role}</Text>
            </View>
            <Pressable onPress={() => toggle(item)} style={[styles.status, item.isActive ? styles.active : styles.inactive]}>
              <Text style={{fontWeight: '800', color: item.isActive ? colors.success : colors.danger}}>
                {item.isActive ? 'Active' : 'Inactive'}
              </Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No Dealer or Agent accounts yet.</Text>}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 15, flexDirection: 'row', gap: 10},
  name: {fontWeight: '800', color: colors.text, fontSize: 16},
  meta: {color: colors.muted, marginTop: 3},
  role: {color: colors.primary, fontWeight: '800', marginTop: 8, fontSize: 12},
  status: {paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999, alignSelf: 'flex-start'},
  active: {backgroundColor: colors.successSoft},
  inactive: {backgroundColor: colors.dangerSoft},
  empty: {textAlign: 'center', color: colors.muted, marginTop: 30},
});
