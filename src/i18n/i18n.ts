import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import logger from '../utils/logger';

// Dil dosyalarını içe aktar
import en from './locales/en';
import tr from './locales/tr';
import ja from './locales/ja';

// Kullanılabilir diller
export const LANGUAGES = {
  EN: 'en',
  TR: 'tr',
  JA: 'ja',
};

// Varsayılan dil ve desteklenen diller
const SUPPORTED_LANGUAGES = [LANGUAGES.EN, LANGUAGES.TR, LANGUAGES.JA];
// Varsayılan dil olarak İngilizce kullan
const DEFAULT_LANGUAGE = LANGUAGES.EN;

// Önce cihaz dilini al
const getDeviceLanguage = () => {
  try {
    const deviceLocale = getLocales()[0];
    const deviceLanguage = deviceLocale?.languageCode;
    logger.info(`Device locale detected: ${deviceLocale?.languageCode}`, 'i18n');

    // Eğer cihaz dili destekleniyorsa onu kullan
    if (deviceLanguage && SUPPORTED_LANGUAGES.includes(deviceLanguage)) {
      return deviceLanguage;
    }

    // Özel durumlar için kontrol - "tr-TR" gibi bileşik kodlar
    if (deviceLanguage?.startsWith('tr')) {
      return LANGUAGES.TR;
    } else if (deviceLanguage?.startsWith('en')) {
      return LANGUAGES.EN;
    } else if (deviceLanguage?.startsWith('ja')) {
      return LANGUAGES.JA;
    }

    // Desteklenmeyen diller için varsayılan İngilizce
    return DEFAULT_LANGUAGE;
  } catch (error) {
    logger.error(`Error detecting device language: ${error}`, 'i18n');
    return DEFAULT_LANGUAGE;
  }
};

// İlk açılışta cihaz dilini al
const initialLanguage = getDeviceLanguage();
logger.info(`Initial device language for i18n: ${initialLanguage}`, 'i18n');

// Initialize i18n with resources first
i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: en,
    },
    tr: {
      translation: tr,
    },
    ja: {
      translation: ja,
    },
  },
  fallbackLng: LANGUAGES.EN,
  interpolation: {
    escapeValue: false,
  },
  // Başlangıçta cihaz dilini kullan
  lng: initialLanguage,
  // React to changes in i18n language
  react: {
    useSuspense: false,
  },
});

// Try to load language from AsyncStorage
const loadStoredLanguage = async () => {
  try {
    // Check if we have a stored language preference
    const languageData = await AsyncStorage.getItem('language-storage');

    // Eğer daha önce bir dil ayarlanmışsa öncelikle onu kullan
    if (languageData) {
      const parsedData = JSON.parse(languageData);
      const storedLanguage = parsedData.state?.currentLanguage;

      // If we have a valid stored language, use it
      if (storedLanguage && SUPPORTED_LANGUAGES.includes(storedLanguage)) {
        logger.info(`Loaded stored language: ${storedLanguage}`, 'i18n');
        i18n.changeLanguage(storedLanguage);
        return;
      }
    }

    // Eğer saklanan bir dil yoksa, zaten cihaz dilini kullanıyoruz
    logger.info(`No stored language found, already using device language: ${i18n.language}`, 'i18n');

  } catch (error) {
    logger.error(`Error loading language from storage: ${error}`, 'i18n');
    // Hata durumunda varsayılan dil olarak İngilizce'yi kullan
    i18n.changeLanguage(DEFAULT_LANGUAGE);
  }
};

// Execute the language loading function
loadStoredLanguage();

export default i18n;