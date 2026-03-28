import * as Haptics from 'expo-haptics';
import { useThemeStore } from '../../../../store/themeStore';
import { parseActionData } from '../actionParser';
import { AIAction } from '../../../../types/chat';
import logger from '../../../../utils/logger';

export const handleSetAppTheme = (cleanResponse: string, match: AIAction): { newResponse: string; changed: boolean } => {
  const { setThemeId } = useThemeStore.getState();
  
  logger.info(`SET_APP_THEME match found: "${match.data}"`, 'ThemeHandler');
  const data = parseActionData(match.data) as { themeId?: string } | null;
  
  if (data && data.themeId) {
    setThemeId(data.themeId.toLowerCase());
    const newResponse = cleanResponse.replace(match.fullMatch, '').split('\n').filter(line => line.trim() !== '').join('\n').trim();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    return { newResponse, changed: true };
  } else {
    logger.warn(`SET_APP_THEME failed: data invalid ${JSON.stringify(data)}`, 'ThemeHandler');
    return { newResponse: cleanResponse, changed: false };
  }
};
