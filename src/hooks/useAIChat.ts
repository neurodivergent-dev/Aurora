import { useState, useCallback, useMemo } from 'react';
import { Keyboard } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { useAIStore } from '../store/aiStore';
import { useMusicStore } from '../store/musicStore';
import { aiService } from '../services/aiService';
import { ChatMessage } from '../types/chat';
import { soundService } from '../services/SoundService';
import { handleThemeActions } from '../screens/AIChatScreen/handlers/themeHandler';
import { handleMusicActions } from '../screens/AIChatScreen/handlers/musicHandler';
import { handleSettingsActions } from '../screens/AIChatScreen/handlers/settingsHandler';
import { handleBackupActions } from '../screens/AIChatScreen/handlers/backupHandler';

export const useAIChat = () => {
  const { t, i18n } = useTranslation();
  const {
    apiKey,
    groqApiKey,
    activeProvider,
    isAIEnabled,
    chatMessages,
    addChatMessage,
    deleteChatMessages,
    clearChatMessages,
    customSystemPrompt,
    chatSoundsEnabled,
    chatSoundType
  } = useAIStore();

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const playChatSound = useCallback((type: 'send' | 'receive') => {
    if (!chatSoundsEnabled) return;
    try {
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
    } catch (error) {
      // Silent error for sounds
    }
  }, [chatSoundsEnabled, chatSoundType]);

  const displayMessages = useMemo(() => {
    const welcomeMsg: ChatMessage = {
      id: 'welcome',
      text: t('settings.ai.chat.welcome'),
      role: 'model',
      timestamp: 0,
    };
    return [welcomeMsg, ...chatMessages];
  }, [chatMessages, t]);

  const handleSend = useCallback(async () => {
    console.log("[useAIChat] handleSend called. Input:", inputText.trim());
    if (!inputText.trim() || isLoading) return;

    const hasValidKey = apiKey || groqApiKey || activeProvider === 'ollama';
    if (!hasValidKey || !isAIEnabled) {
      alert(t('settings.ai.chat.noApiKey'));
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      role: 'user',
      timestamp: Date.now(),
    };

    try {
      addChatMessage(userMessage);
      setInputText('');
      setIsLoading(true);
      Keyboard.dismiss();
      playChatSound('send');

      // Context preparation (will be passed to aiService)
      const musicStore = useMusicStore.getState();
      const musicContext = `Current Song: ${musicStore.currentTrack?.title || 'None'}`;
      
      const response = await aiService.chat(
        userMessage.text,
        chatMessages.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
        musicContext,
        i18n.language,
        customSystemPrompt
      );

      if (response) {
        // Process Actions
        let { cleanResponse } = handleThemeActions(response);
        ({ cleanResponse } = handleMusicActions(cleanResponse));
        ({ cleanResponse } = handleSettingsActions(cleanResponse));
        ({ cleanResponse } = await handleBackupActions(cleanResponse, t));

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: cleanResponse.trim() || response,
          role: 'model',
          timestamp: Date.now(),
        };
        addChatMessage(assistantMessage);
        playChatSound('receive');
      }

      return response;
    } catch (error) {
      console.error("[useAIChat] Error in handleSend:", error);
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
  }, [inputText, isLoading, apiKey, groqApiKey, activeProvider, isAIEnabled, t, i18n.language, customSystemPrompt, addChatMessage, playChatSound, chatMessages]);

  return {
    inputText,
    setInputText,
    isLoading,
    setIsLoading,
    displayMessages,
    handleSend,
    isSelectionMode,
    setIsSelectionMode,
    selectedIds,
    setSelectedIds,
    clearChatMessages,
    deleteChatMessages,
    playChatSound
  };
};
