import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Send } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { styles } from '../styles';

interface ChatInputProps {
  colors: any;
  isDarkMode: boolean;
  inputText: string;
  setInputText: (text: string) => void;
  onSend: () => void;
  isLoading: boolean;
}

export const ChatInput = ({
  colors,
  isDarkMode,
  inputText,
  setInputText,
  onSend,
  isLoading
}: ChatInputProps) => {
  const { t } = useTranslation();

  return (
    <View style={[styles.inputContainer, { 
      borderTopColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
      backgroundColor: colors.background 
    }]}>
      <View style={[styles.inputWrapper, { 
        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' 
      }]}>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder={t('settings.ai.chat.placeholder')}
          placeholderTextColor={colors.subText + '80'}
          value={inputText}
          onChangeText={setInputText}
          multiline
          editable={!isLoading}
        />
        <TouchableOpacity
          onPress={onSend}
          disabled={!inputText.trim() || isLoading}
          style={[
            styles.sendButton,
            { backgroundColor: inputText.trim() && !isLoading ? colors.primary : colors.subText + '20' }
          ]}
        >
          <Send size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
