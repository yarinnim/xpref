import { readFileSync } from 'fs';

type Locale = Record<string, string>;
type Store = Record<string, Locale>;

type I18n = {
  locale: Locale,
  fallbackLang?: string,
  fallbackLangOnly?: boolean,
};

const singletonLocale: Store = {};

let privProps: any = {
  fallbackLang: 'en',
  fallbackLangOnly: false,
};

const toLowerCase = (data: Record<string, string>) => {
  const entries = Object.entries(data);
  return entries.reduce((accu, item) => {
    const [key, value] = item;
    return { ...accu, [key.toLowerCase()]: value };
  }, {});
};

const loadLocalContent = (locale: Locale) => {
  Object.entries(locale).forEach((localeItem: string[]) => {
    const [localeName, localePath] = localeItem;
    const data = readFileSync(localePath, 'utf8');
    const jsonData = JSON.parse(data === '' ? '{}' : data);
    singletonLocale[localeName] = toLowerCase(jsonData);
  });
};

const localeEscape = (str: string, obj: Record<string, any> = {}): string => {
  const keys = Object.keys(obj);
  return keys.reduce((carry, placeholder) => {
    const nextResult = carry.replace(`{${placeholder}}`, obj[placeholder]);
    return nextResult;
  }, str);
};

const getLang = (lang: string): string => {
  const { fallbackLangOnly, fallbackLang } = privProps;
  if (fallbackLangOnly) return fallbackLang;
  return lang;
};

const translate = (key: string, replace: Record<string, any> = {}, pLang: string = 'en') => {
  const lang = getLang(pLang);
  const { fallbackLang } = privProps;
  const i18n = singletonLocale[lang] || singletonLocale[fallbackLang] || {};
  const translation: any = i18n[key.toLowerCase()] || key;
  const translated = localeEscape(translation, replace);
  return translated;
};

export default function initI18n(props: I18n) {
  const { locale, fallbackLang = 'en', fallbackLangOnly = false } = props;
  privProps = { fallbackLang, fallbackLangOnly };
  loadLocalContent(locale);
  return translate;
}
