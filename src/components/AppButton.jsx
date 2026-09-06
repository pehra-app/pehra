import React from 'react';
import {ActivityIndicator, Pressable, StyleSheet, Text} from 'react-native';
import {colors} from '../theme/colors';

export default function AppButton({title, onPress, loading, variant = 'primary', disabled}) {
  const isSecondary = variant === 'secondary';
  const isDanger = variant === 'danger';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({pressed}) => [
        styles.button,
        isSecondary && styles.secondary,
        isDanger && styles.danger,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
      ]}>
      {loading ? (
        <ActivityIndicator color={isSecondary ? colors.primary : '#fff'} />
      ) : (
        <Text style={[styles.text, isSecondary && styles.secondaryText]}>{title}</Text>
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
  secondary: {backgroundColor: '#E8EEFF'},
  danger: {backgroundColor: colors.danger},
  disabled: {opacity: 0.55},
  pressed: {opacity: 0.88},
  text: {color: '#fff', fontWeight: '700', fontSize: 16},
  secondaryText: {color: colors.primary},
});
