import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n';

const HIT_SLOP = { top: 16, bottom: 16, left: 16, right: 16 };

export function ScreenBottomNav() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();

  const goHome = () => {
    navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Home' }] }));
  };

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Home' }] }));
    }
  };

  return (
    <View style={[styles.bar, { backgroundColor: theme.card, borderTopColor: theme.border, paddingBottom: insets.bottom + 10 }]}>
      <TouchableOpacity onPress={goBack} hitSlop={HIT_SLOP} style={styles.btn} activeOpacity={0.7}>
        <Text style={[styles.label, { color: theme.textPrimary }]}>{'‹ '}{t('common.back')}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={goHome} hitSlop={HIT_SLOP} style={styles.btn} activeOpacity={0.7}>
        <Text style={[styles.label, { color: theme.textPrimary }]}>{t('common.home')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    borderTopWidth: 1,
  },
  btn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
});
