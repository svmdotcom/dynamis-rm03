import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n';
import { ScreenHeader } from '../components/ScreenHeader';
import { ScreenBottomNav } from '../components/ScreenBottomNav';
import { ScreenBackground } from '../components/ScreenBackground';
import { manualSections } from '../data/manualContent';

export function ManualScreen() {
  const { theme } = useTheme();
  const { t, lang } = useI18n();

  return (
    <ScreenBackground style={styles.container}>
      <ScreenHeader title={t('manual.title')} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {manualSections.map((section, index) => (
          <View
            key={section.key}
            style={[
              styles.section,
              { borderColor: theme.border },
              index === 0 && styles.sectionFirst,
            ]}
          >
            <Text style={[styles.sectionTitle, { color: theme.accent }]}>
              {section.title[lang]}
            </Text>
            {section.body[lang].map((line, i) => (
              <Text key={i} style={[styles.bodyLine, { color: theme.textSecondary }]}>
                {line}
              </Text>
            ))}
          </View>
        ))}
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
    paddingTop: 12,
    paddingBottom: 24,
  },
  section: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 18,
    paddingBottom: 4,
    marginBottom: 8,
  },
  sectionFirst: {
    borderTopWidth: 0,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  bodyLine: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 6,
  },
});
