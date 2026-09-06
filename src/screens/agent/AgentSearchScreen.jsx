import React, {useState} from 'react';
import {Alert, Pressable, StyleSheet, Text, View} from 'react-native';
import Screen from '../../components/Screen';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import api from '../../api/client';
import {colors} from '../../theme/colors';

const options = [
  ['vehicleNumber', 'Vehicle Number'],
  ['chassisNumber', 'Chassis Number'],
  ['engineNumber', 'Engine Number'],
];

export default function AgentSearchScreen({navigation}) {
  const [field, setField] = useState('vehicleNumber');
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!value.trim()) return Alert.alert('Required', 'Enter a value to search.');
    try {
      setLoading(true);
      const {data} = await api.get('/search', {params: {field, value: value.trim()}});
      navigation.navigate('SearchResult', {result: data});
    } catch (e) {
      if (e.response?.status === 404) {
        navigation.navigate('SearchResult', {result: {found: false, searchedValue: value.trim()}});
      } else {
        Alert.alert('Search failed', e.response?.data?.message || 'Could not search vehicle.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen contentStyle={{gap: 16}}>
      <Text style={styles.title}>Choose search type</Text>
      <View style={styles.options}>
        {options.map(([key, label]) => (
          <Pressable key={key} onPress={() => {setField(key); setValue('');}} style={[styles.option, field === key && styles.selected]}>
            <Text style={[styles.optionText, field === key && styles.selectedText]}>{label}</Text>
          </Pressable>
        ))}
      </View>
      <AppInput label={options.find(x => x[0] === field)[1]} value={value} onChangeText={v => setValue(v.toUpperCase())} autoCapitalize="characters" placeholder="Enter exact number" />
      <AppButton title="Search Vehicle" onPress={submit} loading={loading} />
      <Text style={styles.note}>If a matching vehicle is marked WANTED, Pehra automatically records the lookup and alerts the Dealer.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {fontSize: 20, fontWeight: '900', color: colors.text},
  options: {gap: 8},
  option: {backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 14},
  selected: {backgroundColor: '#E8EEFF', borderColor: colors.primary},
  optionText: {fontWeight: '700', color: colors.text},
  selectedText: {color: colors.primary},
  note: {color: colors.muted, lineHeight: 19, fontSize: 12},
});
