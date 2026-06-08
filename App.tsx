import React from 'react';
import { ThemeProvider } from './src/theme/ThemeContext';
import { I18nProvider } from './src/i18n';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AppNavigator />
      </I18nProvider>
    </ThemeProvider>
  );
}
