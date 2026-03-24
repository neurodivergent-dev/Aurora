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
  ActivityIndicator,
  StatusBar,
  Keyboard,
  Alert,
  Linking
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../components/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { Send, Sparkles, User, Bot, AlertCircle, Trash2, ChevronDown, CheckCircle2, Circle, X, Copy, CheckCheck } from 'lucide-react-native';
import { aiService } from '../services/aiService';
import { soundService } from '../services/SoundService';
import { useAIStore, ChatMessage } from '../store/aiStore';
import { MarkdownText } from '../components/MarkdownText';
import { CustomAlert } from '../components/CustomAlert';
import { BackgroundEffects } from '../components/BackgroundEffects';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../store/themeStore';
import { useLanguageStore } from '../store/languageStore';
import Animated, { FadeInUp, FadeInDown, useAnimatedStyle, withTiming, useDerivedValue, useSharedValue, withRepeat, withDelay, FadeIn, FadeOut } from 'react-native-reanimated';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { exportData, dataToJSON } from '../utils/backup';
import * as Clipboard from 'expo-clipboard';
import { useSettingsStore } from '../store/settingsStore';
import { useMusicStore } from '../store/musicStore';


const TypingIndicator = ({ colors, isDarkMode }: { colors: any, isDarkMode: boolean }) => {
  const { t } = useTranslation();

  const Dot = ({ delay }: { delay: number }) => {
    const scale = useSharedValue(1);

    React.useEffect(() => {
      scale.value = withRepeat(
        withDelay(
          delay,
          withTiming(1.5, { duration: 600 })
        ),
        -1,
        true
      );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: withTiming(scale.value > 1.2 ? 1 : 0.5, { duration: 300 }),
    }));

    return (
      <Animated.View
        style={[
          styles.typingDot,
          { backgroundColor: colors.primary },
          animatedStyle
        ]}
      />
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
  const { t, i18n } = useTranslation();
  const { apiKey, groqApiKey, activeProvider, isAIEnabled, chatMessages, addChatMessage, deleteChatMessage, deleteChatMessages, clearChatMessages, customSystemPrompt, setCustomSystemPrompt, chatSoundsEnabled, chatSoundType } = useAIStore();
  const setIsDarkMode = useThemeStore(state => state.setIsDarkMode);
  const setThemeId = useThemeStore(state => state.setThemeId);
  const setLanguage = useLanguageStore(state => state.setLanguage);
  const resetLanguage = useLanguageStore(state => state.resetState);
  const setSoundsEnabled = useThemeStore(state => state.setSoundsEnabled);
  const setBackgroundEffect = useThemeStore(state => state.setBackgroundEffect);
  const addCustomTheme = useThemeStore(state => state.addCustomTheme);
  const setCustomBackgroundConfig = useThemeStore(state => state.setCustomBackgroundConfig);
  const ambientSound = useThemeStore(state => state.ambientSound);
  const setAmbientSound = useThemeStore(state => state.setAmbientSound);
  const isZenMode = useThemeStore(state => state.isZenMode);
  const setIsZenMode = useThemeStore(state => state.setIsZenMode);
  const { play, pause, next, setCurrentTrack, playlist, setIsPlaying, setVolume, volume, createPlaylist, updatePlaylist, deletePlaylist, setTrackLyrics, setTrackArtwork, currentTrack, loadLocalMusic } = useMusicStore();
  const insets = useSafeAreaInsets();


  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [clearChatAlertVisible, setClearChatAlertVisible] = useState(false);
  const [deleteMessageAlertVisible, setDeleteMessageAlertVisible] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const contentHeight = event.nativeEvent.contentSize.height;
    const layoutHeight = event.nativeEvent.layoutMeasurement.height;

    // Alttan 100 pikselden fazla uzaklaşırsa butonu göster
    const isCloseToBottom = contentHeight - layoutHeight - offsetY < 100;
    setShowScrollToBottom(!isCloseToBottom);
  };

  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Hoşgeldin mesajını her zaman en başta tut (persist edilmez, sadece görüntülenir)
  const displayMessages = useMemo(() => {
    const welcomeMsg = {
      id: 'welcome',
      text: t('settings.ai.chat.welcome'),
      role: 'model' as const,
      timestamp: 0, // En üstte kalması için 0 veriyoruz
    };
    return [welcomeMsg, ...chatMessages];
  }, [chatMessages, t]);

  // Sohbet geçmişini Gemini formatına çevir (Sadece mesajlar değişince güncellenir)
  const chatHistory = useMemo(() => {
    return chatMessages.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));
  }, [chatMessages]);

  const zenOpacity = useDerivedValue(() => withTiming(isZenMode ? 0 : 1, { duration: 500 }));
  const zenUIStyle = useAnimatedStyle(() => ({
    opacity: zenOpacity.value,
    transform: [{ translateY: withTiming(isZenMode ? 20 : 0, { duration: 500 }) }],
  }));

  const toggleZenMode = () => {
    setIsZenMode(!isZenMode);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const playChatSound = (type: 'send' | 'receive') => {
    if (!chatSoundsEnabled) return;

    if (chatSoundType === 'pop') {
      soundService.playClick();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (chatSoundType === 'digital') {
      if (type === 'receive') soundService.playComplete();
      else soundService.playClick();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.selectionAsync();
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;
    const hasValidKey = apiKey || groqApiKey || activeProvider === 'ollama';
    if (!hasValidKey || !isAIEnabled) {
      alert(t('settings.ai.chat.noApiKey'));
      return;
    }

    const todayDate = new Date();
    const todayStr = todayDate.toISOString().split('T')[0];

    // Minimal Context preparation (No goals)
    const statsContext = `Today is ${todayStr}. Application is focused on Premium Music & Aesthetics.`;
    const goalContext = statsContext;

    const musicStoreRef = useMusicStore.getState();
    const musicContext = `MUSIC LIBRARY (CRITICAL):
    - Current Song: "${musicStoreRef.currentTrack?.title || "None"}" by "${musicStoreRef.currentTrack?.artist || "Unknown"}" (ID: ${musicStoreRef.currentTrack?.id || "None"})
    - User Playlists: ${musicStoreRef.myPlaylists.length > 0 ? musicStoreRef.myPlaylists.map((p: any) => `"${p.name}" (ID: "${p.id}", ${p.trackIds.length} tracks)`).join(", ") : "None"}
    - Library Songs (Use the EXACT ID to play or set artwork):
    ${musicStoreRef.playlist.slice(0, 30).map((t: any) => `- Title: "${t.title}", Artist: "${t.artist}", Genre: "${t.genre}", ID: "${t.id}"`).join("\n    ")}`;

    const fullContext = `${goalContext}\n\n${musicContext}`;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      role: 'user',
      timestamp: Date.now(),
    };

    addChatMessage(userMessage);
    setInputText('');
    setIsLoading(true);
    Keyboard.dismiss();
    playChatSound('send');

    try {
      const response = await aiService.chat(
        userMessage.text,
        chatHistory.slice(-10),
        fullContext,
        i18n.language,
        customSystemPrompt
      );

      if (response && response.trim().length > 0) {
        let cleanResponse = response;

        // AI Model Actions:
        // 1. CREATE GOAL: Append this at the end if the user wants to add a new task:
        //    [ACTION:CREATE_GOAL:{"text": "Refined Goal Text", "category": "work|health|personal|finance|other"}]
        //    
        // 2. START TIMER: Append this if the user wants to start a timer for an EXISTING goal.
        //    - Format: [ACTION:START_TIMER:{"goalId": "EXACT_ID", "duration": seconds}]
        //    
        // 3. DECOMPOSE GOAL: Append this if the user wants to break down an EXISTING goal into subtasks.
        //    - Format: [ACTION:DECOMPOSE_GOAL:{"goalId": "EXACT_ID"}]
        //    - Use this when the user asks to "parçala", "dilimle", "plan çıkar" or "nasıl yaparım" for a specific task.
        // 
        // 4. DELETE GOAL: Append this if the user specifically asks to REMOVE or DELETE a goal.
        //    - Format: [ACTION:DELETE_GOAL:{"goalId": "EXACT_ID"}]
        //
        // 5. UPDATE GOAL: Append this if the user wants to EDIT or CHANGE an existing goal.
        //    - Format: [ACTION:UPDATE_GOAL:{"goalId": "EXACT_ID", "text": "New Text", "category": "category"}]
        // 
        // Debug: Raw Response Log (Llama formatını anlamak için)
        console.log("[AI RAW RESPONSE]:", response);

        // - Refine user input into professional text for goals.
        // Action Finder - hyper-robust version for [ACTION:TYPE:DATA], [ACTION:TYPE=DATA], [TYPE:DATA], [TYPE=DATA]
        const findAction = (type: string) => {
          const uResponse = response.toUpperCase();
          const uType = type.toUpperCase();

          // 1. Definte all possible prefixes AI might use
          const variations = [
            `[ACTION:${uType}:`,
            `[ACTION:${uType}=`,
            `[${uType}:`,
            `[${uType}=`,
            `[ACTION:${uType}]`, // Simple tags
            `[${uType}]`         // Simple tags
          ];

          for (const prefix of variations) {
            const startIndex = uResponse.indexOf(prefix);
            if (startIndex !== -1) {
              const lastBracket = response.indexOf(']', startIndex);
              if (lastBracket !== -1) {
                const fullMatch = response.substring(startIndex, lastBracket + 1);
                
                // If it's a simple tag without data (ends with ']')
                if (prefix.endsWith(']')) {
                   return { fullMatch, data: null, regex: { [Symbol.replace]: (str: string) => str.split(fullMatch).join('') } };
                }

                // If it's a tag with data (ends with ':' or '=')
                const dataPart = fullMatch.substring(prefix.length, fullMatch.length - 1).trim();
                
                console.log('[AI ACTION MATCHED]:', type, 'via prefix:', prefix, 'Data:', dataPart.substring(0, 30));

                return {
                  fullMatch,
                  data: dataPart,
                  regex: { [Symbol.replace]: (str: string) => str.split(fullMatch).join('') }
                };
              }
            }
          }
          return null;
        };

        // Helper to parse action JSON robustly (handles markdown artifacts and extra characters)
        const parseActionData = (jsonStr: string | null) => {
          if (!jsonStr) return null;

          let clean = jsonStr.replace(/```json|```|`|[\n\r]/g, '').trim();

          // Robust JSON repair: if it ends abruptly, try to close open braces/brackets
          const repairJson = (str: string) => {
            let openBraces = (str.match(/\{/g) || []).length;
            let closeBraces = (str.match(/\}/g) || []).length;
            let openBrackets = (str.match(/\[/g) || []).length;
            let closeBrackets = (str.match(/\]/g) || []).length;

            let repaired = str;

            // 1. Check for unclosed string quotes
            const quoteCount = (repaired.match(/"/g) || []).length;
            if (quoteCount % 2 !== 0) {
              repaired += '"'; // Close the hanging quote
            }

            // 2. Refresh counts after potential quote fix
            openBraces = (repaired.match(/\{/g) || []).length;
            closeBraces = (repaired.match(/\}/g) || []).length;
            openBrackets = (repaired.match(/\[/g) || []).length;
            closeBrackets = (repaired.match(/\]/g) || []).length;

            // 3. Close open brackets and braces
            while (openBrackets > closeBrackets) {
              repaired += ']';
              closeBrackets++;
            }
            while (openBraces > closeBraces) {
              repaired += '}';
              closeBraces++;
            }
            return repaired;
          };

          let lastError = null;
          // First try a direct repair if it looks cut off
          let currentAttempt = clean;

          for (let i = 0; i < 5; i++) {
            try {
              const attempt = i === 0 ? currentAttempt : repairJson(currentAttempt);
              const parsed = JSON.parse(attempt);
              return Array.isArray(parsed) ? parsed[0] : parsed;
            } catch (e) {
              lastError = e;
              // If it failed, try to find the last valid JSON ending and cut there
              const lastBrace = currentAttempt.lastIndexOf('}');
              const lastBracket = currentAttempt.lastIndexOf(']');
              const lastPossibleEnd = Math.max(lastBrace, lastBracket);

              if (lastPossibleEnd !== -1 && lastPossibleEnd < currentAttempt.length - 1) {
                currentAttempt = currentAttempt.substring(0, lastPossibleEnd + 1);
              } else {
                // if we can't find a natural end, loop will try to repair on next iteration
                // unless we already tried repairJson and it failed
                if (i > 0) break;
                // else let it proceed to repairJson in next loop
              }
            }
          }

          console.error("[AI CHAT] Robust Parse failed for:", jsonStr, "\nFinal attempt was:", currentAttempt, "\nError:", lastError);
          return null;
        };

        // Karanlık Mod (Dark Mode) Aksiyonu
        const darkMatch = findAction('SET_DARK_MODE');
        if (darkMatch) {
          try {
            const data = parseActionData(darkMatch.data);
            if (data && data.isDark !== undefined) {
              setIsDarkMode(data.isDark);
              cleanResponse = cleanResponse.replace(darkMatch.regex, '').trim();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          } catch (e) { console.error("Set Dark Mode Error:", e); }
        }

        // Tema (Theme) Aksiyonu
        const themeMatch = findAction('SET_APP_THEME');
        if (themeMatch) {
          try {
            const data = parseActionData(themeMatch.data);
            if (data && data.themeId) {
              setThemeId(data.themeId);
              cleanResponse = cleanResponse.replace(themeMatch.regex, '').trim();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          } catch (e) { console.error("Set Theme Error:", e); }
        }

        // Dil (Language) Aksiyonu
        const langMatch = findAction('SET_LANGUAGE');
        if (langMatch) {
          try {
            const data = parseActionData(langMatch.data);
            if (data && data.lang) {
              setLanguage(data.lang);
              cleanResponse = cleanResponse.replace(langMatch.regex, '').trim();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          } catch (e) { console.error("Set Language Error:", e); }
        }

        // Ses (Sounds) Aksiyonu
        const soundsMatch = findAction('SET_SOUNDS');
        if (soundsMatch) {
          try {
            const data = parseActionData(soundsMatch.data);
            if (data && data.enabled !== undefined) {
              setSoundsEnabled(data.enabled);
              cleanResponse = cleanResponse.replace(soundsMatch.regex, '').trim();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          } catch (e) { console.error("Set Sounds Error:", e); }
        }

        // Verileri Sıfırlama (Reset All Data) Aksiyonu
        if (response.includes('[ACTION:RESET_ALL_DATA]')) {
          cleanResponse = cleanResponse.replace('[ACTION:RESET_ALL_DATA]', '').trim();
          Alert.alert(
            t('settings.dangerZone.clearDataTitle') || "Reset All Data",
            t('settings.dangerZone.clearDataDescription') || "Are you sure you want to reset settings? This cannot be undone.",
            [
              { text: t('common.cancel'), style: 'cancel' },
              {
                text: t('common.delete'),
                style: 'destructive',
                onPress: async () => {
                  resetLanguage();
                  setIsDarkMode(true);
                  setThemeId('default');
                  clearChatMessages();
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  router.replace('/');
                }
              }
            ]
          );
        }

        // Arka Plan Efekti (Background Effect) Aksiyonu
        const effectMatch = findAction('SET_BACKGROUND_EFFECT');
        if (effectMatch) {
          try {
            const data = parseActionData(effectMatch.data);
            if (data && data.effect) {
              setBackgroundEffect(data.effect);
              cleanResponse = cleanResponse.replace(effectMatch.regex, '').trim();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          } catch (e) { console.error("Set Effect Error:", e); }
        }

        // Ortam Sesi (Ambient Sound) Aksiyonu
        const currentAmbientMatch = findAction('SET_AMBIENT');
        if (currentAmbientMatch) {
          try {
            const data = parseActionData(currentAmbientMatch.data);
            if (data && data.soundId) {
              setAmbientSound(data.soundId);
              cleanResponse = cleanResponse.replace(currentAmbientMatch.regex, '').trim();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          } catch (e) { console.error("Set Ambient Error:", e); }
        }

        // Özel Arka Plan (Custom Background) Aksiyonu
        const customBgMatch = findAction('SET_CUSTOM_BACKGROUND');
        if (customBgMatch) {
          try {
            const data = parseActionData(customBgMatch.data);
            if (data) {
              console.log("[AI ACTION] Setting Custom Background:", data);
              setCustomBackgroundConfig(data);
              cleanResponse = cleanResponse.replace(customBgMatch.regex, '').trim();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          } catch (e) { console.error("Set Custom Background Error:", e); }
        }

        // Veri Dışa Aktarma (Export Data) Aksiyonu
        if (response.includes('[ACTION:EXPORT_DATA]')) {
          try {
            const data = exportData();
            const jsonString = dataToJSON(data);
            const fileName = `focustabs-backup-${new Date().toISOString().split("T")[0]}.json`;
            const filePath = `${FileSystem.documentDirectory}${fileName}`;

            await FileSystem.writeAsStringAsync(filePath, jsonString);
            const canShare = await Sharing.isAvailableAsync();
            if (canShare) {
              await Sharing.shareAsync(filePath);
            }
            cleanResponse = cleanResponse.replace('[ACTION:EXPORT_DATA]', '').trim();
          } catch (e) { console.error("Export Error:", e); }
        }

        // Yedekleme Ayarları (Open Backup Settings) Aksiyonu
        if (response.includes('[ACTION:OPEN_BACKUP_SETTINGS]')) {
          cleanResponse = cleanResponse.replace('[ACTION:OPEN_BACKUP_SETTINGS]', '').trim();
          setTimeout(() => {
            router.push('/backup-settings');
          }, 5000);
        }

        // Genel Yönlendirme (Navigate) Aksiyonu
        const navigateMatch = findAction('NAVIGATE');
        if (navigateMatch) {
          try {
            const data = parseActionData(navigateMatch.data);
            if (data && data.route) {
              cleanResponse = cleanResponse.replace(navigateMatch.regex, '').trim();
              setTimeout(() => {
                router.push(data.route as any);
              }, 5000);
            }
          } catch (e) { console.error("Navigate Action Error:", e); }
        }

        // Tema Oluşturma (Create Theme) Aksiyonu
        const createThemeMatch = findAction('CREATE_THEME');
        if (createThemeMatch) {
          try {
            const data = parseActionData(createThemeMatch.data);
            if (data && (data.colors || data.darkColors || data.lightColors)) {
              const baseColors = data.colors || data.darkColors || data.lightColors;
              const newTheme = {
                id: `custom-${Date.now()}`,
                name: data.name || 'AI Magic',
                colors: {
                  ...baseColors,
                  secondary: baseColors.secondary || baseColors.primary // Safe fallback
                },
                lightColors: data.lightColors ? { ...data.lightColors, secondary: data.lightColors.secondary || data.lightColors.primary } : undefined,
                darkColors: data.darkColors ? { ...data.darkColors, secondary: data.darkColors.secondary || data.darkColors.primary } : undefined
              };
              addCustomTheme(newTheme as any);
              cleanResponse = cleanResponse.replace(createThemeMatch.regex, '').trim();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          } catch (e) { console.error("Create Theme Action Error:", e); }
        }

        // Uygulamayı Değerlendir (Rate App) Aksiyonu
        if (response.includes('[ACTION:RATE_APP]')) {
          cleanResponse = cleanResponse.replace('[ACTION:RATE_APP]', '').trim();
          const playStoreUrl = "https://play.google.com/store/apps/details?id=com.melihcandemir.focustabs";
          Linking.canOpenURL(playStoreUrl).then((supported) => {
            if (supported) Linking.openURL(playStoreUrl);
          });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        // Chat Geçmişini Sil (Clear Chat) Aksiyonu
        let clearChatActionTriggered = false;
        const clearChatMatch = findAction('CLEAR_CHAT');
        if (clearChatMatch) {
          cleanResponse = cleanResponse.replace(clearChatMatch.regex, '').trim();
          setClearChatAlertVisible(true);
          clearChatActionTriggered = true;
        }

        // Zen Mode Aksiyonu
        const zenMatch = findAction('SET_ZEN_MODE');
        if (zenMatch) {
          try {
            const data = parseActionData(zenMatch.data);
            if (data && data.enabled !== undefined) {
              setIsZenMode(data.enabled);
              cleanResponse = cleanResponse.replace(zenMatch.regex, '').trim();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          } catch (e) { console.error("Zen Mode Action Error:", e); }
        }

        // System Prompt Aksiyonu
        const promptMatch = findAction('SET_SYSTEM_PROMPT');
        if (promptMatch) {
          try {
            const data = parseActionData(promptMatch.data);
            if (data && data.prompt) {
              setCustomSystemPrompt(data.prompt);
              cleanResponse = cleanResponse.replace(promptMatch.regex, '').trim();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          } catch (e) { console.error("System Prompt Action Error:", e); }
        }

        // Music Player Actions handled below

        // --- MUSIC PLAYER ACTIONS ---

        // Play Music Action
        const playMusicMatch = findAction('PLAY_MUSIC');
        if (playMusicMatch) {
          try {
            const data = parseActionData(playMusicMatch.data);
            if (data) {
              // Prioritize trackId over genre
              if (data.trackId) {
                const cleanId = data.trackId.toString().trim();
                const track = playlist.find(t => t.id === cleanId || t.id.includes(cleanId));
                if (track) {
                  setCurrentTrack(track);
                  play();
                } else {
                  console.warn("[AI] Track not found by ID:", cleanId);
                }
              } else if (data.genre) {
                const track = playlist.find(t => t.genre?.toLowerCase() === data.genre.toLowerCase());
                if (track) {
                  setCurrentTrack(track);
                  play();
                }
              }
              cleanResponse = cleanResponse.replace(playMusicMatch.regex, '').trim();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          } catch (e) { console.error("Play Music Action Error:", e); }
        }

        // Pause Music Action
        const pauseMusicMatch = findAction('PAUSE_MUSIC');
        if (pauseMusicMatch) {
          pause();
          cleanResponse = cleanResponse.replace(pauseMusicMatch.regex, '').trim();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        // Next Track Action
        const nextTrackMatch = findAction('NEXT_TRACK');
        if (nextTrackMatch) {
          next();
          cleanResponse = cleanResponse.replace(nextTrackMatch.regex, '').trim();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        // Set Volume Action
        const volumeMatch = findAction('SET_VOLUME');
        if (volumeMatch) {
          try {
            const data = parseActionData(volumeMatch.data);
            if (data && data.level !== undefined) {
              const newVol = Math.max(0, Math.min(1, data.level));
              setVolume(newVol);
              cleanResponse = cleanResponse.replace(volumeMatch.regex, '').trim();
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          } catch (e) { console.error("Set Volume Action Error:", e); }
        }

        // Create Playlist Action
        const createPlaylistMatch = findAction('CREATE_PLAYLIST');
        if (createPlaylistMatch) {
          try {
            const data = parseActionData(createPlaylistMatch.data);
            if (data && data.name && data.trackIds) {
              createPlaylist(data.name, data.trackIds);
              cleanResponse = cleanResponse.replace(createPlaylistMatch.regex, '').trim();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          } catch (e) { console.error("Create Playlist Action Error:", e); }
        }

        // Delete Playlist Action
        const deletePlaylistMatch = findAction('DELETE_PLAYLIST');
        if (deletePlaylistMatch) {
          try {
            const data = parseActionData(deletePlaylistMatch.data);
            if (data && data.playlistId) {
              deletePlaylist(data.playlistId);
              cleanResponse = cleanResponse.replace(deletePlaylistMatch.regex, '').trim();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          } catch (e) { console.error("Delete Playlist Action Error:", e); }
        }

        // Update Playlist Action
        const updatePlaylistMatch = findAction('UPDATE_PLAYLIST');
        if (updatePlaylistMatch) {
          try {
            const data = parseActionData(updatePlaylistMatch.data);
            if (data && data.playlistId && data.name && data.trackIds) {
              updatePlaylist(data.playlistId, data.name, data.trackIds);
              cleanResponse = cleanResponse.replace(updatePlaylistMatch.regex, '').trim();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          } catch (e) { console.error("Update Playlist Action Error:", e); }
        }

        // Add Song Action (LLM Song Access)
        const addSongMatch = findAction('ADD_SONG');
        if (addSongMatch) {
          try {
            loadLocalMusic();
            cleanResponse = cleanResponse.replace(addSongMatch.regex, '').trim();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch (e) { console.error("Add Song Action Error:", e); }
        }

        // Set Track Lyrics Action
        const lyricsMatch = findAction('SET_TRACK_LYRICS');
        if (lyricsMatch) {
          try {
            const data = parseActionData(lyricsMatch.data);
            if (data && data.lyrics) {
              const trackId = data.trackId || (currentTrack?.id);
              if (trackId) {
                setTrackLyrics(trackId, data.lyrics);
                cleanResponse = cleanResponse.replace(lyricsMatch.regex, '').trim();
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                console.log("[AI] Lyrics saved for track identifier:", trackId);
              }
            }
          } catch (e) { console.error("Set Track Lyrics Action Error:", e); }
        }

        // Set Track Artwork Action
        const artworkMatch = findAction('SET_TRACK_ARTWORK');
        if (artworkMatch) {
          try {
            const data = parseActionData(artworkMatch.data);
            if (data && data.imageUrl) {
              const trackId = data.trackId || (currentTrack?.id);
              if (trackId) {
                const { pollinationsApiKey, localSdIp, imageProvider, localSdModel } = useAIStore.getState();
                
                // --- EĞER YEREL SD AYARLIYSA OTOMATİK YEREL ÜRETİM DENE ---
                if (imageProvider === 'local' && localSdIp) {
                  console.log("[LOCAL SD] Otomatik üretim başlatılıyor (AI Aksiyonu)...");
                  
                  // URL'den promptu geri ayıkla (eğer mümkünse) veya direkt imageUrl içindeki promptu kullan
                  // Pollinations URL: https://.../image/PROMPT?...
                  let promptToUse = data.imageUrl;
                  try {
                    const urlObj = new URL(data.imageUrl);
                    const pathParts = urlObj.pathname.split('/');
                    const potentialPrompt = pathParts[pathParts.length - 1];
                    if (potentialPrompt) {
                      promptToUse = decodeURIComponent(potentialPrompt);
                    }
                  } catch (e) {
                    console.log("[LOCAL SD] Prompt ayıklama başarısız, ham URL kullanılacak");
                  }

                  // Arka planda Yerel SD'ye istek at
                  const handleAutoLocalGenerate = async () => {
                    try {
                      const response = await fetch(`http://${localSdIp}:7860/sdapi/v1/txt2img`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            prompt: promptToUse,
                            steps: 25,
                            width: 512,
                            height: 512,
                            cfg_scale: 7.5,
                            sampler_name: "Euler a",
                            ...(localSdModel ? { override_settings: { sd_model_checkpoint: localSdModel } } : {})
                        })
                      });
                      const sdData = await response.json();
                      if (sdData.images && sdData.images.length > 0) {
                        const base64Image = `data:image/png;base64,${sdData.images[0]}`;
                        setTrackArtwork(trackId, base64Image);
                        console.log("[LOCAL SD] Otomatik kapak başarıyla yerel sunucudan çekildi!");
                      } else {
                        throw new Error("No images returned from local SD");
                      }
                    } catch (err) {
                      console.error("[LOCAL SD] Otomatik üretim hatası, Pollinations'a dönülüyor:", err);
                      // Fallback: Pollinations'a dön
                      let finalImageUrl = data.imageUrl;
                      if (pollinationsApiKey && finalImageUrl.includes('pollinations.ai') && !finalImageUrl.includes('key=')) {
                        const separator = finalImageUrl.includes('?') ? '&' : '?';
                        finalImageUrl = `${finalImageUrl}${separator}key=${pollinationsApiKey}`;
                      }
                      setTrackArtwork(trackId, finalImageUrl);
                    }
                  };

                  handleAutoLocalGenerate(); // Arka planda çalıştır
                } else {
                  // Yerel SD yoksa klasik Pollinations yolu
                  let finalImageUrl = data.imageUrl;
                  if (pollinationsApiKey && finalImageUrl.includes('pollinations.ai') && !finalImageUrl.includes('key=')) {
                    const separator = finalImageUrl.includes('?') ? '&' : '?';
                    finalImageUrl = `${finalImageUrl}${separator}key=${pollinationsApiKey}`;
                  }

                  setTrackArtwork(trackId, finalImageUrl);
                }

                cleanResponse = cleanResponse.replace(artworkMatch.regex, '').trim();
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
            }
          } catch (e) { console.error("Set Track Artwork Action Error:", e); }
        }

        // Music recommendation uses local library context directly


        if (!clearChatActionTriggered) {
          const aiMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            text: cleanResponse,
            role: 'model',
            timestamp: Date.now(),
          };
          addChatMessage(aiMessage);
          playChatSound('receive');
        }
      } else {
        // Boş yanıt gelirse hata mesajı göster (throw etmeden)
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: t('settings.ai.chat.error'),
          role: 'model',
          timestamp: Date.now(),
        };
        addChatMessage(errorMessage);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (error) {
      console.error("Chat Error:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: t('settings.ai.chat.error'),
        role: 'model',
        timestamp: Date.now(),
      };
      addChatMessage(errorMessage);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setClearChatAlertVisible(true);
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

  const handleDeleteMessage = (id: string) => {
    if (id === 'welcome') return;

    if (isSelectionMode) {
      toggleSelection(id);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSelectionMode(true);
    setSelectedIds([id]);
  };

  const confirmDeleteSelected = () => {
    if (selectedIds.length === 0) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDeleteMessageAlertVisible(true);
  };

  const handleCopySelected = async () => {
    if (selectedIds.length === 0) return;

    // Filtreleme yapıp sıralayarak metni birleştir (welcome mesajını hariç tut)
    const selectedMessages = displayMessages
      .filter(m => selectedIds.includes(m.id) && m.id !== 'welcome')
      .sort((a, b) => a.timestamp - b.timestamp);

    const combinedText = selectedMessages
      .map(m => `${m.role === 'user' ? '👤 ME' : '🤖 AI'}: ${m.text}`)
      .join('\n\n---\n\n');

    await Clipboard.setStringAsync(combinedText);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Seçimi temizle
    setIsSelectionMode(false);
    setSelectedIds([]);
  };

  const handleSelectAll = () => {
    const allIds = displayMessages
      .filter(m => m.id !== 'welcome')
      .map(m => m.id);

    if (selectedIds.length === allIds.length) {
      setSelectedIds([]);
      setIsSelectionMode(false);
    } else {
      setSelectedIds(allIds);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
          <TouchableOpacity
            onPress={() => toggleSelection(item.id)}
            style={styles.selectionCircle}
          >
            {isSelected ? (
              <CheckCircle2 size={22} color={colors.primary} fill={colors.primary + '20'} />
            ) : (
              <Circle size={22} color={colors.subText + '40'} />
            )}
          </TouchableOpacity>
        )}

        <View style={!isAi && { flexDirection: 'row-reverse', flex: 1, justifyContent: 'flex-start' }}>
          <View style={[
            styles.avatar,
            { backgroundColor: isAi ? colors.primary + '20' : colors.secondary + '20' }
          ]}>
            {isAi ? <Bot size={16} color={colors.primary} /> : <User size={16} color={colors.secondary} />}
          </View>
          <TouchableOpacity
            activeOpacity={0.9}
            onLongPress={() => handleDeleteMessage(item.id)}
            onPress={() => isSelectionMode ? toggleSelection(item.id) : null}
            style={[
              styles.messageBubble,
              {
                backgroundColor: isAi
                  ? (isDarkMode ? 'rgba(255,255,255,0.05)' : '#F0F0F0')
                  : colors.primary,
                borderBottomLeftRadius: isAi ? 4 : 20,
                borderBottomRightRadius: isAi ? 20 : 4,
                borderWidth: isSelected ? 1 : 0,
                borderColor: colors.primary + '60',
              },
              isSelectionMode && { maxWidth: '80%' }
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <BackgroundEffects />
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />
      <Animated.View
        style={[styles.flex, zenUIStyle]}
        pointerEvents={isZenMode ? 'none' : 'auto'}
      >
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
            style={[styles.header, {
              paddingTop: insets.top + 16,
              paddingBottom: 24,
              borderBottomWidth: isSelectionMode ? 1 : 0,
              borderBottomColor: colors.border,
            }]}
          >
            {/* Decorative background elements (Only in normal mode) */}
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
                    <TouchableOpacity onPress={confirmDeleteSelected} style={styles.selectionActionButton}>
                      <Trash2 size={20} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.headerTitleContainer}>
                    <View style={styles.iconBadge}>
                      <Sparkles size={20} color="#FFFFFF" />
                    </View>
                    <View>
                      <Text style={styles.headerTitle}>{t('settings.ai.chat.title')}</Text>
                      <Text style={styles.headerSubtitle}>{t('app.slogan')}</Text>
                    </View>
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

          {!(apiKey || groqApiKey || activeProvider === 'ollama') || !isAIEnabled ? (
            <View style={styles.emptyState}>
              <AlertCircle size={48} color={colors.warning} opacity={0.5} />
              <Text style={[styles.emptyStateText, { color: colors.subText }]}>
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
                  if (!showScrollToBottom) {
                    flatListRef.current?.scrollToEnd({ animated: true });
                  }
                }}
                onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                keyboardDismissMode="on-drag"
              />

              {showScrollToBottom && (
                <Animated.View
                  entering={FadeInDown.duration(200)}
                  exiting={FadeInDown.duration(200)}
                  style={styles.scrollToBottomContainer}
                >
                  <TouchableOpacity
                    onPress={scrollToBottom}
                    style={[styles.scrollToBottomButton, { backgroundColor: colors.card }]}
                  >
                    <ChevronDown size={20} color={colors.primary} />
                  </TouchableOpacity>
                </Animated.View>
              )}

              {isLoading && (
                <TypingIndicator colors={colors} isDarkMode={isDarkMode} />
              )}

              <View style={[styles.inputContainer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
                <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F0F0F0' }]}>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder={t('settings.ai.chat.placeholder')}
                    placeholderTextColor={colors.subText}
                    value={inputText}
                    onChangeText={setInputText}
                    multiline
                    maxLength={500}
                  />
                  <TouchableOpacity
                    onPress={handleSend}
                    disabled={!inputText.trim() || isLoading}
                    style={[
                      styles.sendButton,
                      { backgroundColor: inputText.trim() && !isLoading ? colors.primary : colors.subText + '30' }
                    ]}
                  >
                    <Send size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </KeyboardAvoidingView>
      </Animated.View>

      {isZenMode && (
        <>
          <TouchableOpacity
            activeOpacity={1}
            onPress={toggleZenMode}
            style={StyleSheet.absoluteFillObject}
          />
          <Animated.View
            entering={FadeIn.duration(800)}
            exiting={FadeOut.duration(500)}
            style={[styles.zenReturnContainer, { bottom: insets.bottom + 40 }]}
            pointerEvents="none"
          >
            <Text style={[styles.zenReturnText, { color: 'rgba(255, 255, 255, 0.4)' }]}>
              {i18n.language === 'tr' ? 'Dokun ve Geri Dön' : 'Tap to Return'}
            </Text>
          </Animated.View>
        </>
      )}

      <CustomAlert
        visible={clearChatAlertVisible}
        title={t('settings.ai.chat.clearHistoryTitle')}
        message={t('settings.ai.chat.clearHistoryDescription')}
        type="danger"
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        onConfirm={() => {
          clearChatMessages();
          setClearChatAlertVisible(false);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }}
        onCancel={() => setClearChatAlertVisible(false)}
      />

      <CustomAlert
        visible={deleteMessageAlertVisible}
        title={t('common.delete')}
        message={selectedIds.length > 1 ? t('settings.ai.chat.deleteMultipleConfirm', { count: selectedIds.length }) : t('settings.ai.chat.deleteMessageConfirm')}
        type="danger"
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        onConfirm={() => {
          deleteChatMessages(selectedIds);
          setIsSelectionMode(false);
          setSelectedIds([]);
          setDeleteMessageAlertVisible(false);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }}
        onCancel={() => {
          setDeleteMessageAlertVisible(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  headerDecorationCircle1: {
    position: 'absolute',
    top: -40,
    right: -20,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  headerDecorationCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  clearButton: {
    padding: 4,
  },
  clearButtonInner: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 20,
    paddingBottom: 10,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 20,
    maxWidth: '85%',
  },
  aiMessageWrapper: {
    alignSelf: 'flex-start',
  },
  userMessageWrapper: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    maxWidth: '100%',
  },
  selectionCircle: {
    paddingRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearSelectionButton: {
    marginRight: 16,
  },
  headerSelectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectionActionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  deleteSelectionButton: {
    padding: 8,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    paddingTop: 8,
    paddingBottom: 8,
    fontSize: 16,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    marginBottom: 2,
  },
  premiumTypingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginLeft: 20,
    marginBottom: 15,
    borderWidth: 1,
    gap: 12,
  },
  typingDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  premiumTypingText: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.8,
    letterSpacing: 0.5,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
  },
  scrollToBottomContainer: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    zIndex: 10,
  },
  scrollToBottomButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  zenReturnContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1001,
  },
  zenReturnText: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});

export default AIChatScreen;
