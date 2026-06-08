import React from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { theme } = useTheme();
  const { t } = useI18n();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>{t('home.title')}</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{t('home.subtitle')}</Text>
      </View>

      <View style={styles.cards}>
        <TouchableOpacity
          style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => navigation.navigate('Search')}
        >
          <Text style={[styles.cardLabel, { color: theme.textPrimary }]}>{t('home.searchRemedy')}</Text>
          <Text style={[styles.arrow, { color: theme.accent }]}>{'›'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => navigation.navigate('Search')}
        >
          <Text style={[styles.cardLabel, { color: theme.textPrimary }]}>{t('home.prepareByCode')}</Text>
          <Text style={[styles.arrow, { color: theme.accent }]}>{'›'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => navigation.navigate('CopyMode')}
        >
          <Text style={[styles.cardLabel, { color: theme.textPrimary }]}>{t('home.copyRemedy')}</Text>
          <Text style={[styles.arrow, { color: theme.accent }]}>{'›'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.spacer} />
      <Text style={[styles.devStatus, { color: theme.textMuted }]}>{t('home.devStatus')}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  header: {
    marginTop: 48,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  cards: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  cardLabel: {
    fontSize: 18,
  },
  arrow: {
    fontSize: 24,
  },
  spacer: {
    flex: 1,
  },
  devStatus: {
    textAlign: 'center',
    fontSize: 12,
  },
});
