import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  InteractionManager,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type {
  ConditionResult,
  RankedRemedy,
  RefinementSuggestion,
  RootStackParamList,
  SymptomSearchOutcome,
} from '../types';
import { useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n';
import { getSymptomIndex, searchConfig, searchSymptoms } from '../data/symptomIndex';
import { ScreenHeader } from '../components/ScreenHeader';
import { ScreenBottomNav } from '../components/ScreenBottomNav';
import { ScreenBackground } from '../components/ScreenBackground';

type Nav = NativeStackNavigationProp<RootStackParamList, 'SymptomSearch'>;

const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 180;
const MAX_REMEDIES_INITIALLY = searchConfig.search_rules.max_remedies_initially;

export function SymptomSearchScreen() {
  const navigation = useNavigation<Nav>();
  const { theme } = useTheme();
  const { t } = useI18n();

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [skipRefine, setSkipRefine] = useState(false);
  const [indexReady, setIndexReady] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [fullListIds, setFullListIds] = useState<string[]>([]);

  // Base volumineuse : preparee une seule fois, apres la transition d'ecran.
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      getSymptomIndex();
      setIndexReady(true);
    });
    return () => task.cancel();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const outcome = useMemo<SymptomSearchOutcome>(() => {
    if (!indexReady) return { kind: 'idle' };
    if (debouncedQuery.trim().length < MIN_QUERY_LENGTH) return { kind: 'idle' };
    return searchSymptoms(debouncedQuery, { skipRefine });
  }, [debouncedQuery, indexReady, skipRefine]);

  const handleChangeText = useCallback((text: string) => {
    setQuery(text);
    setSkipRefine(false);
    setExpandedId(null);
  }, []);

  // Niveau 1 -> niveau 2 : la precision choisie relance la recherche en mode
  // conditions, sans repasser par les propositions.
  const handleRefinement = useCallback((suggestion: RefinementSuggestion) => {
    setQuery(suggestion.query);
    setDebouncedQuery(suggestion.query);
    setSkipRefine(true);
    setExpandedId(null);
  }, []);

  const openRemedy = useCallback((remedy: RankedRemedy) => {
    if (remedy.entry) {
      // Ecran resultat / code RM03 existants.
      navigation.navigate('Result', { remedy: remedy.entry });
    } else {
      // Aucun code sur : on renvoie vers la recherche RM03 existante.
      navigation.navigate('Search', { initialQuery: remedy.name });
    }
  }, [navigation]);

  const sourceLabel = useCallback((remedy: RankedRemedy): string => {
    if (remedy.multiSource) {
      return `${t('symptomSearch.citedIn')} ${remedy.sourceCount} ${t('symptomSearch.sources')}`;
    }
    if (remedy.sourceTitles.length > 0) {
      // Certains titres d'ouvrage portent un suffixe technique apres un tiret.
      const title = remedy.sourceTitles[0].split('—')[0].trim();
      return `${t('symptomSearch.source')} ${title}`;
    }
    return t('symptomSearch.sourceUnknown');
  }, [t]);

  const renderRemedy = useCallback((remedy: RankedRemedy) => (
    <TouchableOpacity
      key={remedy.name}
      style={[styles.remedyRow, { borderTopColor: theme.borderLight }]}
      onPress={() => openRemedy(remedy)}
      activeOpacity={0.7}
    >
      <View style={styles.remedyMain}>
        <Text style={[styles.remedyName, { color: theme.textSecondary }]} numberOfLines={2}>
          {remedy.name}
        </Text>
        <Text style={[styles.remedySource, { color: theme.textFaint }]} numberOfLines={1}>
          {sourceLabel(remedy)}
        </Text>
      </View>
      {remedy.entry ? (
        <Text style={[styles.remedyCode, { color: theme.accent }]}>{remedy.entry.code}</Text>
      ) : (
        <Text style={[styles.remedyNoCode, { color: theme.textFaint }]}>
          {t('symptomSearch.noCode')}
        </Text>
      )}
    </TouchableOpacity>
  ), [theme, t, openRemedy, sourceLabel]);

  const renderCondition = useCallback(({ item }: { item: ConditionResult }) => {
    const isExpanded = expandedId === item.id;
    const showAll = fullListIds.includes(item.id);
    const visible = showAll ? item.remedies : item.remedies.slice(0, MAX_REMEDIES_INITIALLY);
    const hidden = item.remedies.length - visible.length;

    return (
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => setExpandedId(isExpanded ? null : item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeaderText}>
            <Text style={[styles.problem, { color: theme.textPrimary }]}>{item.label}</Text>
            <Text style={[styles.remedyCount, { color: theme.textMuted }]}>
              {item.remedies.length} {t('symptomSearch.remedies')}
            </Text>
          </View>
          <Text style={[styles.chevron, { color: theme.accent }]}>{isExpanded ? '⌄' : '›'}</Text>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.remedies}>
            {visible.map(renderRemedy)}

            {hidden > 0 && (
              <TouchableOpacity
                style={[styles.moreBtn, { borderTopColor: theme.borderLight }]}
                onPress={() => setFullListIds(ids => [...ids, item.id])}
                activeOpacity={0.7}
              >
                <Text style={[styles.moreLabel, { color: theme.accent }]}>
                  {t('symptomSearch.showMore')} ({hidden})
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  }, [theme, t, expandedId, fullListIds, renderRemedy]);

  const isEmptyQuery = query.trim().length < MIN_QUERY_LENGTH;

  return (
    <ScreenBackground style={styles.container}>
      <ScreenHeader title={t('symptomSearch.title')} />

      <View style={styles.badgeRow}>
        <Text style={[styles.badge, {
          color: theme.accent,
          borderColor: theme.accent,
          backgroundColor: theme.cardAlt,
        }]}>
          {t('symptomSearch.badge')}
        </Text>
      </View>

      <TextInput
        style={[styles.input, {
          backgroundColor: theme.card,
          borderColor: theme.border,
          color: theme.textPrimary,
        }]}
        placeholder={t('symptomSearch.placeholder')}
        placeholderTextColor={theme.textMuted}
        value={query}
        onChangeText={handleChangeText}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
      />

      {/* Zone centrale extensible : garde la barre du bas collee en bas,
          comme sur SearchScreen ou la FlatList occupe tout l'espace restant. */}
      <View style={styles.content}>
        {!indexReady && (
          <View style={styles.hint}>
            <ActivityIndicator color={theme.accent} />
            <Text style={[styles.hintText, { color: theme.textMuted }]}>{t('common.loading')}</Text>
          </View>
        )}

        {indexReady && isEmptyQuery && (
          <View style={styles.hint}>
            <Text style={[styles.hintText, { color: theme.textMuted }]}>
              {t('symptomSearch.emptyHint')}
            </Text>
          </View>
        )}

        {outcome.kind === 'empty' && (
          <View style={styles.hint}>
            <Text style={[styles.hintText, { color: theme.textMuted }]}>
              {t('symptomSearch.noResults')}
            </Text>
            <Text style={[styles.hintSub, { color: theme.textFaint }]}>
              {t('symptomSearch.noResultsHint')}
            </Text>
          </View>
        )}

        {outcome.kind === 'refine' && (
          <FlatList
            data={outcome.suggestions}
            keyExtractor={suggestion => suggestion.label}
            style={styles.flatList}
            contentContainerStyle={styles.list}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={(
              <Text style={[styles.refineTitle, { color: theme.textSecondary }]}>
                {t('symptomSearch.refineTitle')}
              </Text>
            )}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.chip, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={() => handleRefinement(item)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipLabel, { color: theme.textPrimary }]}>{item.label}</Text>
                <Text style={[styles.chevron, { color: theme.accent }]}>{'›'}</Text>
              </TouchableOpacity>
            )}
          />
        )}

        {outcome.kind === 'conditions' && (
          <FlatList
            data={outcome.conditions}
            keyExtractor={item => item.id}
            renderItem={renderCondition}
            style={styles.flatList}
            contentContainerStyle={styles.list}
            keyboardShouldPersistTaps="handled"
            initialNumToRender={6}
            windowSize={7}
          />
        )}
      </View>

      <Text style={[styles.disclaimer, { color: theme.textFaint }]}>
        {t('symptomSearch.disclaimer')}
      </Text>

      <ScreenBottomNav />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 10,
  },
  badge: {
    fontSize: 11,
    fontWeight: '600',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    overflow: 'hidden',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 10,
  },
  hint: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 16,
    gap: 8,
  },
  hintText: {
    fontSize: 15,
    textAlign: 'center',
  },
  hintSub: {
    fontSize: 13,
    textAlign: 'center',
  },
  flatList: { flex: 1 },
  list: {
    gap: 10,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  refineTitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  chipLabel: {
    fontSize: 15,
    flex: 1,
    marginRight: 12,
  },
  card: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  cardHeaderText: {
    flex: 1,
    marginRight: 12,
  },
  problem: {
    fontSize: 16,
    fontWeight: '600',
  },
  remedyCount: {
    fontSize: 12,
    marginTop: 2,
  },
  chevron: {
    fontSize: 20,
  },
  remedies: {
    paddingBottom: 4,
  },
  remedyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  remedyMain: {
    flex: 1,
    marginRight: 12,
  },
  remedyName: {
    fontSize: 15,
  },
  remedySource: {
    fontSize: 11,
    marginTop: 2,
  },
  remedyCode: {
    fontSize: 14,
    fontWeight: '600',
  },
  remedyNoCode: {
    fontSize: 11,
  },
  moreBtn: {
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  moreLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  disclaimer: {
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
});
