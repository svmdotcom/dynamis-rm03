import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import type { Language } from '../types';
import fr from '../../locales/fr.json';
import en from '../../locales/en.json';

const STORAGE_KEY = '@dynamis_lang';
const DEFAULT_LANG: Language = 'fr';

type LeafKeys<T extends object> = {
  [K in keyof T & string]: T[K] extends Record<string, unknown>
    ? `${K}.${LeafKeys<T[K]>}`
    : `${K}`;
}[keyof T & string];

export type TranslationKey = LeafKeys<typeof fr>;

const translations: Record<Language, typeof fr> = {
  fr,
  en: en as typeof fr,
};

function resolve(obj: unknown, path: string): string {
  const result = path.split('.').reduce<unknown>((acc, key) => {
    if (acc !== null && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);

  return typeof result === 'string' ? result : path;
}

function detectDeviceLang(): Language {
  const code = Localization.getLocales()[0]?.languageCode ?? 'fr';
  return code === 'en' ? 'en' : 'fr';
}

interface I18nContextValue {
  t: (key: TranslationKey) => string;
  lang: Language;
  setLang: (lang: Language) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(DEFAULT_LANG);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === 'fr' || stored === 'en') {
        setLangState(stored);
      } else {
        setLangState(detectDeviceLang());
      }
    });
  }, []);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    AsyncStorage.setItem(STORAGE_KEY, newLang);
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => resolve(translations[lang], key),
    [lang],
  );

  return (
    <I18nContext.Provider value={{ t, lang, setLang }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);

  if (!ctx) {
    throw new Error('useI18n must be used inside I18nProvider');
  }

  return ctx;
}