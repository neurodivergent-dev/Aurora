import { ThemeColors } from '../../../../types/chat';
import logger from '../../../../utils/logger';
import { isLightColor, getComplementaryColor } from './validators';
import { AIColors, CreateThemeData } from './types';

/**
 * Fix common LLM mistakes (accent vs primary, background vs primary)
 */
export const autoFixThemeColors = (data: CreateThemeData) => {
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
  
  // AUTO-FIX: If primary looks like a background color
  if (data.lightColors && data.lightColors.primary) {
    const p = data.lightColors.primary.toUpperCase();
    if (p === '#FFFFFF' || p.startsWith('#F') || p.startsWith('#EEEE') || p.startsWith('#DDD')) {
      logger.info(`lightColors.primary looks like background (${p}), fixing...`, 'ThemeHandler');
      data.lightColors.background = data.lightColors.primary;
      data.lightColors.primary = '#6366F1';
    }
  }
  if (data.darkColors && data.darkColors.primary) {
    const p = data.darkColors.primary.toUpperCase();
    if (p === '#000000' || p === '#1A1A1A' || p === '#212121' || p === '#121212' || p === '#0A0A0A') {
      logger.info(`darkColors.primary looks like background (${p}), fixing...`, 'ThemeHandler');
      data.darkColors.background = data.darkColors.primary;
      data.darkColors.primary = '#818CF8';
    }
  }
};

/**
 * Add missing color fields with defaults
 */
export const addMissingColors = (colors: AIColors | undefined, isDark: boolean) => {
  if (!colors) return;

  // CRITICAL: Fix background and text for proper contrast
  if (!isDark) {
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

  // Vibrant primary color defaults
  if (!colors.primary || colors.primary === '#000000' || colors.primary === '#FFFFFF' || colors.primary.startsWith('#F') || colors.primary.startsWith('#E') || colors.primary.startsWith('#D')) {
    const vibrantPrimaries = isDark 
      ? ['#6366F1', '#F43F5E', '#F59E0B', '#10B981', '#8B5CF6', '#3B82F6', '#EC4899', '#06B6D4', '#84CC16', '#A855F7']
      : ['#4338CA', '#BE123C', '#B45309', '#047857', '#6D28D9', '#1D4ED8', '#BE185D', '#0E7490', '#4D7C0F', '#7E22CE'];
    colors.primary = vibrantPrimaries[Math.floor(Math.random() * vibrantPrimaries.length)];
    logger.info(`Invalid primary, using random vibrant: ${colors.primary}`, 'ThemeHandler');
  }

  // Secondary: Use complementary color of primary
  if (!colors.secondary || colors.secondary === '#A5B4FC' || colors.secondary === '#818CF8') {
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
