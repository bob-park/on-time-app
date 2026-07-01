import { getLocales } from 'expo-localization';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import ko from './locales/ko.json';

export const SUPPORTED_LANGUAGES = ['ko', 'en'] as const;
export const DEFAULT_LANGUAGE: SupportedLanguage = 'ko';

export const resolveDeviceLanguage = (): SupportedLanguage => {
  const locales = getLocales();
  for (const locale of locales) {
    const code = locale.languageCode?.toLowerCase();
    if (code && (SUPPORTED_LANGUAGES as readonly string[]).includes(code)) {
      return code as SupportedLanguage;
    }
  }
  return DEFAULT_LANGUAGE;
};

if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources: {
        ko: { translation: ko },
        en: { translation: en },
      },
      lng: resolveDeviceLanguage(),
      fallbackLng: DEFAULT_LANGUAGE,
      compatibilityJSON: 'v4',
      interpolation: { escapeValue: false },
      returnNull: false,
    })
    .catch((err) => {
      console.error('i18n init failed', err);
    });
}

export default i18n;
