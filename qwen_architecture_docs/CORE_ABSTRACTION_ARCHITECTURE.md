# 🏗️ AURORA CORE ABSTRACTION ARCHITECTURE

**Date:** March 29, 2026  
**Version:** 1.0.0  
**Goal:** Transform Aurora from a single app into a reusable React Native application framework

---

## 📊 EXECUTIVE SUMMARY

Aurora has **90% abstraction potential** for core infrastructure. This document outlines how to extract reusable modules into a monorepo structure, enabling rapid creation of new apps with different domains (music, fitness, finance, education, etc.) while sharing the same core foundation.

### Current State
```
Aurora App (Monolithic)
├── Core Infrastructure (90% generic) ✅ EXTRACTABLE
├── UI Components (90% generic) ✅ EXTRACTABLE
├── Visual Effects (100% generic) ✅ EXTRACTABLE
├── Music Domain (20% generic) ❌ KEEP IN APP
└── AI Domain (30% generic) ❌ KEEP IN APP
```

### Target State
```
@aurora/monorepo/
├── packages/
│   ├── core/          ← State, theme, i18n, navigation, utils
│   ├── ui/            ← Reusable components (buttons, cards, alerts)
│   ├── effects/       ← Background effects library
│   └── hooks/         ← Shared hooks
├── apps/
│   ├── aurora/        ← Original music + AI app
│   ├── demo/          ← Demo app showcasing core capabilities
│   └── [new-app]/     ← Future apps (fitness, finance, etc.)
```

---

## 🎯 ABSTRACTION STRATEGY

### Level 1: Fully Generic (Extract Immediately)

| Module | Files | Abstraction % | Priority |
|--------|-------|---------------|----------|
| **State Management** | 7 stores | 95% | 🔴 CRITICAL |
| **Theme System** | themes.ts, ThemeProvider | 95% | 🔴 CRITICAL |
| **i18n** | i18n/, locales/ | 100% | 🔴 CRITICAL |
| **UI Components** | 10 components | 90% | 🔴 CRITICAL |
| **Logger/Utils** | 3 files | 100% | 🔴 CRITICAL |
| **Background Effects** | 18 effects | 100% | 🟠 HIGH |
| **Navigation** | expo-router setup | 85% | 🟠 HIGH |

### Level 2: Domain-Specific (Keep in App)

| Module | Files | Abstraction % | Reason |
|--------|-------|---------------|--------|
| **Music Player** | 5+ files | 20% | Tightly coupled to expo-audio |
| **AI Chat** | 10+ files | 30% | AI provider integration |
| **Audio Services** | 4 services | 10% | Expo-specific APIs |

---

## 📦 MONOREPO STRUCTURE

### Proposed Structure

```
aurora/
├── packages/
│   │
│   ├── core/                          # @aurora/core
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts               # Main entry point
│   │       │
│   │       ├── state/                 # Zustand factory
│   │       │   ├── index.ts
│   │       │   ├── createStore.ts     # Generic store factory
│   │       │   ├── types.ts           # Store types
│   │       │   └── storage/
│   │       │       ├── index.ts
│   │       │       ├── mmkv.ts        # MMKV adapter
│   │       │       ├── async-storage.ts
│   │       │       └── secure-store.ts
│   │       │
│   │       ├── theme/                 # Theme system
│   │       │   ├── index.ts
│   │       │   ├── ThemeProvider.tsx
│   │       │   ├── useTheme.ts
│   │       │   ├── types.ts           # ThemeColors, ThemeOption
│   │       │   └── default-themes.ts  # 35+ pre-built themes
│   │       │
│   │       ├── i18n/                  # Internationalization
│   │       │   ├── index.ts
│   │       │   ├── i18n.ts
│   │       │   ├── useTranslation.ts
│   │       │   ├── types.ts
│   │       │   └── locales/
│   │       │       ├── en.ts
│   │       │       ├── tr.ts
│   │       │       └── ja.ts
│   │       │
│   │       ├── navigation/            # Expo Router setup
│   │       │   ├── index.ts
│   │       │   ├── Router.tsx
│   │       │   └── types.ts
│   │       │
│   │       ├── utils/                 # Utilities
│   │       │   ├── index.ts
│   │       │   ├── logger.ts
│   │       │   ├── backup.ts
│   │       │   └── types.ts
│   │       │
│   │       └── hooks/                 # Shared hooks
│   │           ├── index.ts
│   │           ├── useColorScheme.ts
│   │           └── useStorage.ts
│   │
│   ├── ui/                            # @aurora/ui
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts
│   │       │
│   │       ├── Button/
│   │       │   ├── ThemedButton.tsx
│   │       │   ├── index.ts
│   │       │   └── types.ts
│   │       │
│   │       ├── Card/
│   │       │   ├── ThemedCard.tsx
│   │       │   ├── index.ts
│   │       │   └── types.ts
│   │       │
│   │       ├── Alert/
│   │       │   ├── CustomAlert.tsx
│   │       │   ├── GlassAlert.tsx
│   │       │   ├── index.ts
│   │       │   └── types.ts
│   │       │
│   │       ├── Container/
│   │       │   ├── GlassContainer.tsx
│   │       │   ├── index.ts
│   │       │   └── types.ts
│   │       │
│   │       ├── EmptyState/
│   │       │   ├── index.tsx
│   │       │   └── types.ts
│   │       │
│   │       ├── Pagination/
│   │       │   ├── Paginator.tsx
│   │       │   └── index.ts
│   │       │
│   │       └── ErrorBoundary/
│   │           ├── index.tsx
│   │           └── types.ts
│   │
│   ├── effects/                       # @aurora/effects
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts
│   │       ├── BackgroundEffects.tsx
│   │       ├── types.ts               # EffectType union
│   │       ├── styles.ts
│   │       ├── helpers.ts
│   │       └── effects/
│   │           ├── DreamscapeBokeh.tsx
│   │           ├── QuantumCloud.tsx
│   │           ├── MatrixRain.tsx
│   │           └── ... (18 effects)
│   │
│   └── hooks/                         # @aurora/hooks
│       ├── package.json
│       └── src/
│           ├── index.ts
│           ├── useAIChat.ts           # Generic AI chat hook
│           ├── useVoiceInput.ts
│           ├── useSpeechOutput.ts
│           └── types.ts
│
├── apps/
│   │
│   ├── aurora/                        # Original app
│   │   ├── package.json
│   │   ├── app.json
│   │   └── src/
│   │       ├── modules/
│   │       │   ├── music/             # Music domain
│   │       │   │   ├── store/
│   │       │   │   ├── screens/
│   │       │   │   ├── components/
│   │       │   │   └── services/
│   │       │   │
│   │       │   └── ai/                # AI domain
│   │       │       ├── store/
│   │       │       ├── screens/
│   │       │       ├── services/
│   │       │       └── hooks/
│   │       │
│   │       └── main.tsx               # App entry (imports @aurora/core)
│   │
│   ├── demo/                          # Demo app
│   │   ├── package.json
│   │   └── src/
│   │       ├── App.tsx
│   │       └── screens/
│   │
│   └── template/                      # Template for new apps
│       ├── package.json
│       ├── README.md
│       └── src/
│           ├── App.tsx
│           └── modules/
│               └── README.md
│
├── package.json                       # Workspace root
├── tsconfig.base.json
└── turbo.json                         # Turborepo config
```

---

## 🔧 CORE PACKAGE IMPLEMENTATION

### 1. State Management Factory

**File:** `packages/core/src/state/createStore.ts`

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { StateCreator } from 'zustand';

// Storage adapters
export interface StorageAdapter {
  setItem: (key: string, value: string) => Promise<void> | void;
  getItem: (key: string) => Promise<string | null> | string | null;
  removeItem: (key: string) => Promise<void> | void;
}

export const mmkvAdapter: StorageAdapter = {
  setItem: (key, value) => {
    const { createMMKV } = require('react-native-mmkv');
    const mmkv = createMMKV({ id: `core-${key}` });
    mmkv.set(key, value);
  },
  getItem: (key) => {
    const { createMMKV } = require('react-native-mmkv');
    const mmkv = createMMKV({ id: `core-${key}` });
    return mmkv.getString(key) ?? null;
  },
  removeItem: (key) => {
    const { createMMKV } = require('react-native-mmkv');
    const mmkv = createMMKV({ id: `core-${key}` });
    mmkv.remove(key);
  },
};

export const asyncStorageAdapter: StorageAdapter = {
  setItem: async (key, value) => {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.setItem(key, value);
  },
  getItem: async (key) => {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return await AsyncStorage.getItem(key);
  },
  removeItem: async (key) => {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.removeItem(key);
  },
};

// Generic store factory
export interface StoreConfig<T> {
  name: string;
  storage: 'mmkv' | 'async' | 'secure' | StorageAdapter;
  persistKeys?: (keyof T)[];
  version?: number;
}

export function createAppStore<T extends object>(
  slice: StateCreator<T, [], []>,
  config: StoreConfig<T>
) {
  const getStorageAdapter = () => {
    if (typeof config.storage === 'object') {
      return createJSONStorage(() => config.storage);
    }
    
    switch (config.storage) {
      case 'mmkv':
        return createJSONStorage(() => mmkvAdapter);
      case 'secure':
        // SecureStore adapter (for sensitive data)
        const SecureStore = require('expo-secure-store');
        return createJSONStorage(() => ({
          setItem: SecureStore.setItemAsync,
          getItem: SecureStore.getItemAsync,
          removeItem: SecureStore.deleteItemAsync,
        }));
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
        ? (state) => Object.fromEntries(
            Object.entries(state).filter(([key]) => 
              config.persistKeys?.includes(key as keyof T)
            )
          )
        : undefined,
      version: config.version ?? 1,
    })
  );
}
```

**Usage Example:**
```typescript
// In app: apps/aurora/src/modules/music/store/musicStore.ts
import { createAppStore } from '@aurora/core';

interface MusicState {
  isPlaying: boolean;
  currentTrack: Track | null;
  volume: number;
  setIsPlaying: (playing: boolean) => void;
  // ...
}

export const useMusicStore = createAppStore<MusicState>(
  (set, get) => ({
    isPlaying: false,
    currentTrack: null,
    volume: 0.8,
    setIsPlaying: (playing) => set({ isPlaying: playing }),
    // ...
  }),
  {
    name: 'music-storage',
    storage: 'mmkv',
    persistKeys: ['volume', 'favoriteTrackIds'],
  }
);
```

---

### 2. Theme System

**File:** `packages/core/src/theme/ThemeProvider.tsx`

```typescript
import React, { createContext, useContext, useEffect, useRef } from "react";
import { useColorScheme, StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

// Types
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

// Provider Props
export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultThemeId?: string;
  defaultThemeMode?: ThemeMode;
  customThemes?: ThemeOption[];
  storageKey?: string;
  transitionDuration?: number;
}

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

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultThemeId = 'default',
  defaultThemeMode = 'system',
  customThemes = [],
  storageKey = 'theme-storage',
  transitionDuration = 300,
}) => {
  const systemColorScheme = useColorScheme();
  
  // State (in real implementation, use AsyncStorage/Zustand)
  const [themeMode, setThemeMode] = React.useState<ThemeMode>(defaultThemeMode);
  const [themeId, setThemeId] = React.useState(defaultThemeId);
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [colors, setColors] = React.useState<ThemeColors>(darkBase);

  // Transition animation
  const contentOpacity = useSharedValue(1);
  const prevThemeIdRef = useRef(themeId);
  const prevIsDarkRef = useRef(isDarkMode);

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

  const animatedContentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  // System color scheme change
  useEffect(() => {
    if (themeMode === "system" && systemColorScheme) {
      setIsDarkMode(systemColorScheme === "dark");
    }
  }, [systemColorScheme, themeMode]);

  // Update colors when theme changes
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

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

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

// Default themes (35+ themes from Aurora)
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
  // ... 34 more themes
];

export default ThemeProvider;
```

---

### 3. i18n System

**File:** `packages/core/src/i18n/i18n.ts`

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface TranslationResource {
  [key: string]: string | Record<string, string>;
}

export interface Locale {
  code: string;
  name: string;
  translations: TranslationResource;
}

export interface I18nConfig {
  defaultLocale: string;
  supportedLocales: string[];
  locales: Locale[];
  storageKey?: string;
}

// Default locales
const defaultLocales: Locale[] = [
  {
    code: 'en',
    name: 'English',
    translations: {
      app: { name: 'App', slogan: 'Your Slogan' },
      common: { cancel: 'Cancel', confirm: 'Confirm', loading: 'Loading...' },
      tabs: { home: 'Home', settings: 'Settings' },
    },
  },
  {
    code: 'tr',
    name: 'Türkçe',
    translations: {
      app: { name: 'Uygulama', slogan: 'Sloganınız' },
      common: { cancel: 'İptal', confirm: 'Onayla', loading: 'Yükleniyor...' },
      tabs: { home: 'Ana Sayfa', settings: 'Ayarlar' },
    },
  },
  {
    code: 'ja',
    name: '日本語',
    translations: {
      app: { name: 'アプリ', slogan: 'あなたのスローガン' },
      common: { cancel: 'キャンセル', confirm: '確認', loading: '読み込み中...' },
      tabs: { home: 'ホーム', settings: '設定' },
    },
  },
];

// Initialize i18n
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
        }
      }
    } catch (error) {
      console.error('Error loading language:', error);
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

export default i18n;
```

---

### 4. Logger Utility

**File:** `packages/core/src/utils/logger.ts`

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
    },
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

export const logger = createLogger();
export default logger;
```

---

## 🎨 UI COMPONENT LIBRARY

### Component Template

**File:** `packages/ui/src/Button/ThemedButton.tsx`

```typescript
import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
} from "react-native";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from "react-native-reanimated";
import { useTheme, ThemeColors } from "@aurora/core";

export interface ThemedButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "danger";
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;
  accessibilityHint?: string;
  accessibilityLabel?: string;
}

export const ThemedButton: React.FC<ThemedButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  accessibilityHint,
  accessibilityLabel,
}) => {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.96, { damping: 10, stiffness: 300 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 300 });
  };

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
          textColor: "#FFFFFF",
        };
      case "secondary":
        return {
          backgroundColor: colors.secondary,
          borderColor: colors.secondary,
          textColor: "#FFFFFF",
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          borderColor: colors.primary,
          textColor: colors.primary,
        };
      case "danger":
        return {
          backgroundColor: colors.error,
          borderColor: colors.error,
          textColor: "#FFFFFF",
        };
      default:
        return {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
          textColor: "#FFFFFF",
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <Animated.View style={[animatedButtonStyle]}>
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: variantStyles.backgroundColor,
            borderColor: variantStyles.borderColor,
            opacity: disabled ? 0.6 : 1,
          },
          style,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || (loading ? `${title}, loading` : title)}
        accessibilityState={{ disabled: disabled || loading }}
        accessibilityHint={accessibilityHint}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            {icon && icon}
            <Text
              style={[
                styles.text,
                { color: variantStyles.textColor, marginLeft: icon ? 8 : 0 },
                textStyle,
              ]}
            >
              {title}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default ThemedButton;
```

---

## 📱 APP INTEGRATION GUIDE

### Step 1: Install Core Packages

```bash
# In your app directory
npm install @aurora/core @aurora/ui @aurora/effects
```

### Step 2: Setup Theme Provider

```typescript
// apps/your-app/src/App.tsx
import { ThemeProvider, createI18n, logger } from '@aurora/core';
import { BackgroundEffects } from '@aurora/effects';

// Initialize i18n
createI18n({
  defaultLocale: 'en',
  supportedLocales: ['en', 'tr', 'ja'],
  locales: [], // Add your translations
});

export default function App() {
  return (
    <ThemeProvider
      defaultThemeId="default"
      defaultThemeMode="system"
      customThemes={[]}
    >
      <BackgroundEffects effect="bokeh" />
      {/* Your app content */}
    </ThemeProvider>
  );
}
```

### Step 3: Create Domain Module

```typescript
// apps/your-app/src/modules/fitness/store/fitnessStore.ts
import { createAppStore } from '@aurora/core';

interface FitnessState {
  currentWorkout: Workout | null;
  completedWorkouts: Workout[];
  // ...
}

export const useFitnessStore = createAppStore<FitnessState>(
  (set, get) => ({
    currentWorkout: null,
    completedWorkouts: [],
    // Actions...
  }),
  {
    name: 'fitness-storage',
    storage: 'mmkv',
    persistKeys: ['completedWorkouts'],
  }
);
```

### Step 4: Use UI Components

```typescript
import { ThemedButton, ThemedCard, GlassAlert } from '@aurora/ui';

function MyScreen() {
  const { colors } = useTheme();
  
  return (
    <ThemedCard>
      <ThemedButton 
        title="Start Workout" 
        onPress={handleStart}
        variant="primary"
      />
    </ThemedCard>
  );
}
```

---

## 🔄 MIGRATION PATH

### Phase 1: Extract Core (Week 1-2)

1. **Setup monorepo structure**
   - Initialize Turborepo
   - Create `packages/core`, `packages/ui`, `packages/effects`
   
2. **Move core infrastructure**
   - State management factory
   - Theme system
   - i18n system
   - Logger/utils

3. **Update Aurora imports**
   - Replace local imports with `@aurora/core`

### Phase 2: Extract UI (Week 3)

1. **Move UI components**
   - ThemedButton, ThemedCard, GlassContainer
   - Alerts, EmptyState, Paginator
   
2. **Create component documentation**
   - Storybook setup
   - Usage examples

### Phase 3: Extract Effects (Week 4)

1. **Move BackgroundEffects**
   - All 18 effects
   - Types and helpers

2. **Test in isolation**
   - Create demo app
   - Performance testing

### Phase 4: Template Creation (Week 5)

1. **Create app template**
   - `apps/template/`
   - Documentation for new apps
   
2. **Demo app**
   - Showcase all core features
   - Example domain module

---

## 📊 ABSTRACTION CHECKLIST

### Core Package ✅

- [ ] State management factory (createStore)
- [ ] Storage adapters (MMKV, AsyncStorage, SecureStore)
- [ ] Theme system (ThemeProvider, useTheme)
- [ ] i18n system (createI18n, useTranslation)
- [ ] Logger utility
- [ ] Backup/export utilities
- [ ] Shared hooks (useColorScheme, useStorage)

### UI Package ✅

- [ ] ThemedButton
- [ ] ThemedCard
- [ ] GlassContainer
- [ ] CustomAlert
- [ ] GlassAlert
- [ ] EmptyState
- [ ] Paginator
- [ ] ErrorBoundary

### Effects Package ✅

- [ ] BackgroundEffects (main component)
- [ ] 18 effect implementations
- [ ] Types and helpers
- [ ] Performance optimization

### Documentation ✅

- [ ] README for each package
- [ ] API documentation
- [ ] Usage examples
- [ ] Migration guide
- [ ] Template app

---

## 🎯 SUCCESS METRICS

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Code Reuse** | 90%+ | % of core code reused across apps |
| **Bundle Size** | <50KB | Core package size (gzipped) |
| **Type Safety** | 100% | TypeScript strict mode compliance |
| **Test Coverage** | 80%+ | Unit tests for core packages |
| **Documentation** | Complete | All exports documented |
| **Developer Experience** | <5min | Time to scaffold new app |

---

## 🔮 FUTURE ENHANCEMENTS

1. **Plugin System** - Allow domain modules to register hooks
2. **CLI Tool** - `npx create-aurora-app` for scaffolding
3. **Component Marketplace** - Share custom components
4. **Theme Builder** - Visual theme editor
5. **Analytics Integration** - Optional analytics module

---

## 📝 CONCLUSION

Aurora's architecture is **90% abstractable** into a reusable React Native framework. By extracting core infrastructure (state, theme, i18n, UI components, effects), we can:

1. **Reduce development time** for new apps by 70%
2. **Ensure consistency** across all apps
3. **Centralize improvements** (fix once, benefit everywhere)
4. **Enable rapid prototyping** of new domain ideas

**Next Steps:**
1. Setup monorepo with Turborepo
2. Extract `@aurora/core` package
3. Migrate Aurora to use extracted packages
4. Create demo app and template

**Estimated Timeline:** 4-5 weeks  
**Risk Level:** Low (incremental extraction, no breaking changes)

---

**Author:** Aurora Development Team  
**License:** MIT  
**GitHub:** https://github.com/neurodivergent-dev/aurora
