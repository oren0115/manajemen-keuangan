import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '@/locales/en.json';
import id from '@/locales/id.json';

const STORAGE_KEY = 'app-lang';

export const supportedLanguages = ['en', 'id'] as const;
export type SupportedLocale = (typeof supportedLanguages)[number];

const saved =
  typeof localStorage !== 'undefined' ? (localStorage.getItem(STORAGE_KEY) as SupportedLocale | null) : null;
const initial = saved && supportedLanguages.includes(saved) ? saved : 'id';

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, id: { translation: id } },
  lng: initial,
  fallbackLng: 'id',
  interpolation: { escapeValue: false },
});

i18n.on('languageChanged', (lng) => {
  if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, lng);
});

export default i18n;
