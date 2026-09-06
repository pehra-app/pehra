import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors} from '../theme/colors';

export default function Screen({children, scroll = true, contentStyle}) {
  const body = scroll ? (
    <ScrollView contentContainerStyle={[styles.content, contentStyle]} keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, styles.flex, contentStyle]}>{children}</View>
  );

  return <SafeAreaView style={styles.safe}>{body}</SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.background},
  flex: {flex: 1},
  content: {padding: 16},
});
