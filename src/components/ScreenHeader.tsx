import React from 'react';
import { View, Text, StyleSheet, Platform, StatusBar } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface Props {
  title: string;
}

const TOP_INSET = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0;

export function ScreenHeader({ title }: Props) {
  const { theme } = useTheme();

  return (
    <View style={[styles.header, { borderBottomColor: theme.borderLight }]}>
      <Text style={[styles.title, { color: theme.textPrimary }]} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: TOP_INSET + 10,
    paddingBottom: 12,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
});
