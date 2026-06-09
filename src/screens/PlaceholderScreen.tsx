import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { ScreenHeader } from '../components/ScreenHeader';
import { ScreenBottomNav } from '../components/ScreenBottomNav';
import { ScreenBackground } from '../components/ScreenBackground';

export function PlaceholderScreen() {
  const route = useRoute();
  const { theme } = useTheme();

  return (
    <ScreenBackground style={styles.container}>
      <ScreenHeader title={route.name} />
      <View style={styles.spacer} />
      <ScreenBottomNav />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  spacer: { flex: 1 },
});
