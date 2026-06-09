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