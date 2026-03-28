import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, CheckCheck, Copy, Trash2, Sparkles } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { styles } from '../styles';
import { ThemeColors } from '../../../types/chat';

interface ChatHeaderProps {
  colors: ThemeColors;
  isSelectionMode: boolean;
  selectedCount: number;
  insets: { top: number };
  onClearSelection: () => void;
  onSelectAll: () => void;
  onCopySelected: () => void;
  onDeleteSelected: () => void;
  onClearChat: () => void;
}

export const ChatHeader = ({
  colors,
  isSelectionMode,
  selectedCount,
  insets,
  onClearSelection,
  onSelectAll,
  onCopySelected,
  onDeleteSelected,
  onClearChat
}: ChatHeaderProps) => {
  const { t } = useTranslation();

  return (
    <LinearGradient
      colors={isSelectionMode ? [colors.card, colors.card] : [colors.primary, colors.secondary || colors.primary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.header, { paddingTop: insets.top + 12 }]}
    >
      {!isSelectionMode && (
        <>
          <View style={styles.headerDecorationCircle1} />
          <View style={styles.headerDecorationCircle2} />
        </>
      )}

      <View style={styles.headerContent}>
        {isSelectionMode ? (
          <>
            <View style={styles.headerTitleContainer}>
              <TouchableOpacity onPress={onClearSelection} style={styles.clearSelectionButton}>
                <X size={20} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                {selectedCount} {t('common.selected')}
              </Text>
            </View>
            <View style={styles.headerSelectionActions}>
              <TouchableOpacity onPress={onSelectAll} style={styles.selectionActionButton}>
                <CheckCheck size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={onCopySelected} style={styles.selectionActionButton}>
                <Copy size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={onDeleteSelected} style={styles.selectionActionButton}>
                <Trash2 size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <View style={styles.headerTitleContainer}>
              <View style={styles.iconBadge}>
                <Sparkles size={18} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.headerTitle}>{t('settings.ai.chat.title')}</Text>
                <Text style={styles.headerSubtitle}>{t('app.slogan')}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClearChat} style={styles.clearButton}>
              <View style={styles.clearButtonInner}>
                <Trash2 size={18} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </>
        )}
      </View>
    </LinearGradient>
  );
};
