import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n/i18n';
import { LANGUAGES } from '../i18n/i18n';
import logger from '../utils/logger';

interface LanguageState {
  currentLanguage: string;
  setLanguage: (lang: string) => void;
  resetState: () => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, _get) => ({
      // Use i18n.language as the source of truth
      currentLanguage: i18n.language || LANGUAGES.EN,
      
      setLanguage: (lang: string) => {
        // Ensure the language is supported
        if (lang !== LANGUAGES.EN && lang !== LANGUAGES.TR && lang !== LANGUAGES.JA) {
          logger.warn(`Unsupported language: ${lang}, falling back to English`, 'LanguageStore');
          lang = LANGUAGES.EN;
        }
        
        // Change language in i18n
        i18n.changeLanguage(lang);
        
        logger.info(`Language changed to: ${lang}`, 'LanguageStore');
        
        // Update store
        set({ 
          currentLanguage: lang 
        });
      },
      
      // Add a reset function to handle complete reset
      resetState: () => {
        logger.info('Resetting language store state to default (English)', 'LanguageStore');
        
        // Set to English
        i18n.changeLanguage(LANGUAGES.EN);
        
        // Update store
        set({
          currentLanguage: LANGUAGES.EN
        });
      }
    }),
    {
      name: 'language-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Add onRehydrateStorage to ensure language is properly set after rehydration
      onRehydrateStorage: () => (state) => {
        if (state && state.currentLanguage) {
          // Ensure i18n language matches the stored language after rehydration
          logger.info(`Rehydrating language: ${state.currentLanguage}`, 'LanguageStore');
          i18n.changeLanguage(state.currentLanguage);
        }
      },
      // Ensure that i18n is always up to date with the store
      partialize: (state) => ({ currentLanguage: state.currentLanguage }),
    }
  )
); 