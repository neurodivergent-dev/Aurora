import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import logger from '../utils/logger';
import { STORAGE_KEYS } from '../constants/storageKeys';

export interface ChatMessage {
  id: string;
  text: string;
  role: 'user' | 'model';
  timestamp: number;
}

interface AIState {
  apiKey: string | null;
  groqApiKey: string | null;
  activeProvider: 'gemini' | 'groq' | 'ollama';
  groqModel: string;
  isAIEnabled: boolean;
  chatMessages: ChatMessage[];
  customSystemPrompt: string | null;
  pollinationsApiKey: string | null;
  chatSoundsEnabled: boolean;
  chatSoundType: 'pop' | 'digital' | 'minimal';
  imageProvider: 'pollinations' | 'local';
  localSdModel: string;
  setImageProvider: (provider: 'pollinations' | 'local') => void;
  setLocalSdModel: (model: string) => void;
  localSdIp: string | null;
  setLocalSdIp: (ip: string | null) => void;
  localSdPort: string;
  setLocalSdPort: (port: string) => void;

  setApiKey: (key: string | null) => Promise<void>;
  setGroqKey: (key: string | null) => Promise<void>;
  setPollinationsApiKey: (key: string | null) => Promise<void>;
  setActiveProvider: (provider: 'gemini' | 'groq' | 'ollama') => void;
  setGroqModel: (model: string) => void;
  loadApiKey: () => Promise<void>;
  toggleAI: (enabled: boolean) => Promise<void>;
  addChatMessage: (message: ChatMessage) => void;
  clearChatMessages: () => void;
  deleteChatMessage: (id: string) => void;
  deleteChatMessages: (ids: string[]) => void;
  setCustomSystemPrompt: (prompt: string | null) => void;
  setChatSoundsEnabled: (enabled: boolean) => void;
  setChatSoundType: (type: 'pop' | 'digital' | 'minimal') => void;
}


export const useAIStore = create<AIState>()(
  persist(
    (set) => ({
      apiKey: null,
      groqApiKey: null,
      activeProvider: 'gemini',
      groqModel: 'llama-3.1-8b-instant',
      imageProvider: 'pollinations',
      isAIEnabled: false,
      chatMessages: [],
      customSystemPrompt: null,
      pollinationsApiKey: null,
      chatSoundsEnabled: true,
      chatSoundType: 'pop',
      localSdIp: '192.168.1.203',
      localSdPort: '7860',
      localSdModel: 'jaggernautxl.safetensors',


      setImageProvider: (provider) => set({ imageProvider: provider }),
      setLocalSdModel: (model) => set({ localSdModel: model }),
      setLocalSdIp: (ip) => set({ localSdIp: ip }),
      setLocalSdPort: (port) => set({ localSdPort: port }),


      setApiKey: async (key: string | null) => {
        if (key) {
          await SecureStore.setItemAsync(STORAGE_KEYS.GEMINI_API_KEY, key);
          await SecureStore.setItemAsync(STORAGE_KEYS.AI_ENABLED_STATUS, 'true');
          set({ apiKey: key, isAIEnabled: true });
        } else {
          await SecureStore.deleteItemAsync(STORAGE_KEYS.GEMINI_API_KEY);
          await SecureStore.setItemAsync(STORAGE_KEYS.AI_ENABLED_STATUS, 'false');
          set({ apiKey: null, isAIEnabled: false });
        }
      },

      setGroqKey: async (key: string | null) => {
        if (key) {
          await SecureStore.setItemAsync(STORAGE_KEYS.GROQ_API_KEY, key);
          set({ groqApiKey: key });
        } else {
          await SecureStore.deleteItemAsync(STORAGE_KEYS.GROQ_API_KEY);
          set({ groqApiKey: null });
        }
      },

      setPollinationsApiKey: async (key: string | null) => {
        if (key) {
          await SecureStore.setItemAsync(STORAGE_KEYS.POLLINATIONS_API_KEY, key);
          set({ pollinationsApiKey: key });
        } else {
          await SecureStore.deleteItemAsync(STORAGE_KEYS.POLLINATIONS_API_KEY);
          set({ pollinationsApiKey: null });
        }
      },

      setActiveProvider: (provider: 'gemini' | 'groq' | 'ollama') => set({ activeProvider: provider }),
      setGroqModel: (model: string) => set({ groqModel: model }),

      loadApiKey: async () => {
        try {
          const key = await SecureStore.getItemAsync(STORAGE_KEYS.GEMINI_API_KEY);
          const gKey = await SecureStore.getItemAsync(STORAGE_KEYS.GROQ_API_KEY);
          const pKey = await SecureStore.getItemAsync(STORAGE_KEYS.POLLINATIONS_API_KEY);
          const enabledStatus = await SecureStore.getItemAsync(STORAGE_KEYS.AI_ENABLED_STATUS);

          set((state) => {
            const hasProvider = key || gKey || state.activeProvider === 'ollama';
            const isEnabled = hasProvider ? (enabledStatus === null ? true : enabledStatus === 'true') : false;
            return { apiKey: key, groqApiKey: gKey, pollinationsApiKey: pKey, isAIEnabled: isEnabled };
          });
        } catch (e) {
          logger.error(`AI ayarları yüklenemedi: ${e}`, 'AIStore');
        }
      },

      toggleAI: async (enabled: boolean) => {
        await SecureStore.setItemAsync(STORAGE_KEYS.AI_ENABLED_STATUS, enabled ? 'true' : 'false');
        set({ isAIEnabled: enabled });
      },

      addChatMessage: (message: ChatMessage) => {
        set((state) => ({
          chatMessages: [...state.chatMessages, message].slice(-50), // Son 50 mesajı tut
        }));
      },

      clearChatMessages: () => {
        set({ chatMessages: [] });
      },

      deleteChatMessage: (id: string) => {
        set((state) => ({
          chatMessages: state.chatMessages.filter((msg) => msg.id !== id),
        }));
      },

      deleteChatMessages: (ids: string[]) => {
        set((state) => ({
          chatMessages: state.chatMessages.filter((msg) => !ids.includes(msg.id)),
        }));
      },

      setCustomSystemPrompt: (prompt: string | null) => {
        set({ customSystemPrompt: prompt });
      },
      setChatSoundsEnabled: (enabled: boolean) => set({ chatSoundsEnabled: enabled }),
      setChatSoundType: (type: 'pop' | 'digital' | 'minimal') => set({ chatSoundType: type }),
    }),
    {
      name: STORAGE_KEYS.AI_STORE,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isAIEnabled: state.isAIEnabled,
        activeProvider: state.activeProvider,
        groqModel: state.groqModel,
        imageProvider: state.imageProvider,
        localSdModel: state.localSdModel,
        chatMessages: state.chatMessages,
        customSystemPrompt: state.customSystemPrompt,
        chatSoundsEnabled: state.chatSoundsEnabled,
        chatSoundType: state.chatSoundType,
        localSdIp: state.localSdIp,
        localSdPort: state.localSdPort,
      }),
    }
  )
);
