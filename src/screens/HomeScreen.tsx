import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n';
import { ScreenBackground } from '../components/ScreenBackground';

const logo = require('../../assets/logo-text-energetique.png');
/** Ratio natif du PNG (2151 x 731) : garantit qu'il n'est ni etire ni coupe. */
const LOGO_ASPECT_RATIO = 2151 / 731;

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { theme } = useTheme();
  const { t } = useI18n();

  return (
    <ScreenBackground style={styles.container}>
      <View style={styles.header}>
        <Image
          source={logo}
          style={styles.logo}
          resizeMode="contain"
          accessibilityRole="image"
          accessibilityLabel={t('home.title')}
        />
      </View>

      <View style={styles.cards}>
        <TouchableOpacity
          style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => navigation.navigate('Search')}
        >
          <Text style={[styles.cardLabel, { color: theme.textPrimary }]}>{t('home.findCode')}</Text>
          <Text style={[styles.arrow, { color: theme.accent }]}>{'›'}</Text>
        </TouchableOpacity>

        <View style={[styles.separator, { backgroundColor: theme.borderLight }]} />

        <TouchableOpacity
          style={[styles.card, styles.symptomCard, { backgroundColor: theme.card, borderColor: theme.accent }]}
          onPress={() => navigation.navigate('SymptomSearch')}
        >
          <View style={styles.symptomText}>
            <Text style={[styles.cardLabel, { color: theme.textPrimary }]}>
              {t('home.symptomSearch')}
            </Text>
            <Text style={[styles.cardSubLabel, { color: theme.textMuted }]}>
              {t('home.symptomSearchSubtitle')}
            </Text>
          </View>
          <Text style={[styles.arrow, { color: theme.accent }]}>{'›'}</Text>
        </TouchableOpacity>

        <View style={[styles.separator, { backgroundColor: theme.borderLight }]} />

        <TouchableOpacity
          style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => navigation.navigate('Favorites')}
        >
          <Text style={[styles.cardLabel, { color: theme.textPrimary }]}>{t('home.favoriteCodes')}</Text>
          <Text style={[styles.arrow, { color: theme.accent }]}>{'›'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => navigation.navigate('Manual')}
        >
          <Text style={[styles.cardLabel, { color: theme.textPrimary }]}>{t('home.manual')}</Text>
          <Text style={[styles.arrow, { color: theme.accent }]}>{'›'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={[styles.cardLabel, { color: theme.textPrimary }]}>{t('home.settings')}</Text>
          <Text style={[styles.arrow, { color: theme.accent }]}>{'›'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.spacer} />
      <Text style={[styles.devStatus, { color: theme.textMuted }]}>{t('home.devStatus')}</Text>
    </ScreenBackground>
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
  logo: {
    width: '88%',
    aspectRatio: LOGO_ASPECT_RATIO,
    height: undefined,
    alignSelf: 'center',
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
  symptomCard: {
    borderWidth: 2,
  },
  symptomText: {
    flex: 1,
    marginRight: 12,
  },
  cardSubLabel: {
    fontSize: 13,
    marginTop: 4,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 6,
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
