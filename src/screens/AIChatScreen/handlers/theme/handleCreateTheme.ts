import * as Haptics from 'expo-haptics';
import { useThemeStore } from '../../../../store/themeStore';
import { ThemeOption } from '../../../../constants/themes';
import { parseActionData } from '../actionParser';
import { CustomTheme, ThemeColors, AIAction } from '../../../../types/chat';
import logger from '../../../../utils/logger';
import { autoFixThemeColors, addMissingColors } from './colorFixes';
import { CreateThemeData } from './types';

export const handleCreateTheme = (cleanResponse: string, match: AIAction): { newResponse: string; changed: boolean } => {
  const { addCustomTheme, setThemeId } = useThemeStore.getState();
  
  const data = parseActionData(match.data) as CreateThemeData | null;
  logger.info(`CREATE_THEME match found, raw data: ${JSON.stringify(data)}`, 'ThemeHandler');
  
  if (data && (data.colors || data.darkColors || data.lightColors)) {
    // 1. Apply initial fixes
    autoFixThemeColors(data);
    
    // 2. Add missing fields with defaults
    addMissingColors(data.lightColors, false);
    addMissingColors(data.darkColors, true);
    
    // 3. Assemble the theme
    const baseColors = data.colors || data.darkColors || data.lightColors || {};
    const themeName = data.name ? data.name.charAt(0).toUpperCase() + data.name.slice(1) : 'AI Magic';
    const themeId = 'ai-' + themeName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    const newTheme: CustomTheme = {
      id: themeId,
      name: themeName,
      colors: {
        ...baseColors,
        secondary: (baseColors as any).secondary || (baseColors as any).primary
      } as unknown as ThemeColors,
      lightColors: data.lightColors ? { ...data.lightColors, secondary: data.lightColors.secondary || data.lightColors.primary } as unknown as ThemeColors : undefined,
      darkColors: data.darkColors ? { ...data.darkColors, secondary: data.darkColors.secondary || data.darkColors.primary } as unknown as ThemeColors : undefined
    };
    
    logger.info(`Adding custom theme: ${JSON.stringify(newTheme)}`, 'ThemeHandler');
    addCustomTheme(newTheme as unknown as ThemeOption);
    
    // AUTO-APPLY: Set the newly created theme as active
    logger.info(`Auto-applying theme: ${themeId}`, 'ThemeHandler');
    setThemeId(themeId);
    
    const newResponse = cleanResponse.replace(match.fullMatch, '').split('\n').filter(line => line.trim() !== '').join('\n').trim();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    return { newResponse, changed: true };
  } else {
    logger.warn(`CREATE_THEME failed: data invalid ${JSON.stringify(data)}`, 'ThemeHandler');
    return { newResponse: cleanResponse, changed: false };
  }
};
