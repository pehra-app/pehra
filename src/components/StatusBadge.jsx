import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors} from '../theme/colors';

export default function StatusBadge({status}) {
  const wanted = status === 'WANTED';
  return (
    <View style={[styles.badge, wanted ? styles.wanted : styles.clear]}>
      <Text style={[styles.text, {color: wanted ? colors.danger : colors.success}]}>
        {wanted ? 'WANTED' : 'CLEAR'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999},
  wanted: {backgroundColor: colors.dangerSoft},
  clear: {backgroundColor: colors.successSoft},
  text: {fontSize: 12, fontWeight: '800'},
});
