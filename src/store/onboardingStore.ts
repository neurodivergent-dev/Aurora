import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import logger from '../utils/logger';

interface OnboardingState {
  hasCompletedOnboarding: boolean;
  setOnboardingComplete: (completed: boolean) => void;
  resetState: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      // Varsayılan olarak onboarding gösterilecek (tamamlanmamış)
      hasCompletedOnboarding: false,
      
      // Onboarding durumunu güncelleme işlevi
      setOnboardingComplete: (completed: boolean) => {
        logger.info(`Onboarding completion status set to: ${completed}`, 'OnboardingStore');
        set({ hasCompletedOnboarding: completed });
      },
      
      // Store'u sıfırlama işlevi
      resetState: () => {
        logger.info('Resetting onboarding store state to default (not completed)', 'OnboardingStore');
        set({ hasCompletedOnboarding: false });
      }
    }),
    {
      name: 'onboarding-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 