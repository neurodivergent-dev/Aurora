import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { User, Bot, CheckCircle2, Circle } from 'lucide-react-native';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { MarkdownText } from '../../../components/MarkdownText';
import { ChatMessage } from '../../../types/chat';
import { styles } from '../styles';

interface MessageBubbleProps {
  item: ChatMessage;
  colors: any;
  isDarkMode: boolean;
  isSelectionMode: boolean;
  isSelected: boolean;
  onLongPress: (id: string) => void;
  onPress: (id: string) => void;
}

export const MessageBubble = React.memo(({
  item,
  colors,
  isDarkMode,
  isSelectionMode,
  isSelected,
  onLongPress,
  onPress
}: MessageBubbleProps) => {
  const isAi = item.role === 'model';

  return (
    <Animated.View
      entering={isAi ? FadeInUp.delay(100) : FadeInDown}
      style={[
        styles.messageWrapper,
        isAi ? styles.aiMessageWrapper : styles.userMessageWrapper,
        isSelectionMode && { maxWidth: '100%', width: '100%' }
      ]}
    >
      {isSelectionMode && item.id !== 'welcome' && (
        <TouchableOpacity
          onPress={() => onPress(item.id)}
          style={styles.selectionCircle}
        >
          {isSelected ? (
            <CheckCircle2 size={22} color={colors.primary} fill={colors.primary + '20'} />
          ) : (
            <Circle size={22} color={colors.subText + '40'} />
          )}
        </TouchableOpacity>
      )}

      <View style={[
        styles.messageContainer,
        !isAi && { flexDirection: 'row-reverse' }
      ]}>
        <View style={[
          styles.avatar,
          { backgroundColor: isAi ? colors.primary + '15' : colors.secondary + '15' }
        ]}>
          {isAi ? <Bot size={14} color={colors.primary} /> : <User size={14} color={colors.secondary} />}
        </View>
        <TouchableOpacity
          activeOpacity={0.9}
          onLongPress={() => onLongPress(item.id)}
          onPress={() => isSelectionMode ? onPress(item.id) : null}
          style={[
            styles.messageBubble,
            {
              backgroundColor: isAi
                ? (isDarkMode ? 'rgba(255,255,255,0.06)' : colors.card)
                : colors.primary,
              borderBottomLeftRadius: isAi ? 4 : 20,
              borderBottomRightRadius: isAi ? 20 : 4,
              borderWidth: isSelected ? 1.5 : 0,
              borderColor: colors.primary,
            },
            isSelectionMode && { maxWidth: '85%' }
          ]}
        >
          <MarkdownText
            content={item.text}
            baseColor={isAi ? colors.text : '#FFFFFF'}
            style={styles.messageText}
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
});
