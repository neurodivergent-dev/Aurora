# 🚀 AURORA CORE - IMPLEMENTATION GUIDE

**Practical guide to extracting Aurora's core into reusable packages**

---

## 📦 QUICK START

### Option 1: Incremental Extraction (Recommended)

Keep Aurora working while extracting modules step-by-step.

```bash
# 1. Create packages directory
mkdir -p packages/core packages/ui packages/effects

# 2. Initialize core package
cd packages/core
npm init -y
# Edit package.json → name: "@aurora/core"

# 3. Create source structure
mkdir -p src/state src/theme src/i18n src/utils src/hooks
```

### Option 2: Clean Monorepo Setup

Use Turborepo for proper monorepo management.

```bash
# Root directory
npx create-turbo@latest aurora-monorepo
cd aurora-monorepo

# Create packages
mkdir -p packages/core packages/ui packages/effects apps/aurora apps/demo
```

---

## 🏗️ PACKAGE 1: @aurora/core

### package.json

```json
{
  "name": "@aurora/core",
  "version": "0.1.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "jest"
  },
  "peerDependencies": {
    "react": ">=18",
    "react-native": ">=0.70",
    "zustand": ">=4",
    "react-native-reanimated": ">=3",
    "expo-localization": ">=14",
    "i18next": ">=23",
    "react-i18next": ">=13"
  },
  "dependencies": {
    "react-native-logs": "^5.6.0"
  },
  "optionalDependencies": {
    "react-native-mmkv": ">=2",
    "@react-native-async-storage/async-storage": ">=1",
    "expo-secure-store": ">=12"
  },
  "devDependencies": {
    "@types/react": "~18.2.0",
    "typescript": "~5.3.0"
  }
}
```

### tsconfig.json

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.tsx"]
}
```

### src/index.ts (Main Entry)

```typescript
// State Management
export { createAppStore } from './state/createStore';
export { mmkvAdapter, asyncStorageAdapter, secureStorageAdapter } from './state/storage';
export type { StorageAdapter, StoreConfig } from './state/types';

// Theme System
export { ThemeProvider, useTheme, DEFAULT_THEMES } from './theme/ThemeProvider';
export type { ThemeColors, ThemeOption, ThemeMode, ThemeProviderProps } from './theme/types';

// i18n
export { createI18n, useTranslation } from './i18n/i18n';
export type { TranslationResource, Locale, I18nConfig } from './i18n/types';

// Utils
export { createLogger, logger } from './utils/logger';
export { backupData, restoreData } from './utils/backup';
export type { BackupData, RestoreOptions } from './utils/types';

// Hooks
export { useColorScheme } from './hooks/useColorScheme';
export { useStorage } from './hooks/useStorage';

// Navigation
export { Router } from './navigation/Router';
export type { RouteConfig, TabRoute } from './navigation/types';
```

### src/state/createStore.ts

```typescript
import { create, StateCreator, StoreMutatorIdentifier } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { StorageAdapter, StoreConfig } from './types';

// MMKV Adapter
export const mmkvAdapter: StorageAdapter = {
  setItem: (key, value) => {
    try {
      const { createMMKV } = require('react-native-mmkv');
      const mmkv = createMMKV({ id: `aurora-${key}` });
      mmkv.set(key, value);
    } catch (e) {
      console.error('MMKV setItem error:', e);
    }
  },
  getItem: (key) => {
    try {
      const { createMMKV } = require('react-native-mmkv');
      const mmkv = createMMKV({ id: `aurora-${key}` });
      return mmkv.getString(key) ?? null;
    } catch (e) {
      console.error('MMKV getItem error:', e);
      return null;
    }
  },
  removeItem: (key) => {
    try {
      const { createMMKV } = require('react-native-mmkv');
      const mmkv = createMMKV({ id: `aurora-${key}` });
      mmkv.remove(key);
    } catch (e) {
      console.error('MMKV removeItem error:', e);
    }
  },
};

// AsyncStorage Adapter
export const asyncStorageAdapter: StorageAdapter = {
  setItem: async (key, value) => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.error('AsyncStorage setItem error:', e);
    }
  },
  getItem: async (key) => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      return await AsyncStorage.getItem(key);
    } catch (e) {
      console.error('AsyncStorage getItem error:', e);
      return null;
    }
  },
  removeItem: async (key) => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error('AsyncStorage removeItem error:', e);
    }
  },
};

// SecureStore Adapter (for sensitive data)
export const secureStorageAdapter: StorageAdapter = {
  setItem: async (key, value) => {
    try {
      const SecureStore = require('expo-secure-store');
      await SecureStore.setItemAsync(key, value);
    } catch (e) {
      console.error('SecureStore setItem error:', e);
    }
  },
  getItem: async (key) => {
    try {
      const SecureStore = require('expo-secure-store');
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      console.error('SecureStore getItem error:', e);
      return null;
    }
  },
  removeItem: async (key) => {
    try {
      const SecureStore = require('expo-secure-store');
      await SecureStore.deleteItemAsync(key);
    } catch (e) {
      console.error('SecureStore removeItem error:', e);
    }
  },
};

// Generic store factory
export function createAppStore<T extends object>(
  slice: StateCreator<T, [], []>,
  config: StoreConfig<T>
) {
  const getStorageAdapter = () => {
    if (typeof config.storage === 'object') {
      return createJSONStorage(() => config.storage as StorageAdapter);
    }
    
    switch (config.storage) {
      case 'mmkv':
        return createJSONStorage(() => mmkvAdapter);
      case 'secure':
        return createJSONStorage(() => secureStorageAdapter);
      case 'async':
      default:
        return createJSONStorage(() => asyncStorageAdapter);
    }
  };

  const storage = getStorageAdapter();

  return create<T>()(
    persist(slice, {
      name: config.name,
      storage,
      partialize: config.persistKeys 
        ? (state) => {
            const partial: Record<string, unknown> = {};
            config.persistKeys?.forEach(key => {
              if (key in state) {
                partial[key as string] = state[key as keyof T];
              }
            });
            return partial;
          }
        : undefined,
      version: config.version ?? 1,
      onRehydrateStorage: () => {
        console.log('[Core] Store rehydrated:', config.name);
        return (state, error) => {
          if (error) {
            console.error('[Core] Store rehydration error:', error);
          }
        };
      },
    })
  );
}
```

### src/state/types.ts

```typescript
export interface StorageAdapter {
  setItem: (key: string, value: string) => Promise<void> | void;
  getItem: (key: string) => Promise<string | null> | string | null;
  removeItem: (key: string) => Promise<void> | void;
}

export type StorageType = 'mmkv' | 'async' | 'secure';

export interface StoreConfig<T> {
  /** Unique store name (used as storage key) */
  name: string;
  /** Storage type or custom adapter */
  storage: StorageType | StorageAdapter;
  /** Keys to persist (if undefined, persist all) */
  persistKeys?: (keyof T)[];
  /** Storage version for migrations */
  version?: number;
  /** Custom merge function */
  merge?: (persistedState: unknown, currentState: T) => T;
}
```

### src/theme/ThemeProvider.tsx

```typescript
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useColorScheme as useSystemColorScheme, StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemeColors, ThemeOption, ThemeMode, ThemeProviderProps } from './types';

// Context
interface ThemeContextType {
  colors: ThemeColors;
  isDarkMode: boolean;
  themeId: string;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  setThemeId: (id: string) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// Base color schemes
const lightBase: ThemeColors = {
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

const darkBase: ThemeColors = {
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

// Default themes (subset - add all 35+ from Aurora)
export const DEFAULT_THEMES: ThemeOption[] = [
  {
    id: 'default',
    name: 'Aurora',
    colors: {
      ...darkBase,
      primary: '#6366F1',
      secondary: '#A855F7',
      info: '#3B82F6',
      background: '#0B0B1E',
      card: 'rgba(20, 20, 45, 0.7)',
    },
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    colors: {
      ...darkBase,
      primary: '#5E6AD2',
      secondary: '#A78BFA',
    },
  },
  {
    id: 'neon',
    name: 'Neon',
    colors: {
      ...darkBase,
      primary: '#F700FF',
      secondary: '#00FFFF',
    },
  },
];

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultThemeId = 'default',
  defaultThemeMode = 'system',
  customThemes = [],
  storageKey = 'theme-storage',
  transitionDuration = 300,
}) => {
  const systemColorScheme = useSystemColorScheme();
  
  const [themeMode, setThemeModeState] = useState<ThemeMode>(defaultThemeMode);
  const [themeId, setThemeIdState] = useState(defaultThemeId);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [colors, setColors] = useState<ThemeColors>(darkBase);
  const [isLoaded, setIsLoaded] = useState(false);

  // Transition animation
  const contentOpacity = useSharedValue(1);
  const prevThemeIdRef = useRef(themeId);
  const prevIsDarkRef = useRef(isDarkMode);

  // Load from storage
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const stored = await AsyncStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.state) {
            setThemeModeState(parsed.state.themeMode || defaultThemeMode);
            setThemeIdState(parsed.state.themeId || defaultThemeId);
            setIsDarkMode(parsed.state.isDarkMode || false);
          }
        }
      } catch (e) {
        console.error('Theme load error:', e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadTheme();
  }, [storageKey, defaultThemeMode, defaultThemeId]);

  // Save to storage
  useEffect(() => {
    if (!isLoaded) return;
    
    const saveTheme = async () => {
      try {
        await AsyncStorage.setItem(storageKey, JSON.stringify({
          state: { themeMode, themeId, isDarkMode }
        }));
      } catch (e) {
        console.error('Theme save error:', e);
      }
    };
    saveTheme();
  }, [themeMode, themeId, isDarkMode, isLoaded, storageKey]);

  // System color scheme
  useEffect(() => {
    if (themeMode === "system" && systemColorScheme) {
      setIsDarkMode(systemColorScheme === "dark");
    }
  }, [systemColorScheme, themeMode]);

  // Detect theme changes
  useEffect(() => {
    if (prevThemeIdRef.current !== themeId || prevIsDarkRef.current !== isDarkMode) {
      contentOpacity.value = 0;
      contentOpacity.value = withTiming(1, {
        duration: transitionDuration,
        easing: Easing.out(Easing.quad)
      });
      prevThemeIdRef.current = themeId;
      prevIsDarkRef.current = isDarkMode;
    }
  }, [themeId, isDarkMode, contentOpacity, transitionDuration]);

  // Update colors
  useEffect(() => {
    const allThemes = [...DEFAULT_THEMES, ...customThemes];
    const theme = allThemes.find(t => t.id === themeId) || allThemes[0];
    
    const baseColors = isDarkMode 
      ? (theme.darkColors || darkBase) 
      : (theme.lightColors || lightBase);
    
    setColors({
      ...baseColors,
      primary: theme.colors.primary,
      secondary: theme.colors.secondary || theme.colors.primary,
    });
  }, [themeId, isDarkMode, customThemes]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    if (mode === 'system' && systemColorScheme) {
      setIsDarkMode(systemColorScheme === "dark");
    }
  };

  const setThemeId = (id: string) => {
    setThemeIdState(id);
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const animatedContentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  if (!isLoaded) {
    return null; // Or loading component
  }

  return (
    <ThemeContext.Provider
      value={{
        colors,
        isDarkMode,
        themeId,
        themeMode,
        setThemeMode,
        setThemeId,
        toggleTheme,
      }}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Animated.View style={[styles.container, animatedContentStyle]}>
          {children}
        </Animated.View>
      </View>
    </ThemeContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ThemeProvider;
```

### src/theme/types.ts

```typescript
export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  card: string;
  cardBackground: string;
  cardBorder: string;
  text: string;
  subText: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface ThemeOption {
  id: string;
  name: string;
  colors: ThemeColors;
  lightColors?: ThemeColors;
  darkColors?: ThemeColors;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultThemeId?: string;
  defaultThemeMode?: ThemeMode;
  customThemes?: ThemeOption[];
  storageKey?: string;
  transitionDuration?: number;
}
```

### src/i18n/i18n.ts

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TranslationResource, Locale, I18nConfig } from './types';

// Default locales
const defaultLocales: Locale[] = [
  {
    code: 'en',
    name: 'English',
    translations: {
      app: { name: 'App', slogan: 'Your Slogan' },
      common: { 
        cancel: 'Cancel', 
        confirm: 'Confirm', 
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
      },
      tabs: { home: 'Home', settings: 'Settings' },
    },
  },
  {
    code: 'tr',
    name: 'Türkçe',
    translations: {
      app: { name: 'Uygulama', slogan: 'Sloganınız' },
      common: { 
        cancel: 'İptal', 
        confirm: 'Onayla', 
        loading: 'Yükleniyor...',
        error: 'Hata',
        success: 'Başarılı',
      },
      tabs: { home: 'Ana Sayfa', settings: 'Ayarlar' },
    },
  },
  {
    code: 'ja',
    name: '日本語',
    translations: {
      app: { name: 'アプリ', slogan: 'あなたのスローガン' },
      common: { 
        cancel: 'キャンセル', 
        confirm: '確認', 
        loading: '読み込み中...',
        error: 'エラー',
        success: '成功',
      },
      tabs: { home: 'ホーム', settings: '設定' },
    },
  },
];

export function createI18n(config: I18nConfig) {
  const {
    defaultLocale = 'en',
    supportedLocales = ['en', 'tr', 'ja'],
    locales = defaultLocales,
    storageKey = 'language-storage',
  } = config;

  const resources: Record<string, { translation: TranslationResource }> = {};
  locales.forEach(locale => {
    resources[locale.code] = { translation: locale.translations };
  });

  const getDeviceLanguage = (): string => {
    try {
      const deviceLocale = getLocales()[0];
      const deviceLanguage = deviceLocale?.languageCode;
      
      if (deviceLanguage && supportedLocales.includes(deviceLanguage)) {
        return deviceLanguage;
      }
      
      // Fallback for composite codes (tr-TR, en-US, etc.)
      if (deviceLanguage) {
        const baseLang = deviceLanguage.split('-')[0];
        if (supportedLocales.includes(baseLang)) {
          return baseLang;
        }
      }
      
      return defaultLocale;
    } catch (error) {
      console.error('Error detecting device language:', error);
      return defaultLocale;
    }
  };

  const initialLanguage = getDeviceLanguage();

  i18n.use(initReactI18next).init({
    resources,
    fallbackLng: defaultLocale,
    interpolation: {
      escapeValue: false,
    },
    lng: initialLanguage,
    react: {
      useSuspense: false,
    },
  });

  // Load stored language
  const loadStoredLanguage = async () => {
    try {
      const languageData = await AsyncStorage.getItem(storageKey);
      if (languageData) {
        const parsedData = JSON.parse(languageData);
        const storedLanguage = parsedData.state?.currentLanguage;
        
        if (storedLanguage && supportedLocales.includes(storedLanguage)) {
          await i18n.changeLanguage(storedLanguage);
          return;
        }
      }
      // If no stored language, device language is already set
    } catch (error) {
      console.error('Error loading language:', error);
      i18n.changeLanguage(defaultLocale);
    }
  };

  loadStoredLanguage();

  return {
    i18n,
    changeLanguage: i18n.changeLanguage.bind(i18n),
    t: i18n.t.bind(i18n),
    language: i18n.language,
    addLocale: (locale: Locale) => {
      i18n.addResourceBundle(locale.code, 'translation', locale.translations);
      if (!supportedLocales.includes(locale.code)) {
        supportedLocales.push(locale.code);
      }
    },
  };
}

export const useTranslation = () => {
  const { t, i18n } = require('react-i18next');
  return { t, i18n };
};

export default i18n;
```

### src/i18n/types.ts

```typescript
export interface TranslationResource {
  [key: string]: string | Record<string, string>;
}

export interface Locale {
  code: string;
  name: string;
  translations: TranslationResource;
}

export interface I18nConfig {
  defaultLocale?: string;
  supportedLocales?: string[];
  locales?: Locale[];
  storageKey?: string;
}
```

### src/utils/logger.ts

```typescript
import { logger, consoleTransport } from "react-native-logs";

export interface LoggerConfig {
  levels?: Record<string, number>;
  severity?: string;
  enabled?: boolean;
  dateFormat?: string;
  printLevel?: boolean;
  printDate?: boolean;
}

const defaultConfig: LoggerConfig = {
  levels: {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  },
  severity: __DEV__ ? "debug" : "info",
  transport: consoleTransport,
  transportOptions: {
    colors: {
      info: "blueBright",
      warn: "yellowBright",
      error: "redBright",
    } as Record<string, "blueBright" | "yellowBright" | "redBright">,
  },
  async: true,
  dateFormat: "time",
  printLevel: true,
  printDate: true,
  enabled: true,
};

export function createLogger(config: LoggerConfig = defaultConfig) {
  const log = logger.createLogger(config);

  return {
    debug: (message: string, tag?: string) => {
      const prefix = tag ? `[${tag}] ` : "";
      log.debug(`${prefix}${message}`);
    },
    info: (message: string, tag?: string) => {
      const prefix = tag ? `[${tag}] ` : "";
      log.info(`${prefix}${message}`);
    },
    warn: (message: string, tag?: string) => {
      const prefix = tag ? `[${tag}] ` : "";
      log.warn(`${prefix}${message}`);
    },
    error: (message: string, tag?: string) => {
      const prefix = tag ? `[${tag}] ` : "";
      log.error(`${prefix}${message}`);
    },
  };
}

export const logger = createLogger(defaultConfig);
export default logger;
```

### src/utils/backup.ts

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import logger from './logger';

export interface BackupData {
  version: string;
  timestamp: number;
  data: Record<string, unknown>;
}

export interface RestoreOptions {
  merge?: boolean;
  keys?: string[];
}

export async function backupData(
  keys: string[],
  filename: string = 'aurora-backup.json'
): Promise<boolean> {
  try {
    const data: Record<string, unknown> = {};
    
    for (const key of keys) {
      const value = await AsyncStorage.getItem(key);
      if (value) {
        data[key] = JSON.parse(value);
      }
    }

    const backup: BackupData = {
      version: '1.0.0',
      timestamp: Date.now(),
      data,
    };

    // In React Native, you'd typically save to file system
    // For simplicity, we'll just log it here
    const jsonString = JSON.stringify(backup, null, 2);
    logger.info(`Backup created: ${jsonString.length} bytes`, 'Backup');
    
    // TODO: Implement actual file export
    // await FileSystem.writeAsStringAsync(filePath, jsonString);
    // await Sharing.shareAsync(filePath);
    
    return true;
  } catch (error) {
    logger.error(`Backup failed: ${error}`, 'Backup');
    return false;
  }
}

export async function restoreData(
  jsonFile: string,
  options: RestoreOptions = {}
): Promise<boolean> {
  try {
    const { merge = true, keys } = options;
    
    // TODO: Implement file picker
    // const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
    
    const jsonString = jsonFile; // From file
    const backup: BackupData = JSON.parse(jsonString);
    
    if (!backup.data) {
      throw new Error('Invalid backup format');
    }

    const keysToRestore = keys || Object.keys(backup.data);
    
    for (const key of keysToRestore) {
      if (backup.data[key]) {
        if (merge) {
          const existing = await AsyncStorage.getItem(key);
          if (existing) {
            const merged = { ...JSON.parse(existing), ...backup.data[key] };
            await AsyncStorage.setItem(key, JSON.stringify(merged));
          } else {
            await AsyncStorage.setItem(key, JSON.stringify(backup.data[key]));
          }
        } else {
          await AsyncStorage.setItem(key, JSON.stringify(backup.data[key]));
        }
      }
    }

    logger.info('Backup restored successfully', 'Backup');
    return true;
  } catch (error) {
    logger.error(`Restore failed: ${error}`, 'Backup');
    return false;
  }
}
```

---

## 🎨 PACKAGE 2: @aurora/ui

### package.json

```json
{
  "name": "@aurora/ui",
  "version": "0.1.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "peerDependencies": {
    "react": ">=18",
    "react-native": ">=0.70",
    "react-native-reanimated": ">=3",
    "expo-blur": ">=12"
  },
  "dependencies": {
    "@aurora/core": "^0.1.0"
  }
}
```

### src/index.ts

```typescript
// Buttons
export { ThemedButton } from './Button/ThemedButton';
export type { ThemedButtonProps } from './Button/types';

// Cards
export { ThemedCard } from './Card/ThemedCard';
export type { ThemedCardProps } from './Card/types';

// Containers
export { GlassContainer } from './Container/GlassContainer';
export type { GlassContainerProps } from './Container/types';

// Alerts
export { CustomAlert, GlassAlert } from './Alert';
export type { AlertProps, AlertConfig } from './Alert/types';

// States
export { EmptyState } from './EmptyState';
export type { EmptyStateProps } from './EmptyState/types';

// Pagination
export { Paginator } from './Pagination';
export type { PaginatorProps } from './Pagination/types';

// Error Handling
export { ErrorBoundary } from './ErrorBoundary';
export type { ErrorBoundaryProps, FallbackProps } from './ErrorBoundary/types';
```

---

## ✨ PACKAGE 3: @aurora/effects

### package.json

```json
{
  "name": "@aurora/effects",
  "version": "0.1.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "peerDependencies": {
    "react": ">=18",
    "react-native": ">=0.70",
    "react-native-reanimated": ">=4"
  },
  "dependencies": {
    "@aurora/core": "^0.1.0"
  }
}
```

### src/index.ts

```typescript
export { BackgroundEffects } from './BackgroundEffects';
export type { BackgroundEffectType, BackgroundEffectsProps } from './types';

// Individual effects (for tree-shaking)
export { DreamscapeBokeh } from './effects/DreamscapeBokeh';
export { QuantumCloud } from './effects/QuantumCloud';
export { MatrixRain } from './effects/MatrixRain';
// ... export all 18 effects
```

---

## 📱 MIGRATING AURORA

### Step 1: Update package.json

```json
{
  "dependencies": {
    "@aurora/core": "file:../packages/core",
    "@aurora/ui": "file:../packages/ui",
    "@aurora/effects": "file:../packages/effects"
  }
}
```

### Step 2: Update imports

**Before:**
```typescript
import { useTheme } from '../src/components/ThemeProvider';
import { ThemedButton } from '../src/components/ThemedButton';
import { useThemeStore } from '../src/store/themeStore';
```

**After:**
```typescript
import { useTheme, ThemeProvider } from '@aurora/core';
import { ThemedButton } from '@aurora/ui';
import { createAppStore } from '@aurora/core';
```

### Step 3: Refactor stores

**Before:**
```typescript
export const useThemeStore = create<ThemeState>()(
  persist((set, get) => ({ ... }), { name: 'theme-storage', storage: ... })
);
```

**After:**
```typescript
export const useThemeStore = createAppStore<ThemeState>(
  (set, get) => ({ ... }),
  {
    name: 'theme-storage',
    storage: 'async',
    persistKeys: ['themeId', 'themeMode', 'isDarkMode'],
  }
);
```

---

## ✅ TESTING CHECKLIST

### Core Package

- [ ] createStore factory creates working stores
- [ ] All storage adapters work (MMKV, AsyncStorage, SecureStore)
- [ ] ThemeProvider provides colors correctly
- [ ] Theme switching works with animation
- [ ] i18n loads correct language
- [ ] Language switching works
- [ ] Logger outputs with correct levels
- [ ] Backup/restore functions work

### UI Package

- [ ] ThemedButton responds to presses
- [ ] ThemedCard displays with correct colors
- [ ] GlassContainer applies blur effect
- [ ] Alerts show/hide correctly
- [ ] EmptyState renders properly
- [ ] All components are accessible

### Effects Package

- [ ] BackgroundEffects renders without errors
- [ ] All 18 effects work
- [ ] Performance is smooth (60 FPS)
- [ ] Effects switch correctly

### Integration

- [ ] Aurora app builds successfully
- [ ] All screens work
- [ ] No console errors
- [ ] Performance is acceptable

---

## 🎯 NEXT STEPS

1. **Setup monorepo** - Initialize Turborepo
2. **Extract core** - Move state, theme, i18n, utils
3. **Extract UI** - Move components
4. **Extract effects** - Move background effects
5. **Update Aurora** - Migrate to use packages
6. **Create demo** - Build demo app
7. **Document** - Write comprehensive docs
8. **Publish** - Release to npm (optional)

---

**Estimated Time:** 4-5 weeks  
**Difficulty:** Intermediate  
**Impact:** High (enables rapid app development)
