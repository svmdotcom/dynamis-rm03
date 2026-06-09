import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, SearchResult, SearchMode } from '../types';
import { useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n';
import { remedies, nameFuse, codeFuse } from '../data';
import { runSearch } from '../utils/searchUtils';
import { ScreenHeader } from '../components/ScreenHeader';
import { ScreenBottomNav } from '../components/ScreenBottomNav';
import { ScreenBackground } from '../components/ScreenBackground';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Search'>;
type Route = RouteProp<RootStackParamList, 'Search'>;

export function SearchScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { theme } = useTheme();
  const { t } = useI18n();

  const [query, setQuery] = useState(route.params?.initialQuery ?? '');
  const [mode, setMode] = useState<SearchMode>('name');

  const results: SearchResult[] = query.trim().length >= 1
    ? runSearch(query, mode, nameFuse, codeFuse, remedies)
    : [];

  const handleChangeText = useCallback((text: string) => {
    setQuery(text);
  }, []);

  const renderItem = useCallback(({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={[styles.resultCard, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={() => navigation.navigate('Result', { remedy: item.item })}
      activeOpacity={0.7}
    >
      <View style={styles.resultMain}>
        <Text style={[styles.resultName, { color: theme.textPrimary }]}>{item.item.name}</Text>
        <Text style={[styles.resultCategory, { color: theme.textMuted }]}>{item.item.category}</Text>
      </View>
      <Text style={[styles.resultCode, { color: theme.accent }]}>{item.item.code}</Text>
    </TouchableOpacity>
  ), [theme, navigation]);

  const isEmpty = query.trim().length === 0;
  const noResults = !isEmpty && results.length === 0;

  return (
    <ScreenBackground style={styles.container}>
      <ScreenHeader title={t('search.title')} />

      <TextInput
        style={[styles.input, {
          backgroundColor: theme.card,
          borderColor: theme.border,
          color: theme.textPrimary,
        }]}
        placeholder={t('search.placeholder')}
        placeholderTextColor={theme.textMuted}
        value={query}
        onChangeText={handleChangeText}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
      />

      <View style={styles.modeRow}>
        <TouchableOpacity
          style={[styles.modeBtn, {
            backgroundColor: mode === 'name' ? theme.accent : theme.card,
            borderColor: theme.border,
          }]}
          onPress={() => setMode('name')}
        >
          <Text style={[styles.modeBtnLabel, {
            color: mode === 'name' ? theme.bg : theme.textSecondary,
          }]}>Nom</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeBtn, {
            backgroundColor: mode === 'code' ? theme.accent : theme.card,
            borderColor: theme.border,
          }]}
          onPress={() => setMode('code')}
        >
          <Text style={[styles.modeBtnLabel, {
            color: mode === 'code' ? theme.bg : theme.textSecondary,
          }]}>Code</Text>
        </TouchableOpacity>
      </View>

      {isEmpty && (
        <View style={styles.hint}>
          <Text style={[styles.hintText, { color: theme.textMuted }]}>{t('search.placeholder')}</Text>
        </View>
      )}

      {noResults && (
        <View style={styles.hint}>
          <Text style={[styles.hintText, { color: theme.textMuted }]}>{t('search.noResults')}</Text>
          <Text style={[styles.hintSub, { color: theme.textFaint }]}>{t('search.noResultsHint')}</Text>
        </View>
      )}

      <FlatList
        data={results}
        keyExtractor={item => item.item.id}
        renderItem={renderItem}
        style={styles.flatList}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
      />
      <ScreenBottomNav />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  modeBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  modeBtnLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  hint: {
    alignItems: 'center',
    marginTop: 48,
    paddingHorizontal: 16,
  },
  hintText: {
    fontSize: 15,
    marginBottom: 6,
  },
  hintSub: {
    fontSize: 13,
  },
  flatList: { flex: 1 },
  list: {
    gap: 10,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  resultMain: {
    flex: 1,
    marginRight: 12,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  resultCategory: {
    fontSize: 12,
  },
  resultCode: {
    fontSize: 14,
    fontWeight: '600',
  },
});
