export interface ChatMessage {
  id: string;
  text: string;
  role: 'user' | 'model';
  timestamp: number;
}

export interface AIAction {
  fullMatch: string;
  type: string;
  data: Record<string, unknown>;
  regex: {
    [Symbol.replace]: (str: string) => string;
  };
}

export interface ChatState {
  inputText: string;
  isLoading: boolean;
  showScrollToBottom: boolean;
  isSelectionMode: boolean;
  selectedIds: string[];
}

export interface ThemeColors {
  primary: string;
  secondary?: string;
  background: string;
  card: string;
  text: string;
  subText: string;
  border: string;
  error: string;
  warning: string;
  success: string;
  info: string;
}

export interface CustomTheme {
  id: string;
  name: string;
  colors: Partial<ThemeColors>;
  lightColors?: Partial<ThemeColors>;
  darkColors?: Partial<ThemeColors>;
}

export type ChatSoundType = 'pop' | 'digital' | 'minimal';
export type AppLanguage = 'en' | 'tr';
