import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, router, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View as _View, Text as _Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAppColorScheme } from "../src/hooks/useAppColorScheme";
import { ThemeProvider as CustomThemeProvider } from "../src/components/ThemeProvider";
import { useLanguageStore } from "../src/store/languageStore";
import { useOnboardingStore } from "../src/store/onboardingStore";
import { SoundPlayer } from "../src/components/SoundPlayer";
import { MiniPlayer } from "../src/components/MiniPlayer";
import { useAIStore } from "../src/store/aiStore";
import { useOllamaStore } from "../src/store/ollamaStore";
import { useThemeStore } from "../src/store/themeStore";
import { GlassAlert } from "../src/components/GlassAlert";
import { ErrorBoundary as GlobalErrorBoundary } from "../src/components/ErrorBoundary";

import "../src/i18n/i18n"; // Import i18n initialization

// Catch any errors thrown by the Layout component
export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

export default function RootLayout() {
  const [fontError, setFontError] = useState<Error | null>(null);
  const [i18nInitialized, setI18nInitialized] = useState(false);

  // Get the current language from the store to ensure it's loaded
  const { currentLanguage } = useLanguageStore();

  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...(FontAwesome.font || {}),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) {
      console.error("Font loading error:", error);
      setFontError(error);
    }
  }, [error]);

  // Mark i18n as initialized once we have the language
  useEffect(() => {
    if (currentLanguage) {
      setI18nInitialized(true);
      // Load AI settings
      useAIStore.getState().loadApiKey();
      useOllamaStore.getState().loadOllamaApiKey();
    }
  }, [currentLanguage]);

  // Wait for fonts to load and i18n to initialize before rendering the app
  if ((!loaded && !fontError) || !i18nInitialized) {
    return null; // Expo will maintain the splash screen until we return something
  }

  // If there was a font loading error, render the app anyway
  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useAppColorScheme();
  const theme = colorScheme === "dark" ? DarkTheme : DefaultTheme;
  const segments = useSegments();
  const { hasCompletedOnboarding } = useOnboardingStore();
  const colors = useThemeStore((state) => state.colors);

  // Handle routing based on onboarding status
  useEffect(() => {
    // Convert segments to a string to check the path
    const path = segments.join("/");
    const inOnboarding = path.includes("onboarding");

    // If onboarding is not completed, redirect to onboarding
    if (!hasCompletedOnboarding && !inOnboarding) {
      // Use setTimeout to ensure the navigation root is ready
      const timer = setTimeout(() => {
        router.replace("/onboarding");
      }, 1);
      return () => clearTimeout(timer);
    }
  }, [segments, hasCompletedOnboarding]);

  // Handle case where theme might be undefined
  const safeTheme = theme || DefaultTheme;

  return (
    <GlobalErrorBoundary>
      <SafeAreaProvider>
        <CustomThemeProvider>
          <SoundPlayer />
          <MiniPlayer />
          <Stack
            screenOptions={{
                freezeOnBlur: true,
                contentStyle: {
                  backgroundColor: colors.background,
                },
                animation: 'fade',
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: "modal" }} />
              <Stack.Screen name="onboarding" options={{ headerShown: false }} />
              <Stack.Screen name="about" options={{ headerShown: false }} />
              <Stack.Screen name="privacy-policy" options={{ headerShown: false }} />
              <Stack.Screen name="theme-settings" options={{ headerShown: false }} />
              <Stack.Screen name="backup-settings" options={{ headerShown: false }} />
              <Stack.Screen name="ai-settings" options={{ headerShown: false }} />
              <Stack.Screen 
                name="music-player" 
                options={{ 
                  presentation: "modal", 
                  headerShown: false, 
                  animation: "slide_from_bottom"
                }} 
              />
              <Stack.Screen 
                name="playlist-detail" 
                options={{ 
                  headerShown: false, 
                  animation: "slide_from_right"
                }} 
              />
          </Stack>
          <GlassAlert />
        </CustomThemeProvider>
      </SafeAreaProvider>
    </GlobalErrorBoundary>
  );
}

StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginBottom: 20,
  },
});
