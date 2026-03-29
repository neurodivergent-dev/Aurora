# 🏗️ AURORA MONOREPO - STARTER TEMPLATE

**Ready-to-use monorepo structure for extracting Aurora core**

---

## 📦 DIRECTORY STRUCTURE

```
aurora-monorepo/
├── package.json                 # Root package (workspace config)
├── pnpm-workspace.yaml          # PNPM workspace (or use npm workspaces)
├── tsconfig.base.json           # Base TypeScript config
├── turbo.json                   # Turborepo config
├── .gitignore
├── README.md
│
├── packages/
│   │
│   ├── core/                    # @aurora/core
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── tsup.config.ts       # Build config
│   │   └── src/
│   │       ├── index.ts         # Main entry
│   │       ├── state/
│   │       │   ├── index.ts
│   │       │   ├── createStore.ts
│   │       │   ├── storage.ts
│   │       │   └── types.ts
│   │       ├── theme/
│   │       │   ├── index.ts
│   │       │   ├── ThemeProvider.tsx
│   │       │   ├── types.ts
│   │       │   └── default-themes.ts
│   │       ├── i18n/
│   │       │   ├── index.ts
│   │       │   ├── i18n.ts
│   │       │   ├── types.ts
│   │       │   └── locales/
│   │       │       ├── en.ts
│   │       │       ├── tr.ts
│   │       │       └── ja.ts
│   │       ├── utils/
│   │       │   ├── index.ts
│   │       │   ├── logger.ts
│   │       │   └── backup.ts
│   │       └── hooks/
│   │           ├── index.ts
│   │           └── useColorScheme.ts
│   │
│   ├── ui/                      # @aurora/ui
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── tsup.config.ts
│   │   └── src/
│   │       ├── index.ts
│   │       ├── Button/
│   │       │   ├── ThemedButton.tsx
│   │       │   ├── index.ts
│   │       │   └── types.ts
│   │       ├── Card/
│   │       │   ├── ThemedCard.tsx
│   │       │   ├── index.ts
│   │       │   └── types.ts
│   │       ├── Alert/
│   │       │   ├── CustomAlert.tsx
│   │       │   ├── GlassAlert.tsx
│   │       │   ├── index.ts
│   │       │   └── types.ts
│   │       ├── Container/
│   │       │   ├── GlassContainer.tsx
│   │       │   ├── index.ts
│   │       │   └── types.ts
│   │       ├── EmptyState/
│   │       │   ├── index.tsx
│   │       │   └── types.ts
│   │       ├── Pagination/
│   │       │   ├── Paginator.tsx
│   │       │   └── index.ts
│   │       └── ErrorBoundary/
│   │           ├── index.tsx
│   │           └── types.ts
│   │
│   └── effects/                 # @aurora/effects
│       ├── package.json
│       ├── tsconfig.json
│       ├── tsup.config.ts
│       └── src/
│           ├── index.ts
│           ├── BackgroundEffects.tsx
│           ├── types.ts
│           ├── styles.ts
│           ├── helpers.ts
│           └── effects/
│               ├── DreamscapeBokeh.tsx
│               ├── QuantumCloud.tsx
│               ├── MatrixRain.tsx
│               └── ... (18 effects)
│
└── apps/
    │
    ├── aurora/                  # Original Aurora app
    │   ├── package.json
    │   ├── app.json
    │   ├── tsconfig.json
    │   ├── metro.config.js
    │   ├── babel.config.js
    │   └── src/
    │       ├── App.tsx
    │       └── modules/
    │           ├── music/
    │           │   ├── store/
    │           │   │   └── musicStore.ts
    │           │   ├── screens/
    │           │   │   ├── MusicPlayerScreen.tsx
    │           │   │   └── PlaylistsScreen.tsx
    │           │   ├── components/
    │           │   │   ├── MiniPlayer.tsx
    │           │   │   └── TrackItem.tsx
    │           │   └── services/
    │           │       └── SoundService.ts
    │           │
    │           └── ai/
    │               ├── store/
    │               │   └── aiStore.ts
    │               ├── screens/
    │               │   └── AIChatScreen/
    │               ├── services/
    │               │   ├── aiService.ts
    │               │   ├── groqService.ts
    │               │   └── ollamaService.ts
    │               └── hooks/
    │                   └── useAIChat.ts
    │
    ├── demo/                    # Demo app (showcase core)
    │   ├── package.json
    │   ├── app.json
    │   └── src/
    │       ├── App.tsx
    │       └── screens/
    │           ├── HomeScreen.tsx
    │           ├── ThemeShowcase.tsx
    │           └── ComponentShowcase.tsx
    │
    └── template/                # Template for new apps
        ├── package.json
        ├── app.json
        ├── README.md
        └── src/
            ├── App.tsx
            └── modules/
                └── README.md
```

---

## 📝 ROOT CONFIGURATION FILES

### package.json (Root)

```json
{
  "name": "@aurora/monorepo",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "clean": "turbo run clean && rm -rf node_modules",
    "format": "prettier --write \"**/*.{ts,tsx,md}\"",
    "typecheck": "turbo run typecheck"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "prettier": "^3.2.0",
    "turbo": "^1.12.0",
    "typescript": "^5.3.0"
  },
  "packageManager": "pnpm@8.15.0",
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### pnpm-workspace.yaml

```yaml
packages:
  - "packages/*"
  - "apps/*"
```

### tsconfig.base.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "jsx": "react-native",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noEmit": false
  },
  "exclude": [
    "node_modules",
    "**/dist/**",
    "**/build/**"
  ]
}
```

### turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", "build/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "dependsOn": ["build"]
    },
    "typecheck": {
      "dependsOn": ["build"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

---

## 📦 PACKAGE: @aurora/core

### packages/core/package.json

```json
{
  "name": "@aurora/core",
  "version": "0.1.0",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "jest",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src/",
    "clean": "rm -rf dist"
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
    "tsup": "^8.0.0",
    "typescript": "~5.3.0"
  },
  "files": [
    "dist",
    "README.md"
  ]
}
```

### packages/core/tsup.config.ts

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-native', 'react-dom'],
  injectStyle: false,
  outDir: 'dist',
});
```

### packages/core/src/index.ts

```typescript
// State Management
export { createAppStore } from './state/createStore';
export { 
  mmkvAdapter, 
  asyncStorageAdapter, 
  secureStorageAdapter 
} from './state/storage';
export type { 
  StorageAdapter, 
  StoreConfig,
  StorageType 
} from './state/types';

// Theme System
export { 
  ThemeProvider, 
  useTheme, 
  DEFAULT_THEMES 
} from './theme/ThemeProvider';
export type { 
  ThemeColors, 
  ThemeOption, 
  ThemeMode, 
  ThemeProviderProps 
} from './theme/types';

// i18n
export { createI18n, useTranslation } from './i18n/i18n';
export type { 
  TranslationResource, 
  Locale, 
  I18nConfig 
} from './i18n/types';

// Utils
export { createLogger, logger } from './utils/logger';
export { backupData, restoreData } from './utils/backup';
export type { 
  BackupData, 
  RestoreOptions 
} from './utils/types';

// Hooks
export { useColorScheme } from './hooks/useColorScheme';
export { useStorage } from './hooks/useStorage';
```

### packages/core/src/state/createStore.ts

```typescript
import { create, StateCreator } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { StorageAdapter, StoreConfig, StorageType } from './types';
import { 
  mmkvAdapter, 
  asyncStorageAdapter, 
  secureStorageAdapter 
} from './storage';

/**
 * Generic store factory for creating Zustand stores with persistence
 * 
 * @example
 * ```typescript
 * const useMyStore = createAppStore<MyState>(
 *   (set, get) => ({
 *     count: 0,
 *     increment: () => set({ count: get().count + 1 }),
 *   }),
 *   {
 *     name: 'my-store',
 *     storage: 'mmkv',
 *     persistKeys: ['count'],
 *   }
 * );
 * ```
 */
export function createAppStore<T extends object>(
  slice: StateCreator<T, [], []>,
  config: StoreConfig<T>
) {
  const getStorageAdapter = (): StorageAdapter => {
    if (typeof config.storage === 'object') {
      return config.storage;
    }
    
    switch (config.storage) {
      case 'mmkv':
        return mmkvAdapter;
      case 'secure':
        return secureStorageAdapter;
      case 'async':
      default:
        return asyncStorageAdapter;
    }
  };

  const storage = createJSONStorage(() => getStorageAdapter());

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
        console.log('[Core] Store rehydrating:', config.name);
        return (state, error) => {
          if (error) {
            console.error('[Core] Store rehydration error:', error);
          } else {
            console.log('[Core] Store rehydrated:', config.name);
          }
        };
      },
    })
  );
}
```

### packages/core/src/state/storage.ts

```typescript
import type { StorageAdapter } from './types';

/**
 * MMKV Storage Adapter
 * High-performance key-value storage
 */
export const mmkvAdapter: StorageAdapter = {
  setItem: (key, value) => {
    try {
      const { createMMKV } = require('react-native-mmkv');
      const mmkv = createMMKV({ id: `aurora-${key}` });
      mmkv.set(key, value);
    } catch (e) {
      console.error('[Core] MMKV setItem error:', e);
    }
  },
  getItem: (key) => {
    try {
      const { createMMKV } = require('react-native-mmkv');
      const mmkv = createMMKV({ id: `aurora-${key}` });
      return mmkv.getString(key) ?? null;
    } catch (e) {
      console.error('[Core] MMKV getItem error:', e);
      return null;
    }
  },
  removeItem: (key) => {
    try {
      const { createMMKV } = require('react-native-mmkv');
      const mmkv = createMMKV({ id: `aurora-${key}` });
      mmkv.remove(key);
    } catch (e) {
      console.error('[Core] MMKV removeItem error:', e);
    }
  },
};

/**
 * AsyncStorage Adapter
 * Standard async storage for React Native
 */
export const asyncStorageAdapter: StorageAdapter = {
  setItem: async (key, value) => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.error('[Core] AsyncStorage setItem error:', e);
    }
  },
  getItem: async (key) => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      return await AsyncStorage.getItem(key);
    } catch (e) {
      console.error('[Core] AsyncStorage getItem error:', e);
      return null;
    }
  },
  removeItem: async (key) => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error('[Core] AsyncStorage removeItem error:', e);
    }
  },
};

/**
 * SecureStore Adapter
 * Encrypted storage for sensitive data (API keys, tokens)
 */
export const secureStorageAdapter: StorageAdapter = {
  setItem: async (key, value) => {
    try {
      const SecureStore = require('expo-secure-store');
      await SecureStore.setItemAsync(key, value);
    } catch (e) {
      console.error('[Core] SecureStore setItem error:', e);
    }
  },
  getItem: async (key) => {
    try {
      const SecureStore = require('expo-secure-store');
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      console.error('[Core] SecureStore getItem error:', e);
      return null;
    }
  },
  removeItem: async (key) => {
    try {
      const SecureStore = require('expo-secure-store');
      await SecureStore.deleteItemAsync(key);
    } catch (e) {
      console.error('[Core] SecureStore removeItem error:', e);
    }
  },
};
```

### packages/core/src/state/types.ts

```typescript
/**
 * Storage adapter interface
 */
export interface StorageAdapter {
  setItem: (key: string, value: string) => Promise<void> | void;
  getItem: (key: string) => Promise<string | null> | string | null;
  removeItem: (key: string) => Promise<void> | void;
}

/**
 * Storage type options
 */
export type StorageType = 'mmkv' | 'async' | 'secure';

/**
 * Store configuration
 */
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

---

## 📦 PACKAGE: @aurora/ui

### packages/ui/package.json

```json
{
  "name": "@aurora/ui",
  "version": "0.1.0",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "jest",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src/",
    "clean": "rm -rf dist"
  },
  "peerDependencies": {
    "react": ">=18",
    "react-native": ">=0.70",
    "react-native-reanimated": ">=3",
    "expo-blur": ">=12"
  },
  "dependencies": {
    "@aurora/core": "workspace:*"
  },
  "devDependencies": {
    "@types/react": "~18.2.0",
    "tsup": "^8.0.0",
    "typescript": "~5.3.0"
  },
  "files": [
    "dist",
    "README.md"
  ]
}
```

### packages/ui/src/index.ts

```typescript
// Buttons
export { ThemedButton } from './Button/ThemedButton';
export type { ThemedButtonProps } from './Button/types';

// Cards
export { ThemedCard } from './Card/ThemedCard';
export type { ThemedCardProps } from './Card/types';

// Alerts
export { CustomAlert, GlassAlert } from './Alert';
export type { AlertProps, AlertConfig } from './Alert/types';

// Containers
export { GlassContainer } from './Container/GlassContainer';
export type { GlassContainerProps } from './Container/types';

// States
export { EmptyState } from './EmptyState';
export type { EmptyStateProps } from './EmptyState/types';

// Pagination
export { Paginator } from './Pagination';
export type { PaginatorProps } from './Pagination/types';

// Error Handling
export { ErrorBoundary } from './ErrorBoundary';
export type { ErrorBoundaryProps } from './ErrorBoundary/types';
```

### packages/ui/src/Button/ThemedButton.tsx

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
import { useTheme } from "@aurora/core";
import type { ThemedButtonProps } from "./types";

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

## 📱 APP: DEMO

### apps/demo/package.json

```json
{
  "name": "@aurora/demo",
  "version": "1.0.0",
  "main": "node_modules/expo-router/entry",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "@aurora/core": "workspace:*",
    "@aurora/ui": "workspace:*",
    "@aurora/effects": "workspace:*",
    "expo": "~55.0.5",
    "expo-router": "~55.0.7",
    "react": "19.2.0",
    "react-native": "0.83.2",
    "react-native-reanimated": "4.2.1"
  },
  "devDependencies": {
    "@babel/core": "^7.23.3",
    "@types/react": "~18.2.0",
    "typescript": "~5.3.0"
  }
}
```

### apps/demo/src/App.tsx

```typescript
import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { ThemeProvider, createI18n, logger } from '@aurora/core';
import { ThemedButton, ThemedCard } from '@aurora/ui';
import { BackgroundEffects } from '@aurora/effects';

// Initialize i18n
createI18n({
  defaultLocale: 'en',
  supportedLocales: ['en', 'tr', 'ja'],
});

export default function App() {
  const handlePress = () => {
    logger.info('Button pressed!', 'Demo');
  };

  return (
    <ThemeProvider
      defaultThemeId="default"
      defaultThemeMode="system"
    >
      <BackgroundEffects effect="bokeh" intensity={70} />
      
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>@aurora/core Demo</Text>
          
          <ThemedCard style={styles.card}>
            <Text style={styles.subtitle}>Theme System</Text>
            <Text style={styles.description}>
              This app uses the Aurora theme system with 35+ pre-built themes.
            </Text>
          </ThemedCard>

          <ThemedCard style={styles.card}>
            <Text style={styles.subtitle}>UI Components</Text>
            <Text style={styles.description}>
              Reusable components from @aurora/ui package.
            </Text>
            
            <ThemedButton
              title="Press Me"
              onPress={handlePress}
              variant="primary"
              style={styles.button}
            />
          </ThemedCard>

          <ThemedCard style={styles.card}>
            <Text style={styles.subtitle}>Background Effects</Text>
            <Text style={styles.description}>
              Beautiful visual effects from @aurora/effects package.
            </Text>
          </ThemedCard>
        </View>
      </ScrollView>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
});
```

---

## 🚀 QUICK START GUIDE

### Step 1: Clone & Install

```bash
# Clone the monorepo
git clone https://github.com/neurodivergent-dev/aurora-monorepo.git
cd aurora-monorepo

# Install dependencies (using pnpm)
pnpm install

# Or with npm workspaces
npm install
```

### Step 2: Build Packages

```bash
# Build all packages
pnpm build

# Or build individual packages
cd packages/core && pnpm build
cd packages/ui && pnpm build
cd packages/effects && pnpm build
```

### Step 3: Run Demo App

```bash
cd apps/demo
pnpm start

# Or
npx expo start
```

### Step 4: Develop

```bash
# Watch mode for packages
cd packages/core && pnpm dev
cd packages/ui && pnpm dev

# In another terminal, run demo
cd apps/demo && pnpm start
```

---

## 📚 USAGE EXAMPLES

### Creating a New Store

```typescript
// apps/your-app/src/store/counterStore.ts
import { createAppStore } from '@aurora/core';

interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

export const useCounterStore = createAppStore<CounterState>(
  (set, get) => ({
    count: 0,
    increment: () => set({ count: get().count + 1 }),
    decrement: () => set({ count: get().count - 1 }),
    reset: () => set({ count: 0 }),
  }),
  {
    name: 'counter-storage',
    storage: 'async',
    persistKeys: ['count'],
  }
);
```

### Using Theme in Components

```typescript
import { useTheme } from '@aurora/core';

function MyComponent() {
  const { colors, isDarkMode, themeId } = useTheme();
  
  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>Hello!</Text>
    </View>
  );
}
```

### Using i18n

```typescript
import { useTranslation } from '@aurora/core';

function MyScreen() {
  const { t, i18n } = useTranslation();
  
  return (
    <View>
      <Text>{t('common.hello')}</Text>
      <Button 
        title="Change Language"
        onPress={() => i18n.changeLanguage('tr')}
      />
    </View>
  );
}
```

---

## ✅ CHECKLIST

### Setup

- [ ] Initialize monorepo
- [ ] Configure Turborepo
- [ ] Setup TypeScript
- [ ] Configure workspaces

### @aurora/core

- [ ] State factory working
- [ ] Storage adapters tested
- [ ] Theme system functional
- [ ] i18n configured
- [ ] Logger working
- [ ] All exports tested

### @aurora/ui

- [ ] All components migrated
- [ ] Components themed correctly
- [ ] Accessibility labels working
- [ ] Animations smooth

### @aurora/effects

- [ ] All 18 effects working
- [ ] Performance optimized
- [ ] No memory leaks

### Apps

- [ ] Aurora migrated successfully
- [ ] Demo app builds
- [ ] Template ready for new apps

---

**Next Steps:** Start implementing! See `IMPLEMENTATION_GUIDE.md` for detailed instructions.
