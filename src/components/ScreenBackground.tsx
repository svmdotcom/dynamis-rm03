import React from 'react';
import { SafeAreaView, View, ImageBackground, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

const woodImage = require('../../assets/backgrounds/wood.jpeg');

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function ScreenBackground({ children, style }: Props) {
  const { theme, themeName } = useTheme();

  if (themeName === 'wood') {
    return (
      <ImageBackground source={woodImage} style={styles.fill} resizeMode="cover">
        <View style={styles.overlay}>
          <SafeAreaView style={[styles.fill, style]}>
            {children}
          </SafeAreaView>
        </View>
      </ImageBackground>
    );
  }

  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: theme.bg }, style]}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 10, 0, 0.42)',
  },
});
