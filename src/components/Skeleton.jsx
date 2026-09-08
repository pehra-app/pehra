import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function Skeleton({
  width = '100%',
  height = 16,
  radius = 8,
  style,
}) {
  return (
    <View
      style={[styles.base, { width, height, borderRadius: radius }, style]}
    />
  );
}

export function SkeletonList({ count = 3, children }) {
  return Array.from({ length: count }, (_, index) => (
    <View key={index} style={styles.listItem}>
      {children || (
        <>
          <Skeleton width="58%" height={18} />
          <Skeleton width="82%" height={13} />
          <Skeleton width="70%" height={13} />
        </>
      )}
    </View>
  ));
}

const styles = StyleSheet.create({
  base: { backgroundColor: '#E5EAF2' },
  listItem: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5EAF2',
    borderRadius: 18,
    padding: 16,
    gap: 9,
  },
});
