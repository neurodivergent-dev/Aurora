import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useLanguageStore } from '../../../store/languageStore';
import { useThemeStore, BackgroundEffectType } from '../../../store/themeStore';
import { useAIStore } from '../../../store/aiStore';
import { findAction, parseActionData } from './actionParser';
import { AIAction } from '../../../types/chat';
import logger from '../../../utils/logger';

const cleanCommand = (text: string, match: AIAction) => {
  return text.replace(match.fullMatch, '').split('\n').filter(line => line.trim() !== '').join('\n').trim();
};

export const handleSettingsActions = (response: string): { cleanResponse: string; changed: boolean } => {
  let cleanResponse = response;
  let changed = false;
  const { setLanguage } = useLanguageStore.getState();
  const { setBackgroundEffect, setSoundsEnabled, setAmbientSound } = useThemeStore.getState();
  const { setCustomSystemPrompt } = useAIStore.getState();

  try {
    // 1. SET_LANGUAGE
    const langMatch = findAction(cleanResponse, 'SET_LANGUAGE');
    if (langMatch) {
      const data = parseActionData(langMatch.data) as { lang?: 'tr' | 'en' | 'ja' } | null;
      if (data && data.lang) {
        setLanguage(data.lang);
        cleanResponse = cleanCommand(cleanResponse, langMatch);
        changed = true;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }

    // 2. SET_BACKGROUND_EFFECT
    const effectMatch = findAction(cleanResponse, 'SET_BACKGROUND_EFFECT');
    if (effectMatch) {
      const data = parseActionData(effectMatch.data) as { effect?: string; effectId?: string } | null;
      const effectName = data?.effect || data?.effectId;
      if (effectName) {
        setBackgroundEffect(effectName.toLowerCase() as BackgroundEffectType);
        cleanResponse = cleanCommand(cleanResponse, effectMatch);
        changed = true;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }

    // 3. SET_SOUNDS
    const soundsMatch = findAction(cleanResponse, 'SET_SOUNDS');
    if (soundsMatch) {
      const data = parseActionData(soundsMatch.data) as { enabled?: boolean } | null;
      if (data && data.enabled !== undefined) {
        setSoundsEnabled(data.enabled);
        cleanResponse = cleanCommand(cleanResponse, soundsMatch);
        changed = true;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }

    // 4. SET_ZEN_MODE
    const zenMatch = findAction(cleanResponse, 'SET_ZEN_MODE');
    if (zenMatch) {
      const data = parseActionData(zenMatch.data) as { enabled?: boolean } | null;
      if (data && data.enabled !== undefined) {
        cleanResponse = cleanCommand(cleanResponse, zenMatch);
        changed = true;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }

    // 5. SET_SYSTEM_PROMPT
    const promptMatch = findAction(cleanResponse, 'SET_SYSTEM_PROMPT');
    if (promptMatch) {
      const data = parseActionData(promptMatch.data) as { prompt?: string } | null;
      if (data && data.prompt) {
        setCustomSystemPrompt(data.prompt);
        cleanResponse = cleanCommand(cleanResponse, promptMatch);
        changed = true;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }

    // 6. NAVIGATE
    const navMatch = findAction(cleanResponse, 'NAVIGATE');
    if (navMatch) {
      const data = parseActionData(navMatch.data) as { route?: string } | null;
      if (data && data.route) {
        cleanResponse = cleanCommand(cleanResponse, navMatch);
        setTimeout(() => router.push(data.route as any), 3000);
        changed = true;
      }
    }

    // 7. SET_AMBIENT
    const ambientMatch = findAction(cleanResponse, 'SET_AMBIENT');
    if (ambientMatch) {
      const data = parseActionData(ambientMatch.data) as { soundId?: 'none' | 'river' | 'forest' | 'lofi' | 'rain' } | null;
      if (data && data.soundId) {
        setAmbientSound(data.soundId);
        cleanResponse = cleanCommand(cleanResponse, ambientMatch);
        changed = true;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }

    // 8. SET_CUSTOM_BACKGROUND
    const customBgMatch = findAction(cleanResponse, 'SET_CUSTOM_BACKGROUND');
    if (customBgMatch) {
      const data = parseActionData(customBgMatch.data) as Record<string, unknown> | null;
      if (data) {
        logger.info(`Setting Custom Background: ${JSON.stringify(data)}`, 'SettingsHandler');
        cleanResponse = cleanCommand(cleanResponse, customBgMatch);
        changed = true;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }

    // 9. CLEAR_CHAT
    const clearMatch = findAction(cleanResponse, 'CLEAR_CHAT');
    if (clearMatch) {
      useAIStore.getState().clearChatMessages();
      cleanResponse = cleanCommand(cleanResponse, clearMatch);
      changed = true;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  } catch (error) {
    logger.error(`Critical Error: ${error}`, 'SettingsHandler');
  }

  return { cleanResponse, changed };
};
