import React from 'react';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/colors';

export default function AppInput({ label, secureTextEntry, style, ...props }) {
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <View style={styles.wrap}>
      {!!label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        {...props}
        placeholderTextColor="#9CA3AF"
        secureTextEntry={secureTextEntry && !passwordVisible}
        style={[
          styles.input,
          secureTextEntry && styles.passwordInput,
          props.multiline && styles.multiline,
          style,
        ]}
      />
      {secureTextEntry && (
        <Pressable
          accessibilityLabel={
            passwordVisible ? 'Hide password' : 'Show password'
          }
          accessibilityRole="button"
          accessibilityState={{ checked: passwordVisible }}
          hitSlop={8}
          onPress={() => setPasswordVisible(visible => !visible)}
          style={styles.visibilityButton}
        >
          <Ionicons
            name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
            size={21}
            color={colors.muted}
          />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 7 },
  label: { fontSize: 13, fontWeight: '700', color: colors.text },
  visibilityButton: { position: 'absolute', right: 14, bottom: 14 },
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
  passwordInput: { paddingRight: 48 },
  multiline: { minHeight: 110, paddingTop: 14, textAlignVertical: 'top' },
});
