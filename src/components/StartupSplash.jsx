import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

export default function StartupSplash() {
  return (
    <View style={styles.container}>
      <Image
        accessibilityLabel="Pehra"
        resizeMode="contain"
        source={require('../assets/pehra-logo.png')}
        style={styles.logo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#002864',
    flex: 1,
    justifyContent: 'center',
  },
  logo: {
    height: 280,
    width: 280,
  },
});
