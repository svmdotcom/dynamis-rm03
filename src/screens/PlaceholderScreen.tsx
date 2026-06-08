import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function PlaceholderScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Dynamis RM03 OK</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#000000',
    fontSize: 28,
  },
});
