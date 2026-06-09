import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RootStackParamList, FavoriteItem, CodebookEntry } from '../types';
import { useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n';
import { ScreenHeader } from '../components/ScreenHeader';
import { ScreenBottomNav } from '../components/ScreenBottomNav';
import { ScreenBackground } from '../components/ScreenBackground';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Favorites'>;
const FAVORITES_KEY = '@dynamis_favorites';

export function FavoritesScreen() {
  const navigation = useNavigation<Nav>();
  const { theme } = useTheme();
  const { t } = useI18n();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(FAVORITES_KEY).then(raw => {
        setFavorites(raw ? JSON.parse(raw) : []);
      });
    }, [])
  );

  const handlePress = (fav: FavoriteItem) => {
    const entry: CodebookEntry = {
      id: fav.id,
      name: fav.name,
      code: fav.code,
      category: '',
      aliases: [],
    };
    navigation.navigate('Result', { remedy: entry });
  };

  const renderItem = ({ item }: { item: FavoriteItem }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={() => handlePress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardMain}>
        <Text style={[styles.name, { color: theme.textPrimary }]}>{item.name}</Text>
        <Text style={[styles.potency, { color: theme.textMuted }]}>
          {item.potencyType} {item.potencyHeight}
        </Text>
      </View>
      <Text style={[styles.code, { color: theme.accent }]}>{item.code}</Text>
    </TouchableOpacity>
  );

  return (
    <ScreenBackground style={styles.container}>
      <ScreenHeader title={t('favorites.title')} />

      {favorites.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>{t('favorites.empty')}</Text>
          <Text style={[styles.emptyHint, { color: theme.textFaint }]}>{t('favorites.emptyHint')}</Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          style={styles.flatList}
          contentContainerStyle={styles.list}
        />
      )}
      <ScreenBottomNav />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyText: { fontSize: 15, marginBottom: 8, textAlign: 'center' },
  emptyHint: { fontSize: 13, textAlign: 'center' },
  flatList: { flex: 1 },
  list: { gap: 10, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  cardMain: { flex: 1, marginRight: 12 },
  name: { fontSize: 16, fontWeight: '500', marginBottom: 2 },
  potency: { fontSize: 12 },
  code: { fontSize: 14, fontWeight: '600' },
});
