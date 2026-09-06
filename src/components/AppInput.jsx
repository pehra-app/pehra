import React from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import {colors} from '../theme/colors';

export default function AppInput({label, ...props}) {
  return (
    <View style={styles.wrap}>
      {!!label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        placeholderTextColor="#9CA3AF"
        style={[styles.input, props.multiline && styles.multiline]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {gap: 7},
  label: {fontSize: 13, fontWeight: '700', color: colors.text},
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    minHeight: 50,
    paddingHorizontal: 14,
    color: colors.text,
    fontSize: 15,
  },
  multiline: {minHeight: 110, paddingTop: 14, textAlignVertical: 'top'},
});
