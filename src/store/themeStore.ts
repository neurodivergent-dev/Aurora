import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeOption, getThemeById, getThemeByIdAndMode } from '../constants/themes';

type ThemeMode = 'light' | 'dark' | 'system';
export type BackgroundEffectType = 'none' | 'bokeh' | 'quantum' | 'waves' | 'crystals' | 'tesseract' | 'aurora' | 'matrix' | 'vortex' | 'grid' | 'silk' | 'prism' | 'dynamic';

interface ThemeState {
  // Tema ayarları
  themeMode: ThemeMode;
  isDarkMode: boolean;
  themeId: string; // Tema renk kimliği
  colors: ThemeOption['colors']; // Aktif tema renkleri
  soundsEnabled: boolean;
  ambientSound: 'none' | 'river' | 'forest' | 'lofi' | 'rain' | 'zen';
  backgroundEffect: BackgroundEffectType;
  customBackgroundConfig: any | null; // AI-generated background config
  customThemes: ThemeOption[]; // AI veya kullanıcı tarafından eklenen temalar
  
  // Tema ayarlama metodları
  setThemeMode: (mode: ThemeMode) => void;
  setIsDarkMode: (isDark: boolean) => void;
  toggleTheme: () => void;
  setThemeId: (id: string) => void; // Yeni tema rengi seçme
  addCustomTheme: (theme: ThemeOption) => void; // Yeni tema ekleme
  setSoundsEnabled: (enabled: boolean) => void;
  setAmbientSound: (sound: 'none' | 'river' | 'forest' | 'lofi' | 'rain' | 'zen') => void;
  setBackgroundEffect: (effect: BackgroundEffectType) => void;
  setCustomBackgroundConfig: (config: any) => void; // Dynamically set background config
  triggerSound: (type: 'complete' | 'delete' | 'undo' | 'click' | 'fanfare' | 'timer') => void;
  soundTrigger: { type: 'complete' | 'delete' | 'undo' | 'click' | 'fanfare' | 'timer', timestamp: number } | null;
  getActiveTheme: () => ThemeOption; // Aktif temayı alma
  isZenMode: boolean;
  setIsZenMode: (isZen: boolean) => void;
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
      customBackgroundConfig: null,
      customThemes: [],
      isZenMode: false,
      
      setIsZenMode: (isZen: boolean) => set({ isZenMode: isZen }),
      
      setThemeMode: (mode: ThemeMode) => set({ 
        themeMode: mode 
      }),
      
      setIsDarkMode: (isDark: boolean) => {
        const state = get();
        const allThemes = [...ThemeConstants.THEMES, ...state.customThemes];
        const theme = allThemes.find(t => t.id === state.themeId) || allThemes[0];
        
        // Pick colors for current mode
        let colors = theme.colors;
        if (isDark && theme.darkColors) {
          colors = theme.darkColors;
        } else if (!isDark && theme.lightColors) {
          colors = theme.lightColors;
        } else if (!isDark) {
           // Fallback for light mode: base + theme primary/secondary
           colors = {
             ...ThemeConstants.lightBase,
             primary: theme.colors.primary,
             secondary: theme.colors.secondary,
           } as any;
        } else {
           // Fallback for dark mode: base + theme primary/secondary
           colors = {
             ...ThemeConstants.darkBase,
             primary: theme.colors.primary,
             secondary: theme.colors.secondary,
           } as any;
        }

        set({ 
          isDarkMode: isDark,
          colors: colors
        });
      },
      
      toggleTheme: () => {
        const state = get();
        const newIsDarkMode = !state.isDarkMode;
        state.setIsDarkMode(newIsDarkMode);
      },
      
      setThemeId: (id: string) => {
        const state = get();
        const allThemes = [...ThemeConstants.THEMES, ...state.customThemes];
        const theme = allThemes.find(t => t.id === id) || allThemes[0];
        
        // Pick colors based on current mode
        let colors = theme.colors;
        if (state.isDarkMode && theme.darkColors) {
          colors = theme.darkColors;
        } else if (!state.isDarkMode && theme.lightColors) {
          colors = theme.lightColors;
        } else if (!state.isDarkMode) {
          // Light fallback
          colors = {
            ...ThemeConstants.lightBase,
            primary: theme.colors.primary,
            secondary: theme.colors.secondary,
          } as any;
        } else {
          // Dark fallback (default theme behavior)
          colors = {
            ...ThemeConstants.darkBase,
            primary: theme.colors.primary,
            secondary: theme.colors.secondary,
          } as any;
        }
        
        set({ 
          themeId: id,
          colors: colors
        });
      },

      addCustomTheme: (theme: ThemeOption) => {
        const state = get();
        const updatedCustomThemes = [theme, ...state.customThemes.filter(t => t.id !== theme.id)].slice(0, 10);
        
        // Pick colors for new theme based on current mode
        let currentColors = theme.colors;
        if (state.isDarkMode && theme.darkColors) {
          currentColors = theme.darkColors;
        } else if (!state.isDarkMode && theme.lightColors) {
          currentColors = theme.lightColors;
        }

        // CRITICAL: Prevent LinearGradient crash by ensuring primary/secondary are never null
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

      setSoundsEnabled: (enabled: boolean) => set({ 
        soundsEnabled: enabled 
      }),
      
      setAmbientSound: (sound: 'none' | 'river' | 'forest' | 'lofi' | 'rain' | 'zen') => set({ 
        ambientSound: sound 
      }),

      setBackgroundEffect: (effect: BackgroundEffectType) => set({ 
        backgroundEffect: effect 
      }),

      setCustomBackgroundConfig: (config: any) => set({
        customBackgroundConfig: config,
        backgroundEffect: 'dynamic' as any // Switch to dynamic mode automatically
      }),

      triggerSound: (type: 'complete' | 'delete' | 'undo' | 'click' | 'fanfare' | 'timer') => set({ 
        soundTrigger: { type, timestamp: Date.now() } 
      }),

      getActiveTheme: () => {
        const state = get();
        const allThemes = [...ThemeConstants.THEMES, ...state.customThemes];
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

// Helper for access to static constants
const ThemeConstants = {
  THEMES: require('../constants/themes').THEMES as ThemeOption[],
  lightBase: {
    background: '#F2F2F7',
    card: '#FFFFFF',
    cardBackground: '#FFFFFF',
    cardBorder: 'rgba(0, 0, 0, 0.05)',
    text: '#1C1C1E',
    subText: '#8E8E93',
    border: 'rgba(0, 0, 0, 0.05)',
    success: '#34C759',
    warning: '#FFCC00',
    error: '#FF3B30',
    info: '#007AFF',
  },
  darkBase: {
    background: '#0F0F11',
    card: 'rgba(30, 30, 35, 0.6)',
    cardBackground: 'rgba(30, 30, 35, 0.6)',
    cardBorder: 'rgba(255, 255, 255, 0.1)',
    text: '#FFFFFF',
    subText: '#8E8E93',
    border: 'rgba(255, 255, 255, 0.1)',
    success: '#32D74B',
    warning: '#FFD60A',
    error: '#FF453A',
    info: '#0A84FF',
  }
}; 