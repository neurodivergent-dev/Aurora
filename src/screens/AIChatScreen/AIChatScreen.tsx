import React, { useState, useRef, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Keyboard,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Sparkles, User, Bot, Trash2, ChevronDown, CheckCircle2, Circle, X, Copy, CheckCheck, Send, Zap, BrainCircuit, Settings2, ChevronUp, Cloud } from 'lucide-react-native';
import { useAIStore, ChatMessage } from '../../store/aiStore';
import { useOllamaStore } from '../../store/ollamaStore';
import { useTheme } from '../../components/ThemeProvider';
import { MarkdownText } from '../../components/MarkdownText';
import { CustomAlert } from '../../components/CustomAlert';
import { BackgroundEffects } from '../../components/BackgroundEffects';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import Animated, { FadeInUp, FadeInDown, FadeIn, FadeOut, useSharedValue, useAnimatedStyle, withRepeat, withDelay, withTiming } from 'react-native-reanimated';
import { styles } from './styles';
import { useAIChat } from './hooks/useAIChat';
import { useThemeStore } from '../../store/themeStore';
import { soundService } from '../../services/SoundService';

const TypingIndicator = ({ colors, isDarkMode }: { colors: any, isDarkMode: boolean }) => {
  const { t } = useTranslation();

  const Dot = ({ delay }: { delay: number }) => {
    const scale = useSharedValue(1);

    React.useEffect(() => {
      scale.value = withRepeat(
        withDelay(delay, withTiming(1.5, { duration: 600 })),
        -1,
        true
      );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: withTiming(scale.value > 1.2 ? 1 : 0.5, { duration: 300 }),
    }));

    return (
      <Animated.View style={[styles.typingDot, { backgroundColor: colors.primary }, animatedStyle]} />
    );
  };

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(300)}
      style={[
        styles.premiumTypingContainer,
        {
          backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
          borderColor: colors.primary + '30'
        }
      ]}
    >
      <View style={styles.typingDotsRow}>
        <Dot delay={0} />
        <Dot delay={200} />
        <Dot delay={400} />
      </View>
      <Text style={[styles.premiumTypingText, { color: colors.text }]}>{t('settings.ai.chat.typing')}</Text>
    </Animated.View>
  );
};

const AIChatScreen = () => {
  const { colors, isDarkMode } = useTheme();
  const { t } = useTranslation();
  const { chatMessages, chatSoundsEnabled, chatSoundType, activeProvider, groqModel, setActiveProvider, setGroqModel } = useAIStore();
  const { ollamaModel, ollamaCloudMode } = useOllamaStore();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  const [inputText, setInputText] = useState('');
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showModelSelector, setShowModelSelector] = useState(false);

  // Use the custom hook
  const {
    isLoading,
    clearChatAlertVisible,
    setClearChatAlertVisible,
    handleSend,
    clearChat,
  } = useAIChat();

  const [deleteAlertVisible, setDeleteAlertVisible] = useState(false);

  // Welcome message (not persisted, just for display)
  const displayMessages = useMemo(() => {
    const welcomeMsg = {
      id: 'welcome',
      text: t('settings.ai.chat.welcome'),
      role: 'model' as const,
      timestamp: 0,
    };
    return [welcomeMsg, ...chatMessages];
  }, [chatMessages, t]);

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const contentHeight = event.nativeEvent.contentSize.height;
    const layoutHeight = event.nativeEvent.layoutMeasurement.height;
    const isCloseToBottom = contentHeight - layoutHeight - offsetY < 100;
    setShowScrollToBottom(!isCloseToBottom);
  };

  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleSelection = (id: string) => {
    if (id === 'welcome') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        const next = prev.filter(item => item !== id);
        if (next.length === 0) setIsSelectionMode(false);
        return next;
      }
      return [...prev, id];
    });
  };

  const clearSelection = () => {
    setIsSelectionMode(false);
    setSelectedIds([]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleDeleteMessage = (id: string, text: string) => {
    if (id === 'welcome') return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (isSelectionMode) {
      toggleSelection(id);
      return;
    }

    // Now long press ONLY enters selection mode. 
    // No alert is shown here. Alert only on delete button click.
    setIsSelectionMode(true);
    setSelectedIds([id]);
  };

  const confirmDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    useAIStore.getState().deleteChatMessages(selectedIds);
    setIsSelectionMode(false);
    setSelectedIds([]);
    setDeleteAlertVisible(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleCopySelected = async () => {
    if (selectedIds.length === 0) return;
    const selectedMessages = displayMessages
      .filter(m => selectedIds.includes(m.id) && m.id !== 'welcome')
      .sort((a, b) => a.timestamp - b.timestamp);
    const combinedText = selectedMessages
      .map(m => `${m.role === 'user' ? '👤 ME' : '🤖 AI'}: ${m.text}`)
      .join('\n\n---\n\n');
    await Clipboard.setStringAsync(combinedText);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsSelectionMode(false);
    setSelectedIds([]);
  };

  const handleSelectAll = () => {
    const allIds = displayMessages.filter(m => m.id !== 'welcome').map(m => m.id);
    if (selectedIds.length === allIds.length) {
      setSelectedIds([]);
      setIsSelectionMode(false);
    } else {
      setSelectedIds(allIds);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleModelChange = (provider: 'gemini' | 'groq' | 'ollama') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveProvider(provider);
    setShowModelSelector(false);
    soundService.playClick();
  };

  const handleQuickModelChange = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    soundService.playClick();
    // Cycle through providers
    const nextProvider = activeProvider === 'gemini' ? 'groq' : activeProvider === 'groq' ? 'ollama' : 'gemini';
    handleModelChange(nextProvider);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isAi = item.role === 'model';
    const isSelected = selectedIds.includes(item.id);

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
          <TouchableOpacity onPress={() => toggleSelection(item.id)} style={styles.selectionCircle}>
            {isSelected ? (
              <CheckCircle2 size={22} color={colors.primary} fill={colors.primary + '20'} />
            ) : (
              <Circle size={22} color={colors.subText + '40'} />
            )}
          </TouchableOpacity>
        )}

        <View style={[styles.messageContainer, !isAi && { flexDirection: 'row-reverse' }]}>
          <View style={[styles.avatar, { backgroundColor: isAi ? colors.primary + '15' : colors.secondary + '15' }]}>
            {isAi ? <Bot size={14} color={colors.primary} /> : <User size={14} color={colors.secondary} />}
          </View>
          <TouchableOpacity
            activeOpacity={0.9}
            onLongPress={() => handleDeleteMessage(item.id, item.text)}
            onPress={() => isSelectionMode ? toggleSelection(item.id) : null}
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
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDarkMode ? 0 : 0.05,
                shadowRadius: 5,
                elevation: isDarkMode ? 0 : 2,
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
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.background }]} 
      activeOpacity={1}
      onPress={() => showModelSelector && setShowModelSelector(false)}
    >
      <BackgroundEffects />
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />
      <Animated.View style={styles.flex}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flex}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          {/* Header */}
          <LinearGradient
            colors={isSelectionMode ? [colors.card, colors.card] : [colors.primary, colors.secondary || colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.header,
              {
                paddingTop: insets.top + 12,
                paddingBottom: 20,
                borderBottomWidth: 1,
                borderBottomColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              }
            ]}
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
                    <TouchableOpacity onPress={clearSelection} style={styles.clearSelectionButton}>
                      <X size={20} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>
                      {selectedIds.length} {t('common.selected') || 'Selected'}
                    </Text>
                  </View>
                  <View style={styles.headerSelectionActions}>
                    <TouchableOpacity onPress={handleSelectAll} style={styles.selectionActionButton}>
                      <CheckCheck size={20} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleCopySelected} style={styles.selectionActionButton}>
                      <Copy size={20} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setDeleteAlertVisible(true)} style={styles.selectionActionButton}>
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
                    <View style={styles.headerTitleWrapper}>
                      <Text style={styles.headerTitle}>{t('settings.ai.chat.title')}</Text>
                      <Text style={styles.headerSubtitle}>{t('app.slogan')}</Text>
                      
                      <TouchableOpacity 
                        style={styles.activeModelChip} 
                        onPress={() => setShowModelSelector(!showModelSelector)}
                        activeOpacity={0.7}
                      >
                        {activeProvider === 'gemini' ? (
                          <Sparkles size={12} color="#FFFFFF" />
                        ) : activeProvider === 'groq' ? (
                          <Cloud size={12} color="#FFFFFF" />
                        ) : (
                          <BrainCircuit size={12} color="#FFFFFF" />
                        )}
                        <Text style={styles.activeModelChipText}>
                          {activeProvider === 'gemini' ? 'Gemini 2.5 Flash' : activeProvider === 'groq' ? groqModel : ollamaModel}
                        </Text>
                        {showModelSelector ? <ChevronUp size={12} color="#FFFFFF" /> : <ChevronDown size={12} color="#FFFFFF" />}
                      </TouchableOpacity>
                    </View>

                    {/* Model Selector Dropdown */}
                    {showModelSelector && (
                      <View style={styles.modelSelectorContainer}>
                        <View style={styles.modelSelectorDropdown}>
                          <TouchableOpacity
                            style={[styles.modelSelectorOption, { backgroundColor: activeProvider === 'gemini' ? colors.primary + '30' : 'transparent' }]}
                            onPress={() => handleModelChange('gemini')}
                          >
                            <Sparkles size={16} color={activeProvider === 'gemini' ? '#FFFFFF' : 'rgba(255,255,255,0.7)'} />
                            <Text style={[styles.modelSelectorText, { color: activeProvider === 'gemini' ? '#FFFFFF' : 'rgba(255,255,255,0.7)' }]}>
                              Gemini 2.5 Flash
                            </Text>
                            {activeProvider === 'gemini' && <CheckCircle2 size={14} color="#FFFFFF" />}
                          </TouchableOpacity>
                          
                          <TouchableOpacity
                            style={[styles.modelSelectorOption, { backgroundColor: activeProvider === 'groq' ? colors.primary + '30' : 'transparent' }]}
                            onPress={() => handleModelChange('groq')}
                          >
                            <Cloud size={16} color={activeProvider === 'groq' ? '#FFFFFF' : 'rgba(255,255,255,0.7)'} />
                            <Text style={[styles.modelSelectorText, { color: activeProvider === 'groq' ? '#FFFFFF' : 'rgba(255,255,255,0.7)' }]}>
                              {groqModel}
                            </Text>
                            {activeProvider === 'groq' && <CheckCircle2 size={14} color="#FFFFFF" />}
                          </TouchableOpacity>
                          
                          <TouchableOpacity
                            style={[styles.modelSelectorOption, { backgroundColor: activeProvider === 'ollama' ? colors.primary + '30' : 'transparent' }]}
                            onPress={() => handleModelChange('ollama')}
                          >
                            <BrainCircuit size={16} color={activeProvider === 'ollama' ? '#FFFFFF' : 'rgba(255,255,255,0.7)'} />
                            <Text style={[styles.modelSelectorText, { color: activeProvider === 'ollama' ? '#FFFFFF' : 'rgba(255,255,255,0.7)' }]}>
                              {ollamaModel} {ollamaCloudMode ? '(Cloud)' : '(Ollama)'}
                            </Text>
                            {activeProvider === 'ollama' && <CheckCircle2 size={14} color="#FFFFFF" />}
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>
                  <TouchableOpacity onPress={clearChat} style={styles.clearButton}>
                    <View style={styles.clearButtonInner}>
                      <Trash2 size={18} color="#FFFFFF" />
                    </View>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </LinearGradient>

          {!(useAIStore.getState().apiKey || useAIStore.getState().groqApiKey || useAIStore.getState().activeProvider === 'ollama') || !useAIStore.getState().isAIEnabled ? (
            <View style={styles.emptyState}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.warning + '20', justifyContent: 'center', alignItems: 'center' }}>
                <Bot size={24} color={colors.warning} />
              </View>
              <Text style={[styles.emptyStateText, { color: colors.subText, marginTop: 16, textAlign: 'center' }]}>
                {t('settings.ai.chat.noApiKey')}
              </Text>
            </View>
          ) : (
            <>
              <FlatList
                ref={flatListRef}
                data={displayMessages}
                renderItem={renderMessage}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                onContentSizeChange={() => {
                  if (!showScrollToBottom) flatListRef.current?.scrollToEnd({ animated: true });
                }}
                onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                keyboardDismissMode="on-drag"
              />

              {showScrollToBottom && (
                <Animated.View entering={FadeInDown.duration(200)} exiting={FadeInDown.duration(200)} style={styles.scrollToBottomContainer}>
                  <TouchableOpacity onPress={scrollToBottom} style={[styles.scrollToBottomButton, { backgroundColor: colors.card }]}>
                    <ChevronDown size={20} color={colors.primary} />
                  </TouchableOpacity>
                </Animated.View>
              )}

              {isLoading && <TypingIndicator colors={colors} isDarkMode={isDarkMode} />}

              <View style={[styles.inputContainer, { borderTopColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', backgroundColor: colors.background }]}>
                <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder={t('settings.ai.chat.placeholder')}
                    placeholderTextColor={colors.subText + '80'}
                    value={inputText}
                    onChangeText={setInputText}
                    multiline
                  />
                  <TouchableOpacity
                    onPress={() => handleSend(inputText, setInputText, chatSoundsEnabled, chatSoundType)}
                    disabled={!inputText.trim() || isLoading}
                    style={[styles.sendButton, { backgroundColor: inputText.trim() && !isLoading ? colors.primary : colors.subText + '20' }]}
                  >
                    <Send size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </KeyboardAvoidingView>
      </Animated.View>

      <CustomAlert
        visible={clearChatAlertVisible}
        title={t('settings.ai.chat.clearHistoryTitle')}
        message={t('settings.ai.chat.clearHistoryDescription')}
        type="danger"
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        onConfirm={() => {
          useAIStore.getState().clearChatMessages();
          setClearChatAlertVisible(false);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }}
        onCancel={() => setClearChatAlertVisible(false)}
      />

      <CustomAlert
        visible={deleteAlertVisible}
        title={selectedIds.length > 1 ? `${selectedIds.length} ${t('common.selected')}` : t('common.delete')}
        message={t('settings.ai.chat.deleteMessageConfirm') || (selectedIds.length > 1 ? "Are you sure you want to delete selected messages?" : "Are you sure you want to delete this message?")}
        type="danger"
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        onConfirm={confirmDeleteSelected}
        onCancel={() => {
          setDeleteAlertVisible(false);
          if (!isSelectionMode) setSelectedIds([]);
        }}
      />
    </TouchableOpacity>
  );
};

export default AIChatScreen;
