import type { Theme, ThemeName } from '../types';

export const lightTheme: Theme = {
  bg: '#F5F0E8',
  card: '#FDFAF4',
  cardAlt: '#EDE6D6',
  border: '#D4C5A9',
  borderLight: '#E8DECE',
  accent: '#B8842A',
  accentLight: '#D4A655',
  accentAlt: '#8B5E35',
  accentAltLight: '#AA7A50',
  textPrimary: '#2B1A0D',
  textSecondary: '#5A3C22',
  textMuted: '#8A7260',
  textFaint: '#C2B49E',
  warning: '#C47A00',
  warningText: '#6B3800',
  danger: '#C0402B',
  btnMuted: '#EDE6D6',
  statusBar: 'dark',
};

export const darkTheme: Theme = {
  bg: '#1A1008',
  card: '#261810',
  cardAlt: '#30201A',
  border: '#3E2A1C',
  borderLight: '#503C2A',
  accent: '#C8943A',
  accentLight: '#DDB060',
  accentAlt: '#A06830',
  accentAltLight: '#BC8A50',
  textPrimary: '#F0E8D8',
  textSecondary: '#C8BAA0',
  textMuted: '#8A7260',
  textFaint: '#503C2A',
  warning: '#D49C10',
  warningText: '#FFF0D0',
  danger: '#D45040',
  btnMuted: '#30201A',
  statusBar: 'light',
};

export const themes: Record<ThemeName, Theme> = {
  light: lightTheme,
  dark: darkTheme,
};