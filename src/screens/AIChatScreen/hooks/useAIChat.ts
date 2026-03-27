import { useState } from 'react';
import { Alert, Keyboard, Linking } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useTranslation } from 'react-i18next';
import { useAIStore, ChatMessage } from '../../../store/aiStore';
import { useMusicStore } from '../../../store/musicStore';
import { useLanguageStore } from '../../../store/languageStore';
import { useThemeStore } from '../../../store/themeStore';
import { aiService } from '../../../services/aiService';
import { soundService } from '../../../services/SoundService';
import { exportData, dataToJSON } from '../../../utils/backup';
import { findAction, parseActionData } from '../handlers/actionParser';
import { handleThemeActions } from '../handlers/themeHandler';
import { handleMusicActions } from '../handlers/musicHandler';
import { handleSettingsActions } from '../handlers/settingsHandler';
import { handleBackupActions } from '../handlers/backupHandler';

export const useAIChat = () => {
  const { t, i18n } = useTranslation();
  
  // AI Store
  const { 
    apiKey, groqApiKey, activeProvider, isAIEnabled, 
    chatMessages, addChatMessage, clearChatMessages, 
    customSystemPrompt 
  } = useAIStore();
  
  // Other stores
  const { 
    play, pause, next, setCurrentTrack, playlist, 
    setVolume, currentTrack, loadLocalMusic,
    setTrackLyrics, setTrackArtwork, deletePlaylist, updatePlaylist, createPlaylist
  } = useMusicStore();

  // State
  const [isLoading, setIsLoading] = useState(false);
  const [clearChatAlertVisible, setClearChatAlertVisible] = useState(false);

  // Sound helper
  const playChatSound = (type: 'send' | 'receive', chatSoundsEnabled: boolean, chatSoundType: string) => {
    if (!chatSoundsEnabled) return;
    if (chatSoundType === 'pop') {
      soundService.playClick();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (chatSoundType === 'digital') {
      if (type === 'receive') soundService.playComplete();
      else soundService.playClick();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.selectionAsync();
    }
  };

  // Main send handler
  const handleSend = async (
    inputText: string,
    setInputText: (text: string) => void,
    chatSoundsEnabled: boolean,
    chatSoundType: string
  ) => {
    if (!inputText.trim() || isLoading) return;
    
    const hasValidKey = apiKey || groqApiKey || activeProvider === 'ollama';
    if (!hasValidKey || !isAIEnabled) {
      Alert.alert(t('settings.ai.chat.noApiKey'));
      return;
    }

    const todayDate = new Date();
    const todayStr = todayDate.toISOString().split('T')[0];

    // Context preparation
    const musicStoreRef = useMusicStore.getState();
    const musicContext = `MUSIC LIBRARY (CRITICAL):
    - Current Song: "${musicStoreRef.currentTrack?.title || "None"}" by "${musicStoreRef.currentTrack?.artist || "Unknown"}" (ID: ${musicStoreRef.currentTrack?.id || "None"})
    - User Playlists: ${musicStoreRef.myPlaylists.length > 0 ? musicStoreRef.myPlaylists.map((p: any) => `"${p.name}" (ID: "${p.id}", ${p.trackIds.length} tracks)`).join(", ") : "None"}
    - Library Songs (Use the EXACT ID to play or set artwork):
    ${musicStoreRef.playlist.slice(0, 30).map((t: any) => `- Title: "${t.title}", Artist: "${t.artist}", Genre: "${t.genre}", ID: "${t.id}"`).join("\n    ")}`;

    const appThemes = require('../../../constants/themes').THEMES;
    const themeContext = `AVAILABLE THEMES: ${appThemes.map((t: any) => `${t.name} (ID: ${t.id})`).join(", ")}
    AVAILABLE EFFECTS: bokeh, quantum, crystals, tesseract, aurora, matrix, vortex, grid, silk, prism, nebula, flow, blackhole, stardust, neural, dna, winamp`;

    const fullContext = `${musicContext}\n\n${themeContext}`;

    // Chat history
    const chatHistory = chatMessages.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      role: 'user',
      timestamp: Date.now(),
    };

    addChatMessage(userMessage);
    setInputText('');
    setIsLoading(true);
    Keyboard.dismiss();
    playChatSound('send', chatSoundsEnabled, chatSoundType);

    try {
      const response = await aiService.chat(
        userMessage.text,
        chatHistory.slice(-10),
        fullContext,
        i18n.language,
        customSystemPrompt
      );

      if (response && response.trim().length > 0) {
        let cleanResponse = response;

        // Process actions
        const { cleaned, clearChatTriggered } = processActions(response);
        cleanResponse = cleaned;

        if (!clearChatTriggered) {
          const aiMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            text: cleanResponse,
            role: 'model',
            timestamp: Date.now(),
          };
          addChatMessage(aiMessage);
          playChatSound('receive', chatSoundsEnabled, chatSoundType);
        }
      } else {
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: t('settings.ai.chat.error'),
          role: 'model',
          timestamp: Date.now(),
        };
        addChatMessage(errorMessage);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (error) {
      console.error("Chat Error:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: t('settings.ai.chat.error'),
        role: 'model',
        timestamp: Date.now(),
      };
      addChatMessage(errorMessage);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  // Process all AI actions
  const processActions = (
    response: string
  ): { cleaned: string; clearChatTriggered: boolean } => {
    let cleanResponse = response;
    let clearChatTriggered = false;

    // Theme actions
    const themeResult = handleThemeActions(cleanResponse);
    cleanResponse = themeResult.cleanResponse;

    // Music actions
    const musicResult = handleMusicActions(cleanResponse);
    cleanResponse = musicResult.cleanResponse;

    // Settings actions
    const settingsResult = handleSettingsActions(cleanResponse);
    cleanResponse = settingsResult.cleanResponse;

    // Backup actions
    const backupResult = handleBackupActions(cleanResponse);
    cleanResponse = backupResult.cleanResponse;

    // Handle remaining inline actions
    const { cleaned, clearTriggered } = processInlineActions(cleanResponse);
    cleanResponse = cleaned;
    clearChatTriggered = clearTriggered;

    return { cleaned: cleanResponse, clearChatTriggered };
  };

  // Process inline actions (actions that need direct access to component state)
  const processInlineActions = (
    response: string
  ): { cleaned: string; clearTriggered: boolean } => {
    let cleanResponse = response;
    let clearTriggered = false;

    // RESET_ALL_DATA
    if (response.includes('[ACTION:RESET_ALL_DATA]') || response.includes('(AURORA_COMMAND:RESET_ALL_DATA)')) {
      cleanResponse = cleanResponse.replace('[ACTION:RESET_ALL_DATA]', '').replace('(AURORA_COMMAND:RESET_ALL_DATA)', '').trim();
      Alert.alert(
        t('settings.dangerZone.clearDataTitle') || "Reset All Data",
        t('settings.dangerZone.clearDataDescription') || "Are you sure?",
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('common.delete'),
            style: 'destructive',
            onPress: async () => {
              useLanguageStore.getState().resetState();
              useThemeStore.getState().setIsDarkMode(true);
              useThemeStore.getState().setThemeId('default');
              useAIStore.getState().clearChatMessages();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              router.replace('/');
            }
          }
        ]
      );
    }

    // RATE_APP
    if (response.includes('[ACTION:RATE_APP]') || response.includes('(AURORA_COMMAND:RATE_APP)')) {
      cleanResponse = cleanResponse.replace('[ACTION:RATE_APP]', '').replace('(AURORA_COMMAND:RATE_APP)', '').trim();
      const playStoreUrl = "https://play.google.com/store/apps/details?id=com.metaframe.aurora";
      Linking.canOpenURL(playStoreUrl).then((supported) => {
        if (supported) Linking.openURL(playStoreUrl);
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    return { cleaned: cleanResponse, clearTriggered };
  };

  const clearChat = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setClearChatAlertVisible(true);
  };

  return {
    isLoading,
    clearChatAlertVisible,
    setClearChatAlertVisible,
    handleSend,
    clearChat,
  };
};
