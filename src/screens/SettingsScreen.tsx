import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n';
import { ScreenHeader } from '../components/ScreenHeader';
import { ScreenBottomNav } from '../components/ScreenBottomNav';
import { ScreenBackground } from '../components/ScreenBackground';
import type { ThemeName, LanguagePref } from '../types';

const SOUNDS_KEY = '@dynamis_sounds';

export function SettingsScreen() {
  const { theme, themeName, setTheme } = useTheme();
  const { t, langPref, setLangPref } = useI18n();
  const [soundsEnabled, setSoundsEnabled] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(SOUNDS_KEY).then(val => {
      if (val !== null) setSoundsEnabled(val === 'true');
    });
  }, []);

  // TODO later: open Google Play store URL or integrate Play Core in-app updates after publication.
  const checkUpdates = useCallback(() => {
    Alert.alert(t('settings.updates'), t('settings.updatesInfo'));
  }, [t]);

  const toggleSounds = useCallback(async () => {
    const next = !soundsEnabled;
    setSoundsEnabled(next);
    await AsyncStorage.setItem(SOUNDS_KEY, String(next));
  }, [soundsEnabled]);

  const langOptions: { pref: LanguagePref; label: string }[] = [
    { pref: 'auto', label: t('settings.languageAuto') },
    { pref: 'fr', label: t('settings.languageFr') },
    { pref: 'en', label: t('settings.languageEn') },
    { pref: 'es', label: t('settings.languageEs') },
  ];

  const themeOptions: { name: ThemeName; label: string }[] = [
    { name: 'dark', label: t('settings.themeDark') },
    { name: 'light', label: t('settings.themeLight') },
    { name: 'wood', label: t('settings.themeWood') },
  ];

  return (
    <ScreenBackground style={styles.container}>
      <ScreenHeader title={t('settings.title')} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>

        <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>
          {t('settings.language').toUpperCase()}
        </Text>
        <View style={[styles.group, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {langOptions.map((opt, i) => (
            <TouchableOpacity
              key={opt.pref}
              style={[
                styles.row,
                { borderColor: theme.borderLight },
                i === 0 && styles.rowFirst,
              ]}
              onPress={() => setLangPref(opt.pref)}
              activeOpacity={0.7}
            >
              <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>{opt.label}</Text>
              <View style={[
                styles.radio,
                { borderColor: theme.accent },
                langPref === opt.pref && { backgroundColor: theme.accent },
              ]} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>
          {t('settings.theme').toUpperCase()}
        </Text>
        <View style={[styles.group, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {themeOptions.map((opt, i) => (
            <TouchableOpacity
              key={opt.name}
              style={[
                styles.row,
                { borderColor: theme.borderLight },
                i === 0 && styles.rowFirst,
              ]}
              onPress={() => setTheme(opt.name)}
              activeOpacity={0.7}
            >
              <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>{opt.label}</Text>
              <View style={[
                styles.radio,
                { borderColor: theme.accent },
                themeName === opt.name && { backgroundColor: theme.accent },
              ]} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>
          {t('settings.sounds').toUpperCase()}
        </Text>
        <View style={[styles.group, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <TouchableOpacity
            style={[styles.row, styles.rowFirst, { borderColor: theme.borderLight }]}
            onPress={toggleSounds}
            activeOpacity={0.7}
          >
            <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>
              {t('settings.soundsButtons')}
            </Text>
            <Text style={[styles.toggleValue, { color: theme.accent }]}>
              {soundsEnabled ? t('settings.on') : t('settings.off')}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>
          {t('settings.about').toUpperCase()}
        </Text>
        <View style={[styles.group, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.row, styles.rowFirst, { borderColor: theme.borderLight }]}>
            <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>Dynamis RM03</Text>
          </View>
          <View style={[styles.row, { borderColor: theme.borderLight }]}>
            <Text style={[styles.rowLabel, { color: theme.textSecondary }]}>{t('settings.appVersion')}</Text>
          </View>
          <View style={[styles.row, { borderColor: theme.borderLight }]}>
            <Text style={[styles.rowLabel, { color: theme.textSecondary }]}>{t('settings.appLocation')}</Text>
          </View>
          <View style={[styles.row, { borderColor: theme.borderLight }]}>
            <Text style={[styles.rowLabel, { color: theme.textSecondary }]}>{t('settings.appLicense')}</Text>
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>
          {t('settings.updates').toUpperCase()}
        </Text>
        <View style={[styles.group, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.row, styles.rowFirst, { borderColor: theme.borderLight }]}>
            <Text style={[styles.rowLabel, { color: theme.textSecondary }]}>{t('settings.currentVersion')}</Text>
          </View>
          <View style={[styles.row, { borderColor: theme.borderLight }]}>
            <Text style={[styles.rowLabel, { color: theme.textMuted, flex: 1, flexWrap: 'wrap' }]}>
              {t('settings.updatesInfo')}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.row, { borderColor: theme.borderLight }]}
            onPress={checkUpdates}
            activeOpacity={0.7}
          >
            <Text style={[styles.rowLabel, { color: theme.accent }]}>{t('settings.checkUpdates')}</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      <ScreenBottomNav />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  group: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 28,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  rowFirst: { borderTopWidth: 0 },
  rowLabel: { fontSize: 16 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
  toggleValue: {
    fontSize: 16,
    fontWeight: '600',
  },
});
