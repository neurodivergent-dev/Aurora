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
  EAS_PROJECT_ID: string;
}

const getEnv = (): AppEnvironment => {
  const env = process.env.APP_ENV || 'aurora';

  const configs: Record<string, AppEnvironment> = {
    aurora: {
      APP_NAME: 'Aurora',
      APP_SLUG: 'aurora',
      BUNDLE_ID: 'com.metaframe.aurora',
      PACKAGE_NAME: 'com.metaframe.aurora',
      APP_ICON: './assets/images/icon.png',
      APP_SPLASH: './assets/images/icon.png',
      PRIMARY_COLOR: '#6366F1',
      SCHEME: 'aurora',
      DESCRIPTION: 'AI DJ for Your Mind & Music. A minimalist, offline-first music player with AI-powered personalization. Completely offline and ad-free.',
      GITHUB_URL: 'https://github.com/neurodivergent-dev/aurora',
      EAS_PROJECT_ID: '830fa4d4-6e64-4ca5-a958-36a8aef5f4cb',
    },
  };

  return configs[env] || configs.aurora;
};

export default ({ config }: ConfigContext): ExpoConfig => {
  const env = getEnv();

  return {
    ...config,
    name: env.APP_NAME,
    slug: env.APP_SLUG,
    version: '1.0.0',
    orientation: 'portrait',
    icon: env.APP_ICON,
    scheme: env.SCHEME,
    userInterfaceStyle: 'automatic',
    splash: {
      image: env.APP_SPLASH,
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: env.BUNDLE_ID,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: env.PACKAGE_NAME,
      usesCleartextTraffic: true,
      permissions: [
        'WAKE_LOCK',
        'FOREGROUND_SERVICE',
        'FOREGROUND_SERVICE_AUDIO',
        'RECORD_AUDIO',
      ],
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      'expo-localization',
      [
        'expo-notifications',
        {
          icon: './assets/images/notification-icon.png',
          color: '#6366f1',
        },
      ],
      [
        'expo-audio',
        {
          staysActiveInBackground: true,
        },
      ],
      'expo-secure-store',
      'expo-asset',
      'expo-sharing',
      'expo-sqlite',
      'expo-web-browser',
      [
        'expo-media-library',
        {
          photosPermission: 'Allow $(PRODUCT_NAME) to access your photos.',
          savePhotosPermission: 'Allow $(PRODUCT_NAME) to save photos.',
          isAccessMediaLocationEnabled: true,
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: env.EAS_PROJECT_ID,
      },
      githubUrl: env.GITHUB_URL,
    },
    updates: {
      enabled: true,
      fallbackToCacheTimeout: 0,
      url: `https://u.expo.dev/${env.EAS_PROJECT_ID}`,
    },
  } as any;
};
