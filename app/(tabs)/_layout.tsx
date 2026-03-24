import React from "react";
import { Tabs } from "expo-router";
import { Music, ListMusic, Settings, Sparkles } from "lucide-react-native";
import { useTheme } from "../../src/components/ThemeProvider";
import { soundService } from "../../src/services/SoundService";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import { useAIStore } from "../../src/store/aiStore";
import { useThemeStore } from "../../src/store/themeStore";

export default function TabLayout() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { isAIEnabled, apiKey, groqApiKey, activeProvider } = useAIStore();
  const { isZenMode } = useThemeStore();

  const tabListeners = {
    tabPress: () => {
      soundService.playClick();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.subText,
        headerShown: false,
        tabBarStyle: {
          display: isZenMode ? 'none' : 'flex',
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        listeners={tabListeners}
        options={{
          title: t("tabs.library"),
          tabBarIcon: ({ color }) => <Music size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="playlists"
        listeners={tabListeners}
        options={{
          title: t("tabs.playlists"),
          tabBarIcon: ({ color }) => <ListMusic size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ai-chat"
        listeners={tabListeners}
        options={{
          title: t("tabs.ai"),
          tabBarIcon: ({ color }) => <Sparkles size={24} color={color} />,
          href: isAIEnabled && (apiKey || groqApiKey || activeProvider === 'ollama') ? "/ai-chat" : null,
        }}
      />
      <Tabs.Screen
        name="settings"
        listeners={tabListeners}
        options={{
          title: t("tabs.settings"),
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
