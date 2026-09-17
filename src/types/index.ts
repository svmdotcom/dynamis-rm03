export type Language = 'fr' | 'en' | 'es';

export type LanguagePref = 'auto' | Language;

export type ThemeName = 'dark' | 'light' | 'wood';

export interface Theme {
  bg: string;
  card: string;
  cardAlt: string;
  border: string;
  borderLight: string;
  accent: string;
  accentLight: string;
  accentAlt: string;
  accentAltLight: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textFaint: string;
  warning: string;
  warningText: string;
  danger: string;
  btnMuted: string;
  statusBar: 'light' | 'dark';
}

export type PotencyType = 'X' | 'C' | 'M' | 'MM' | 'M3' | 'M4' | 'M5' | 'LM';

export type PotencyLevel = 1 | 2 | 3 | 4 | 6 | 15 | 30 | 50 | 100 | 200 | 999;

export interface Potency {
  type: PotencyType;
  height: PotencyLevel | number;
}

export type ButtonSettings = [
  number, number, number,
  number, number, number,
  number, number, number,
];

export interface CodebookEntry {
  id: string;
  name: string;
  code: string;
  category: string;
  search?: string;
  aliases?: string[];
}

export interface RemedySuggestion {
  name: string;
  potency?: string;
  context_fr?: string;
  context_en?: string;
  codeEntry?: CodebookEntry | null;
}

export interface HomeopathyEntry {
  id: string;
  problem_fr: string;
  problem_en: string;
  keywords_fr: string[];
  keywords_en: string[];
  context_fr?: string;
  context_en?: string;
  remedies: RemedySuggestion[];
}

export interface ManualSection {
  id: string;
  section_fr: string;
  section_en: string;
  content_fr: string;
  content_en: string;
}

export interface FavoriteItem {
  id: string;
  name: string;
  code: string;
  potencyType: PotencyType;
  potencyHeight: number;
  buttons: ButtonSettings;
  addedAt: string;
}

export interface HistoryItem {
  id: string;
  name: string;
  code: string;
  category: string;
  searchedAt: string;
}

export type SearchMode = 'name' | 'code';

export interface SearchResult {
  item: CodebookEntry;
  score?: number;
  isFuzzy: boolean;
}

export interface SymptomSearchResult extends HomeopathyEntry {
  score?: number;
}

export type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  Search: { initialQuery?: string } | undefined;
  Result: { remedy: CodebookEntry };
  Prepare: {
    remedy: CodebookEntry;
    buttons: ButtonSettings;
    potencyType: PotencyType;
    potencyHeight: number;
  };
  SymptomSearch: undefined;
  Favorites: undefined;
  Manual: undefined;
  CopyMode: undefined;
  DepotMode: undefined;
  Settings: undefined;
};

export interface SymptomEvidence {
  source_id: string;
  relation?: string;
  match_confidence?: number;
}

export interface SymptomRemedy {
  name: string;
  name_variants?: string[];
  evidence?: SymptomEvidence[];
  source_count?: number;
  source_ids?: string[];
  book_consensus?: 'single_source' | 'multiple_sources';
}

export interface SymptomCondition {
  id: string;
  label: string;
  aliases?: string[];
  lay_aliases?: string[];
  keywords_v2?: string[];
  symptoms?: string[];
  domains?: string[];
  searchable?: boolean;
  needs_refinement_when_query_is_broad?: boolean;
  remedy_count?: number;
  remedies?: SymptomRemedy[];
}

export interface SymptomIndexFile {
  meta?: {
    sources?: { source_id: string; title?: string }[];
  };
  conditions: SymptomCondition[];
}

export interface OntologyRefinement {
  label: string;
  terms: string[];
}

export interface OntologyZone {
  aliases?: string[];
  refinements?: OntologyRefinement[];
}

export interface SymptomSearchConfig {
  ui: Record<string, string>;
  search_rules: {
    fields_and_weights: Record<string, number>;
    minimum_coverage_multiword: number;
    max_condition_results: number;
    max_remedies_initially: number;
    require_word_boundaries: boolean;
    broad_condition_penalty: number;
    multi_source_remedy_bonus: number;
  };
  ontology: Record<string, OntologyZone>;
}

/** Remede d'une condition, classe et resolu vers le codebook RM03. */
export interface RankedRemedy {
  name: string;
  entry: CodebookEntry | null;
  sourceCount: number;
  sourceTitles: string[];
  multiSource: boolean;
}

/** Niveau 2 : une condition identifiee et ses remedes. */
export interface ConditionResult {
  id: string;
  label: string;
  score: number;
  matchedTerms: string[];
  remedies: RankedRemedy[];
}

/** Niveau 1 : proposition de precision pour une requete trop large. */
export interface RefinementSuggestion {
  label: string;
  query: string;
}

export type SymptomSearchOutcome =
  | { kind: 'idle' }
  | { kind: 'refine'; zone: string; suggestions: RefinementSuggestion[] }
  | { kind: 'conditions'; conditions: ConditionResult[] }
  | { kind: 'empty' };
