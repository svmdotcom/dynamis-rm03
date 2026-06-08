import Fuse, { type IFuseOptions } from 'fuse.js';
import type { CodebookEntry, SearchResult, SearchMode } from '../types';

const NAME_OPTIONS: IFuseOptions<CodebookEntry> = {
  keys: [
    { name: 'name', weight: 2 },
    { name: 'search', weight: 1.5 },
    { name: 'aliases', weight: 1 },
  ],
  threshold: 0.35,
  includeScore: true,
  minMatchCharLength: 2,
  shouldSort: true,
  ignoreLocation: true,
};

const CODE_OPTIONS: IFuseOptions<CodebookEntry> = {
  keys: ['code'],
  threshold: 0.1,
  includeScore: true,
  minMatchCharLength: 1,
  shouldSort: true,
};

export function createNameFuse(entries: CodebookEntry[]): Fuse<CodebookEntry> {
  return new Fuse(entries, NAME_OPTIONS);
}

export function createCodeFuse(entries: CodebookEntry[]): Fuse<CodebookEntry> {
  return new Fuse(entries, CODE_OPTIONS);
}

export function runSearch(
  query: string,
  mode: SearchMode,
  nameFuse: Fuse<CodebookEntry>,
  codeFuse: Fuse<CodebookEntry>,
  entries: CodebookEntry[],
): SearchResult[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  if (mode === 'code') {
    const exact = entries.filter(e => e.code.startsWith(trimmed));
    if (exact.length > 0) {
      return exact.map(item => ({ item, score: 0, isFuzzy: false }));
    }
    return codeFuse.search(trimmed).map(r => ({ item: r.item, score: r.score, isFuzzy: true }));
  }

  const lowerQuery = trimmed.toLowerCase();
  const exact = entries.filter(e => e.name.toLowerCase() === lowerQuery);
  if (exact.length > 0) {
    return exact.map(item => ({ item, score: 0, isFuzzy: false }));
  }

  const substring = entries.filter(e =>
    e.name.toLowerCase().includes(lowerQuery) ||
    e.aliases?.some(a => a.toLowerCase().includes(lowerQuery))
  );
  if (substring.length > 0) {
    return substring.map(item => ({ item, score: 0, isFuzzy: false }));
  }

  return nameFuse.search(trimmed).map(r => ({ item: r.item, score: r.score, isFuzzy: true }));
}