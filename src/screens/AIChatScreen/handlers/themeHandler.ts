import * as Haptics from 'expo-haptics';
import { useThemeStore } from '../../../store/themeStore';
import { findAction, parseActionData } from './actionParser';
import { CustomTheme } from '../../../types/chat';
import logger from '../../../utils/logger';

// Helper: Check if a color is light (returns true for light colors like #FFFFFF, false for dark like #000000)
const isLightColor = (hex: string): boolean => {
  if (!hex || typeof hex !== 'string') return true; // Default to light
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6) return true;

  try {
    const r = parseInt(cleanHex.substr(0, 2), 16);
    const g = parseInt(cleanHex.substr(2, 2), 16);
    const b = parseInt(cleanHex.substr(4, 2), 16);
    // Luminance formula
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5; // > 0.5 = light, < 0.5 = dark
  } catch (e) {
    return true;
  }
};

// Helper: Generate complementary color
const getComplementaryColor = (hex: string): string => {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6) return '#818CF8';
  
  try {
    const r = parseInt(cleanHex.substr(0, 2), 16);
    const g = parseInt(cleanHex.substr(2, 2), 16);
    const b = parseInt(cleanHex.substr(4, 2), 16);
    
    // Complementary: rotate hue by 180 degrees
    const compR = 255 - r;
    const compG = 255 - g;
    const compB = 255 - b;
    
    return `#${compR.toString(16).padStart(2, '0')}${compG.toString(16).padStart(2, '0')}${compB.toString(16).padStart(2, '0')}`.toUpperCase();
  } catch (e) {
    return '#818CF8';
  }
};

const cleanCommand = (text: string, match: any) => {
  return text.replace(match.regex as any, '').split('\n').filter(line => line.trim() !== '').join('\n').trim();
};

export const handleThemeActions = (response: string): { cleanResponse: string; changed: boolean } => {
  let cleanResponse = response;
  let changed = false;
  const { setIsDarkMode, setThemeId, addCustomTheme } = useThemeStore.getState();

  try {
    // 1. SET_DARK_MODE
    const darkMatch = findAction(cleanResponse, 'SET_DARK_MODE');
    if (darkMatch) {
      logger.info(`SET_DARK_MODE match found: "${darkMatch.data}"`, 'ThemeHandler');
      const data = parseActionData(darkMatch.data);
      if (data && typeof data.isDark === 'boolean') {
        setIsDarkMode(data.isDark);
        cleanResponse = cleanCommand(cleanResponse, darkMatch);
        changed = true;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        logger.warn(`SET_DARK_MODE failed: data invalid ${JSON.stringify(data)}`, 'ThemeHandler');
      }
    }

    // 2. SET_APP_THEME
    const themeMatch = findAction(cleanResponse, 'SET_APP_THEME');
    if (themeMatch) {
      logger.info(`SET_APP_THEME match found: "${themeMatch.data}"`, 'ThemeHandler');
      const data = parseActionData(themeMatch.data);
      if (data && data.themeId) {
        setThemeId(data.themeId.toLowerCase());
        cleanResponse = cleanCommand(cleanResponse, themeMatch);
        changed = true;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        logger.warn(`SET_APP_THEME failed: data invalid ${JSON.stringify(data)}`, 'ThemeHandler');
      }
    }

    // 3. CREATE_THEME
    const createThemeMatch = findAction(cleanResponse, 'CREATE_THEME');
    if (createThemeMatch) {
      const data = parseActionData(createThemeMatch.data);
      logger.info(`CREATE_THEME match found, raw data: ${JSON.stringify(data)}`, 'ThemeHandler');
      if (data && (data.colors || data.darkColors || data.lightColors)) {
        // If only "colors" is provided, use it for both lightColors and darkColors
        if (data.colors && !data.lightColors && !data.darkColors) {
          logger.info('Only "colors" provided, using for both modes', 'ThemeHandler');
          data.lightColors = { ...data.colors };
          data.darkColors = { ...data.colors };
        }
        
        // AUTO-FIX: Ollama might send "accent" instead of "primary"
        if (data.lightColors && data.lightColors.accent && !data.lightColors.primary) {
          data.lightColors.primary = data.lightColors.accent;
        }
        if (data.darkColors && data.darkColors.accent && !data.darkColors.primary) {
          data.darkColors.primary = data.darkColors.accent;
        }

        // AUTO-FIX: If LLM only provides one mode, copy to the other with adjustments
        if (data.lightColors && !data.darkColors) {
          logger.info('Only lightColors provided, creating darkColors', 'ThemeHandler');
          data.darkColors = {
            ...data.lightColors,
            background: '#0F0F11',
            text: '#FFFFFF',
            card: '#1A1A1A',
            cardBorder: 'rgba(255, 255, 255, 0.1)',
          };
        }
        if (data.darkColors && !data.lightColors) {
          logger.info('Only darkColors provided, creating lightColors', 'ThemeHandler');
          data.lightColors = {
            ...data.darkColors,
            background: '#FFFFFF',
            text: '#111111',
            card: '#F5F5F5',
            cardBorder: 'rgba(0, 0, 0, 0.05)',
          };
        }
        
        // AUTO-FIX: If primary looks like a background color (very light or very dark), move it to background
        // Light mode: #FFFFFF or #Fxxxxx = background
        if (data.lightColors && data.lightColors.primary) {
          const p = data.lightColors.primary.toUpperCase();
          if (p === '#FFFFFF' || p.startsWith('#F') || p.startsWith('#EEEE') || p.startsWith('#DDD')) {
            logger.info(`lightColors.primary looks like background (${p}), fixing...`, 'ThemeHandler');
            data.lightColors.background = data.lightColors.primary;
            data.lightColors.primary = '#6366F1'; // Default primary
          }
        }
        // Dark mode: #000000, #1xxxxx, #2xxxxx = background (but NOT #00A86B like colors!)
        if (data.darkColors && data.darkColors.primary) {
          const p = data.darkColors.primary.toUpperCase();
          // Only fix if it's BLACK or very dark gray (#000, #111, #222, etc.)
          if (p === '#000000' || p === '#1A1A1A' || p === '#212121' || p === '#121212' || p === '#0A0A0A') {
            logger.info(`darkColors.primary looks like background (${p}), fixing...`, 'ThemeHandler');
            data.darkColors.background = data.darkColors.primary;
            data.darkColors.primary = '#818CF8'; // Default primary
          }
        }
        
        // AUTO-FIX: Add missing color fields with defaults
        const addMissingColors = (colors: any, isDark: boolean) => {
          if (!colors) return;

          // CRITICAL: Fix background and text for proper contrast
          if (!isDark) {
            // LIGHT MODE: white/light bg, dark text
            const bg = colors.background || colors.bg;
            if (!bg || !isLightColor(bg)) {
              logger.info(`LIGHT MODE: Invalid bg (${bg}), fixing`, 'ThemeHandler');
              colors.background = '#FFFFFF';
            }
            const text = colors.text;
            if (!text || isLightColor(text)) {
              colors.text = '#111111';
            }
            if (!colors.card) colors.card = '#F5F5F5';
          } else {
            // DARK MODE: dark bg, light text
            const bg = colors.background || colors.bg;
            if (!bg || isLightColor(bg)) {
              logger.info(`DARK MODE: Invalid bg (${bg}), fixing`, 'ThemeHandler');
              colors.background = '#0F0F11';
            }
            const text = colors.text;
            if (!text || !isLightColor(text)) {
              colors.text = '#FFFFFF';
            }
            if (!colors.card) colors.card = '#1A1A1A';
          }

          // Vibrant primary color (NOT black/white/gray)
          if (!colors.primary || colors.primary === '#000000' || colors.primary === '#FFFFFF' || colors.primary.startsWith('#F') || colors.primary.startsWith('#E') || colors.primary.startsWith('#D')) {
            const vibrantPrimaries = isDark 
              ? [
                  '#6366F1', // Indigo
                  '#F43F5E', // Rose
                  '#F59E0B', // Amber
                  '#10B981', // Emerald
                  '#8B5CF6', // Violet
                  '#3B82F6', // Blue
                  '#EC4899', // Pink
                  '#06B6D4', // Cyan
                  '#84CC16', // Lime
                  '#A855F7', // Purple
                ]
              : [
                  '#4338CA', // Deep Indigo
                  '#BE123C', // Deep Rose
                  '#B45309', // Deep Amber
                  '#047857', // Deep Emerald
                  '#6D28D9', // Deep Violet
                  '#1D4ED8', // Deep Blue
                  '#BE185D', // Deep Pink
                  '#0E7490', // Deep Cyan
                  '#4D7C0F', // Deep Lime
                  '#7E22CE', // Deep Purple
                ];
            colors.primary = vibrantPrimaries[Math.floor(Math.random() * vibrantPrimaries.length)];
            logger.info(`Invalid primary, using random vibrant: ${colors.primary}`, 'ThemeHandler');
          }

          // Secondary: Use complementary color of primary for vibrant combinations
          if (!colors.secondary || colors.secondary === '#A5B4FC' || colors.secondary === '#818CF8') {
            // Only generate complementary if secondary looks like default
            colors.secondary = getComplementaryColor(colors.primary);
            logger.info(`Generated complementary secondary: ${colors.secondary} from primary: ${colors.primary}`, 'ThemeHandler');
          }

          // Other defaults
          if (!colors.cardBackground) colors.cardBackground = colors.card;
          if (!colors.cardBorder) colors.cardBorder = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
          if (!colors.subText) colors.subText = isDark ? '#CCCCCC' : '#666666';
          if (!colors.border) colors.border = isDark ? '#404040' : '#E0E0E0';
          if (!colors.error) colors.error = '#EF4444';
          if (!colors.warning) colors.warning = '#F59E0B';
          if (!colors.success) colors.success = '#10B981';
          if (!colors.info) colors.info = '#3B82F6';
        };
        
        // Apply to both lightColors and darkColors
        addMissingColors(data.lightColors, false);
        addMissingColors(data.darkColors, true);
        
        const baseColors = data.colors || data.darkColors || data.lightColors || data.colors;
        const themeName = data.name ? data.name.charAt(0).toUpperCase() + data.name.slice(1) : 'AI Magic';
        const themeId = 'ai-' + themeName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const newTheme: CustomTheme = {
          id: themeId,
          name: themeName,
          colors: {
            ...baseColors,
            secondary: baseColors.secondary || baseColors.primary
          },
          lightColors: data.lightColors ? { ...data.lightColors, secondary: data.lightColors.secondary || data.lightColors.primary } : undefined,
          darkColors: data.darkColors ? { ...data.darkColors, secondary: data.darkColors.secondary || data.darkColors.primary } : undefined
        };
        logger.info(`Adding custom theme: ${JSON.stringify(newTheme)}`, 'ThemeHandler');
        addCustomTheme(newTheme as any);
        // AUTO-APPLY: Set the newly created theme as active
        logger.info(`Auto-applying theme: ${themeId}`, 'ThemeHandler');
        setThemeId(themeId);
        cleanResponse = cleanCommand(cleanResponse, createThemeMatch);
        changed = true;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  } catch (error) {
    logger.error(`Critical Error: ${error}`, 'ThemeHandler');
  }

  return { cleanResponse: cleanResponse.trim(), changed };
};
