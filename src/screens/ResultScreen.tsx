import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RootStackParamList, PotencyType, PotencyLevel, FavoriteItem } from '../types';
import { useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n';
import { codeToButtons } from '../utils/codeUtils';
import { ScreenHeader } from '../components/ScreenHeader';
import { ScreenBottomNav } from '../components/ScreenBottomNav';
import { ScreenBackground } from '../components/ScreenBackground';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Result'>;
type Route = RouteProp<RootStackParamList, 'Result'>;

const POTENCY_TYPES: PotencyType[] = ['X', 'C', 'M', 'MM', 'M3', 'M4', 'M5', 'LM'];
const POTENCY_HEIGHTS: PotencyLevel[] = [1, 4, 6, 15, 30, 50, 100, 200];
const FAVORITES_KEY = '@dynamis_favorites';

export function ResultScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { theme } = useTheme();
  const { t } = useI18n();

  const { remedy } = route.params;
  const buttons = codeToButtons(remedy.code);

  const [potencyType, setPotencyType] = useState<PotencyType>('C');
  const [potencyHeight, setPotencyHeight] = useState<PotencyLevel>(30);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(FAVORITES_KEY).then(raw => {
      if (!raw) return;
      const favs: FavoriteItem[] = JSON.parse(raw);
      const existing = favs.find(f => f.code === remedy.code);
      if (existing) {
        setIsFavorite(true);
        setFavoriteId(existing.id);
      }
    });
  }, [remedy.code]);

  const toggleFavorite = async () => {
    const raw = await AsyncStorage.getItem(FAVORITES_KEY);
    const favs: FavoriteItem[] = raw ? JSON.parse(raw) : [];

    if (isFavorite) {
      const updated = favs.filter(f => f.id !== favoriteId);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      setIsFavorite(false);
      setFavoriteId(null);
    } else {
      const newFav: FavoriteItem = {
        id: `${remedy.code}-${Date.now()}`,
        name: remedy.name,
        code: remedy.code,
        potencyType,
        potencyHeight,
        buttons,
        addedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify([...favs, newFav]));
      setIsFavorite(true);
      setFavoriteId(newFav.id);
    }
  };

  return (
    <ScreenBackground style={styles.container}>
      <ScreenHeader title={t('result.title')} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.remedyName, { color: theme.textPrimary }]}>{remedy.name}</Text>
          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, { color: theme.textMuted }]}>{t('result.code')} </Text>
            <Text style={[styles.codeValue, { color: theme.accent }]}>{remedy.code}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, { color: theme.textMuted }]}>{t('result.category')} </Text>
            <Text style={[styles.metaValue, { color: theme.textSecondary }]}>{remedy.category}</Text>
          </View>
          {remedy.aliases && remedy.aliases.length > 0 && (
            <Text style={[styles.aliases, { color: theme.textFaint }]}>
              {remedy.aliases.join(' · ')}
            </Text>
          )}
        </View>

        <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>{t('prepare.buttons')}</Text>
        <View style={[styles.grid, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {[0, 1, 2].map(row => (
            <View key={row} style={styles.gridRow}>
              {[0, 1, 2].map(col => {
                const idx = row * 3 + col;
                return (
                  <View key={col} style={[styles.gridCell, { borderColor: theme.borderLight }]}>
                    <Text style={[styles.gridDigit, { color: theme.textPrimary }]}>
                      {buttons[idx]}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>

        <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>{t('prepare.potencyType')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
          {POTENCY_TYPES.map(pt => (
            <TouchableOpacity
              key={pt}
              style={[styles.selectorBtn, {
                backgroundColor: potencyType === pt ? theme.accent : theme.card,
                borderColor: theme.border,
              }]}
              onPress={() => setPotencyType(pt)}
            >
              <Text style={[styles.selectorLabel, {
                color: potencyType === pt ? theme.bg : theme.textSecondary,
              }]}>{pt}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>{t('prepare.potencyHeight')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
          {POTENCY_HEIGHTS.map(ph => (
            <TouchableOpacity
              key={ph}
              style={[styles.selectorBtn, {
                backgroundColor: potencyHeight === ph ? theme.accent : theme.card,
                borderColor: theme.border,
              }]}
              onPress={() => setPotencyHeight(ph)}
            >
              <Text style={[styles.selectorLabel, {
                color: potencyHeight === ph ? theme.bg : theme.textSecondary,
              }]}>{ph}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.secondaryBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => navigation.navigate('Search')}
            activeOpacity={0.8}
          >
            <Text style={[styles.actionBtnLabel, { color: theme.textPrimary }]}>
              {t('result.newSearch')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryBtn, {
              backgroundColor: isFavorite ? theme.cardAlt : theme.accent,
              borderColor: isFavorite ? theme.border : theme.accent,
            }]}
            onPress={toggleFavorite}
            activeOpacity={0.8}
          >
            <Text style={[styles.actionBtnLabel, {
              color: isFavorite ? theme.textSecondary : theme.bg,
            }]}>
              {isFavorite ? t('result.removeFromFavorites') : t('result.addToFavorites')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <ScreenBottomNav />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingBottom: 16 },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 18,
    marginBottom: 8,
  },
  remedyName: { fontSize: 24, fontWeight: '700', marginBottom: 10 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  metaLabel: { fontSize: 13 },
  codeValue: { fontSize: 15, fontWeight: '600' },
  metaValue: { fontSize: 14 },
  aliases: { fontSize: 12, marginTop: 8 },
  sectionLabel: { fontSize: 12, marginTop: 16, marginBottom: 8 },
  grid: {
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  gridRow: { flexDirection: 'row' },
  gridCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderWidth: 0.5,
  },
  gridDigit: { fontSize: 20, fontWeight: '600' },
  selectorScroll: { marginBottom: 4 },
  selectorBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  selectorLabel: { fontSize: 14, fontWeight: '500' },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 28,
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  primaryBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  actionBtnLabel: { fontSize: 15, fontWeight: '600' },
});
