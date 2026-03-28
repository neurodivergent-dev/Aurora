import * as Haptics from 'expo-haptics';
import { useThemeStore } from '../../../../store/themeStore';
import { findAction, parseActionData } from '../actionParser';
import { AIAction } from '../../../../types/chat';
import logger from '../../../../utils/logger';

export const handleSetDarkMode = (cleanResponse: string, match: AIAction): { newResponse: string; changed: boolean } => {
  const { setIsDarkMode } = useThemeStore.getState();
  
  logger.info(`SET_DARK_MODE match found: "${match.data}"`, 'ThemeHandler');
  const data = parseActionData(match.data) as { isDark?: boolean } | null;
  
  if (data && typeof data.isDark === 'boolean') {
    const mode = data.isDark ? 'dark' : 'light';
    useThemeStore.getState().setThemeMode(mode);
    setIsDarkMode(data.isDark);
    const newResponse = cleanResponse.replace(match.fullMatch, '').split('\n').filter(line => line.trim() !== '').join('\n').trim();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    return { newResponse, changed: true };
  } else {
    logger.warn(`SET_DARK_MODE failed: data invalid ${JSON.stringify(data)}`, 'ThemeHandler');
    return { newResponse: cleanResponse, changed: false };
  }
};
