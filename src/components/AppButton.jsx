import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';

export default function AppButton({
  title,
  onPress,
  loading,
  variant = 'primary',
  disabled,
  style,
}) {
  const isSecondary = variant === 'secondary';
  const isDanger = variant === 'danger';
  const isOrange = variant === 'orange';
  const isLight = isSecondary || isOrange; // light backgrounds use dark text

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        isSecondary && styles.secondary,
        isDanger && styles.danger,
        isOrange && styles.orange,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isLight ? colors.primary : '#fff'} />
      ) : (
        <Text
          style={[
            styles.text,
            isSecondary && styles.secondaryText,
            isOrange && styles.orangeText,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
  },
  secondary: { backgroundColor: '#E8EEFF' },
  danger: { backgroundColor: colors.danger },
  orange: { backgroundColor: 'orange' },
  disabled: { opacity: 0.55 },
  pressed: { opacity: 0.88 },
  text: { color: '#fff', fontWeight: '700', fontSize: 16 },
  secondaryText: { color: colors.primary },
  orangeText: { color: '#fff' },
});
