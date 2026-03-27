import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeOption, getThemeById, THEMES } from '../constants/themes';

type ThemeMode = 'light' | 'dark' | 'system';
export type BackgroundEffectType = 'none' | 'bokeh' | 'quantum' | 'crystals' | 'tesseract' | 'aurora' | 'matrix' | 'vortex' | 'grid' | 'silk' | 'prism' | 'nebula' | 'flow' | 'blackhole' | 'stardust' | 'neural' | 'dna' | 'winamp';

const lightBase = {
  background: '#F0F2F5',
  card: '#FFFFFF',
  cardBackground: '#FFFFFF',
  cardBorder: 'rgba(0, 0, 0, 0.08)',
  text: '#1A1A1A',
  subText: '#65676B',
  border: 'rgba(0, 0, 0, 0.1)',
  success: '#2E7D32',
  warning: '#ED6C02',
  error: '#D32F2F',
  info: '#1976D2',
};

const darkBase = {
  background: '#0F0F11',
  card: 'rgba(30, 30, 35, 0.7)',
  cardBackground: 'rgba(30, 30, 35, 0.7)',
  cardBorder: 'rgba(255, 255, 255, 0.12)',
  text: '#F8F9FA',
  subText: '#ADB5BD',
  border: 'rgba(255, 255, 255, 0.15)',
  success: '#4ADE80',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#60A5FA',
};

interface ThemeState {
  themeMode: ThemeMode;
  isDarkMode: boolean;
  themeId: string;
  colors: ThemeOption['colors'];
  soundsEnabled: boolean;
  ambientSound: 'none' | 'river' | 'forest' | 'lofi' | 'rain';
  backgroundEffect: BackgroundEffectType;
  customThemes: ThemeOption[];
  soundTrigger: { type: 'complete' | 'delete' | 'undo' | 'click' | 'fanfare' | 'timer', timestamp: number } | null;

  setThemeMode: (mode: ThemeMode) => void;
  setIsDarkMode: (isDark: boolean) => void;
  toggleTheme: () => void;
  setThemeId: (id: string) => void;
  addCustomTheme: (theme: ThemeOption) => void;
  removeCustomTheme: (id: string) => void;
  setSoundsEnabled: (enabled: boolean) => void;
  setAmbientSound: (sound: 'none' | 'river' | 'forest' | 'lofi' | 'rain') => void;
  setBackgroundEffect: (effect: BackgroundEffectType) => void;
  triggerSound: (type: 'complete' | 'delete' | 'undo' | 'click' | 'fanfare' | 'timer') => void;
  getActiveTheme: () => ThemeOption;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      themeMode: 'system',
      isDarkMode: false,
      themeId: 'default',
      colors: getThemeById('default').colors,
      soundsEnabled: true,
      ambientSound: 'none',
      soundTrigger: null,
      backgroundEffect: 'bokeh',
      customThemes: [],

      setThemeMode: (mode: ThemeMode) => set({
        themeMode: mode
      }),

      setIsDarkMode: (isDark: boolean) => {
        const state = get();
        const allThemes = [...THEMES, ...state.customThemes];
        const theme = allThemes.find(t => t.id === state.themeId) || allThemes[0];

        // TEMA DOSYASINA DOKUNMA kuralına uyarak dinamik renk hesaplama
        const baseColors = isDark ? darkBase : lightBase;
        const colors = {
          ...baseColors,
          primary: theme.colors.primary,
          secondary: theme.colors.secondary || theme.colors.primary,
          // Eğer temada özel başarı/hata renkleri varsa onları koru, yoksa base kullan
          success: theme.colors.success && isDark ? theme.colors.success : baseColors.success,
          warning: theme.colors.warning && isDark ? theme.colors.warning : baseColors.warning,
          error: theme.colors.error && isDark ? theme.colors.error : baseColors.error,
          info: theme.colors.info && isDark ? theme.colors.info : baseColors.info,
        };

        set({
          isDarkMode: isDark,
          colors: colors as any
        });
      },

      toggleTheme: () => {
        const state = get();
        const newIsDarkMode = !state.isDarkMode;
        state.setIsDarkMode(newIsDarkMode);
      },

      setThemeId: (id: string) => {
        const state = get();
        const allThemes = [...THEMES, ...state.customThemes];
        const theme = allThemes.find(t => t.id === id) || allThemes[0];

        const baseColors = state.isDarkMode ? darkBase : lightBase;
        const colors = {
          ...baseColors,
          primary: theme.colors.primary,
          secondary: theme.colors.secondary || theme.colors.primary,
          // Tema değişiminde renk tutarlılığı ve okunabilirlik sağlaması
          success: theme.colors.success && state.isDarkMode ? theme.colors.success : baseColors.success,
          warning: theme.colors.warning && state.isDarkMode ? theme.colors.warning : baseColors.warning,
          error: theme.colors.error && state.isDarkMode ? theme.colors.error : baseColors.error,
          info: theme.colors.info && state.isDarkMode ? theme.colors.info : baseColors.info,
        };

        set({
          themeId: id,
          colors: colors as any
        });
      },

      addCustomTheme: (theme: ThemeOption) => {
        const state = get();
        const updatedCustomThemes = [theme, ...state.customThemes.filter(t => t.id !== theme.id)].slice(0, 10);

        let currentColors = theme.colors;
        if (state.isDarkMode) {
          if (theme.darkColors) {
            currentColors = theme.darkColors;
          } else {
            currentColors = {
              ...darkBase,
              primary: theme.colors.primary,
              secondary: theme.colors.secondary || theme.colors.primary,
            } as any;
          }
        } else {
          if (theme.lightColors) {
            currentColors = theme.lightColors;
          } else {
            currentColors = {
              ...lightBase,
              primary: theme.colors.primary,
              secondary: theme.colors.secondary || theme.colors.primary,
            } as any;
          }
        }

        const finalColors = {
          ...currentColors,
          secondary: currentColors.secondary || currentColors.primary
        };

        set({
          customThemes: updatedCustomThemes,
          themeId: theme.id,
          colors: finalColors
        });
      },

      removeCustomTheme: (id: string) => {
        const state = get();
        const updatedCustomThemes = state.customThemes.filter(t => t.id !== id);
        
        // If the currently selected theme is being deleted, switch to default
        if (state.themeId === id) {
          const allThemes = [...THEMES, ...updatedCustomThemes];
          const newTheme = allThemes.find(t => t.id === 'default') || allThemes[0];
          
          let colors = newTheme.colors;
          if (state.isDarkMode && newTheme.darkColors) {
            colors = newTheme.darkColors;
          } else if (!state.isDarkMode && newTheme.lightColors) {
            colors = newTheme.lightColors;
          }

          set({
            customThemes: updatedCustomThemes,
            themeId: newTheme.id,
            colors
          });
        } else {
          set({
            customThemes: updatedCustomThemes
          });
        }
      },

      setSoundsEnabled: (enabled: boolean) => set({
        soundsEnabled: enabled
      }),

      setAmbientSound: (sound: 'none' | 'river' | 'forest' | 'lofi' | 'rain') => set({
        ambientSound: sound
      }),

      setBackgroundEffect: (effect: BackgroundEffectType) => set({
        backgroundEffect: effect,
      }),

      triggerSound: (type: 'complete' | 'delete' | 'undo' | 'click' | 'fanfare' | 'timer') => set({
        soundTrigger: { type, timestamp: Date.now() }
      }),

      getActiveTheme: () => {
        const state = get();
        const allThemes = [...THEMES, ...state.customThemes];
        const theme = allThemes.find(t => t.id === state.themeId) || allThemes[0];
        return theme;
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);