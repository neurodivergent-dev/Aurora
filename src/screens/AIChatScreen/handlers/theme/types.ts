import { ThemeColors } from '../../../../types/chat';

export type AIColors = Partial<ThemeColors> & { accent?: string; bg?: string };

export interface CreateThemeData {
  name?: string;
  colors?: AIColors;
  lightColors?: AIColors;
  darkColors?: AIColors;
}
