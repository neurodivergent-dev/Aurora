# 🏗️ AURORA WHITE-LABEL CONFIGURATION

**Hedef:** Tek bir codebase'ten sınırsız sayıda app fork'layabilmek

---

## 📋 **YAPILACAKLAR**

### 1. **app.config.ts Oluştur** (Dinamik Konfigürasyon)

```typescript
// app.config.ts
import { ExpoConfig, ConfigContext } from 'expo/config';

interface AppEnvironment {
  APP_NAME: string;
  APP_SLUG: string;
  BUNDLE_ID: string;
  PACKAGE_NAME: string;
  APP_ICON: string;
  APP_SPLASH: string;
  PRIMARY_COLOR: string;
  SCHEME: string;
  DESCRIPTION: string;
  GITHUB_URL?: string;
}

const getEnv = (): AppEnvironment => {
  const env = process.env.APP_ENV || 'aurora';
  
  const configs: Record<string, AppEnvironment> = {
    aurora: {
      APP_NAME: 'Aurora',
      APP_SLUG: 'aurora',
      BUNDLE_ID: 'com.metaframe.aurora',
      PACKAGE_NAME: 'com.metaframe.aurora',
      APP_ICON: './assets/aurora/icon.png',
      APP_SPLASH: './assets/aurora/splash.png',
      PRIMARY_COLOR: '#6366F1',
      SCHEME: 'aurora',
      DESCRIPTION: 'AI DJ for Your Mind & Music',
      GITHUB_URL: 'https://github.com/neurodivergent-dev/aurora',
    },
    podcast: {
      APP_NAME: 'PodcastAI',
      APP_SLUG: 'podcast-ai',
      BUNDLE_ID: 'com.metaframe.podcast',
      PACKAGE_NAME: 'com.metaframe.podcast',
      APP_ICON: './assets/podcast/icon.png',
      APP_SPLASH: './assets/podcast/splash.png',
      PRIMARY_COLOR: '#F59E0B',
      SCHEME: 'podcastai',
      DESCRIPTION: 'AI-Powered Podcast Player',
    },
    meditation: {
      APP_NAME: 'ZenAI',
      APP_SLUG: 'zen-meditation',
      BUNDLE_ID: 'com.metaframe.zen',
      PACKAGE_NAME: 'com.metaframe.zen',
      APP_ICON: './assets/zen/icon.png',
      APP_SPLASH: './assets/zen/splash.png',
      PRIMARY_COLOR: '#10B981',
      SCHEME: 'zenai',
      DESCRIPTION: 'AI Meditation & Mindfulness',
    },
    // Add more apps here...
  };
  
  return configs[env] || configs.aurora;
};

export default ({ config }: ConfigContext): ExpoConfig => {
  const env = getEnv();
  
  return {
    ...config,
    name: env.APP_NAME,
    slug: env.APP_SLUG,
    scheme: env.SCHEME,
    description: env.DESCRIPTION,
    icon: env.APP_ICON,
    splash: {
      image: env.APP_SPLASH,
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      bundleIdentifier: env.BUNDLE_ID,
      supportsTablet: true,
    },
    android: {
      package: env.PACKAGE_NAME,
      adaptiveIcon: {
        foregroundImage: env.APP_ICON,
        backgroundColor: env.PRIMARY_COLOR,
      },
    },
    web: {
      favicon: env.APP_ICON,
    },
    // ... rest of config
  };
};
```

---

### 2. **Environment Variables** (.env.example)

```bash
# .env.example

# App Environment (aurora, podcast, meditation, radio, audiobook)
APP_ENV=aurora

# API Keys (will be overridden per fork)
GEMINI_API_KEY=
GROQ_API_KEY=
POLLINATIONS_API_KEY=

# App-Specific Config
APP_THEME_PRIMARY=#6366F1
APP_THEME_SECONDARY=#818CF8
APP_NAME=Aurora
```

---

### 3. **Package.json Scripts**

```json
{
  "scripts": {
    "start:aurora": "APP_ENV=aurora expo start",
    "start:podcast": "APP_ENV=podcast expo start",
    "start:meditation": "APP_ENV=meditation expo start",
    "build:aurora": "APP_ENV=aurora eas build --platform android",
    "build:podcast": "APP_ENV=podcast eas build --platform android",
    "build:meditation": "APP_ENV=meditation eas build --platform android"
  }
}
```

---

### 4. **Config Constants** (src/constants/appConfig.ts)

```typescript
// src/constants/appConfig.ts
import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const AppConfig = {
  name: Constants.expoConfig?.name || 'Aurora',
  slug: Constants.expoConfig?.slug || 'aurora',
  version: Constants.expoConfig?.version || '1.0.0',
  scheme: Constants.expoConfig?.scheme || 'aurora',
  description: Constants.expoConfig?.description || '',
  
  // Build info
  bundleId: Platform.select({
    ios: Constants.expoConfig?.ios?.bundleIdentifier,
    android: Constants.expoConfig?.android?.package,
  }),
  
  // Links
  githubUrl: Constants.expoConfig?.extra?.githubUrl,
  privacyUrl: Constants.expoConfig?.privacy,
  
  // Feature flags (can be customized per fork)
  features: {
    aiChat: true,
    musicPlayer: true,
    playlists: true,
    backgrounds: true,
    voiceInput: true,
    speechOutput: true,
    localMusic: true,
    streaming: false, // Enable for radio fork
    podcasts: false,  // Enable for podcast fork
    meditation: false, // Enable for meditation fork
  },
};
```

---

### 5. **Branding Component** (src/components/Branding.tsx)

```typescript
// src/components/Branding.tsx
import React from 'react';
import { Image, View } from 'react-native';
import { AppConfig } from '../constants/appConfig';

interface BrandingProps {
  type: 'logo' | 'splash' | 'icon';
  size?: number;
}

export const Branding: React.FC<BrandingProps> = ({ type, size = 100 }) => {
  const logoSource = require(`../../assets/${AppConfig.slug}/${type}.png`);
  
  return (
    <View style={{ width: size, height: size }}>
      <Image source={logoSource} style={{ width: '100%', height: '100%' }} />
    </View>
  );
};
```

---

### 6. **Asset Structure**

```
assets/
├── aurora/
│   ├── icon.png
│   ├── splash.png
│   ├── logo.png
│   └── adaptive-icon.png
├── podcast/
│   ├── icon.png
│   ├── splash.png
│   └── ...
├── meditation/
│   ├── icon.png
│   ├── splash.png
│   └── ...
└── shared/
    ├── sounds/
    ├── fonts/
    └── images/
```

---

## 🚀 **FORK WORKFLOW**

### Yeni App Oluşturma:

```bash
# 1. Clone
git clone https://github.com/neurodivergent-dev/aurora my-new-app
cd my-new-app

# 2. Install
npm install

# 3. Create app config
cp .env.example .env
# Edit .env: APP_ENV=mynewapp

# 4. Add app config to app.config.ts
# Add new entry in getEnv() function

# 5. Add assets
mkdir -p assets/mynewapp
# Add icon.png, splash.png, etc.

# 6. Customize features
# Edit src/constants/appConfig.ts features

# 7. Build
npm run build:mynewapp
```

---

## 📦 **FORK ÖRNEKLERİ**

### 1. **Podcast AI**
```bash
APP_ENV=podcast
APP_NAME="PodcastAI"
PRIMARY_COLOR=#F59E0B
FEATURES: podcasts=true, aiChat=true, playlists=true
```

### 2. **Meditation AI**
```bash
APP_ENV=meditation
APP_NAME="ZenAI"
PRIMARY_COLOR=#10B981
FEATURES: meditation=true, speechOutput=true, backgrounds=true
```

### 3. **Radio Stream**
```bash
APP_ENV=radio
APP_NAME="RadioAI"
PRIMARY_COLOR=#EF4444
FEATURES: streaming=true, aiChat=false, localMusic=false
```

### 4. **Audiobook Player**
```bash
APP_ENV=audiobook
APP_NAME="AudioBook AI"
PRIMARY_COLOR=#8B5CF6
FEATURES: audiobooks=true, speechOutput=false, bookmarks=true
```

### 5. **Education Platform**
```bash
APP_ENV=education
APP_NAME="LearnAI"
PRIMARY_COLOR=#3B82F6
FEATURES: courses=true, aiChat=true, progress=true
```

---

## 🔐 **WHITE-LABEL LICENSE**

```typescript
// src/constants/license.ts
export const LicenseConfig = {
  // Allow commercial use
  commercialUse: true,
  
  // Require attribution
  attribution: 'Powered by Aurora Platform',
  
  // Allow modifications
  modifications: true,
  
  // Allow distribution
  distribution: true,
  
  // Copyleft (share alike)
  copyleft: false, // Set to true if you want forks to be open source
};
```

---

## 📊 **BUSINESS MODEL**

### Free Tier (MIT License)
- ✅ Fork unlimited apps
- ✅ Modify codebase
- ✅ Commercial use
- ❌ No support
- ❌ No updates

### Pro Tier ($99/month)
- ✅ Everything in Free
- ✅ Priority support
- ✅ Automatic updates
- ✅ Custom feature requests
- ✅ White-label removal (no "Powered by Aurora")

### Enterprise Tier (Custom)
- ✅ Everything in Pro
- ✅ Dedicated support
- ✅ SLA guarantee
- ✅ Custom integrations
- ✅ Source code escrow

---

## 🎯 **NEXT STEPS**

1. **Convert app.json → app.config.ts** (1 saat)
2. **Add environment variables** (30 dk)
3. **Create asset structure** (30 dk)
4. **Add AppConfig constants** (30 dk)
5. **Create fork documentation** (1 saat)
6. **Build fork script** (1 saat)

**Total:** ~4-5 saat

---

## 💡 **COMPETITIVE ADVANTAGE**

| Feature | Aurora | React Native Boilerplate | Expo Template |
|---------|--------|-------------------------|---------------|
| AI-Powered | ✅ | ❌ | ❌ |
| Music Engine | ✅ | ❌ | ❌ |
| Multi-App Ready | ✅ | ❌ | ❌ |
| Type-Safe | ✅ | ⚠️ | ⚠️ |
| Production-Ready | ✅ | ❌ | ❌ |
| SOLID Architecture | ✅ | ⚠️ | ❌ |

---

**Sonuç:** Aurora sadece bir app değil, bir **APP FACTORY**! 🏭
