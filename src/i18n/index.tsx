import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import type { Language, LanguagePref } from '../types';
import fr from '../../locales/fr.json';
import en from '../../locales/en.json';
import es from '../../locales/es.json';

const STORAGE_KEY = '@dynamis_lang';

type LeafKeys<T extends object> = {
  [K in keyof T & string]: T[K] extends Record<string, unknown>
    ? `${K}.${LeafKeys<T[K]>}`
    : `${K}`;
}[keyof T & string];

export type TranslationKey = LeafKeys<typeof fr>;

const translations: Record<Language, typeof fr> = {
  fr,
  en: en as typeof fr,
  es: es as typeof fr,
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
  if (code === 'en') return 'en';
  if (code === 'es') return 'es';
  return 'fr';
}

function resolveLanguage(pref: LanguagePref): Language {
  return pref === 'auto' ? detectDeviceLang() : pref;
}

interface I18nContextValue {
  t: (key: TranslationKey) => string;
  lang: Language;
  langPref: LanguagePref;
  setLangPref: (pref: LanguagePref) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [langPref, setLangPrefState] = useState<LanguagePref>('auto');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === 'fr' || stored === 'en' || stored === 'es' || stored === 'auto') {
        setLangPrefState(stored as LanguagePref);
      } else {
        setLangPrefState('auto');
      }
    });
  }, []);

  const setLangPref = useCallback((pref: LanguagePref) => {
    setLangPrefState(pref);
    AsyncStorage.setItem(STORAGE_KEY, pref);
  }, []);

  const lang = resolveLanguage(langPref);

  const t = useCallback(
    (key: TranslationKey): string => resolve(translations[lang], key),
    [lang],
  );

  return (
    <I18nContext.Provider value={{ t, lang, langPref, setLangPref }}>
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
