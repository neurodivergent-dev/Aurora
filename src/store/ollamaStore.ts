import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

interface OllamaState {
  // Cloud vs Local
  ollamaCloudMode: boolean;
  ollamaApiKey: string | null;

  // Local settings
  localIp: string;
  ollamaPort: string;

  // Shared
  ollamaModel: string;

  // Actions
  setOllamaCloudMode: (enabled: boolean) => void;
  setOllamaApiKey: (key: string | null) => Promise<void>;
  loadOllamaApiKey: () => Promise<void>;
  setLocalIp: (ip: string) => void;
  setOllamaPort: (port: string) => void;
  setOllamaModel: (model: string) => void;
}

const OLLAMA_API_KEY_STORAGE_KEY = 'ollama_api_key';

export const useOllamaStore = create<OllamaState>()(
  persist(
    (set) => ({
      ollamaCloudMode: false,
      ollamaApiKey: null,
      localIp: '192.168.1.203',
      ollamaPort: '11434',
      ollamaModel: 'gpt-oss:20b',

      setOllamaCloudMode: (enabled) => set({ ollamaCloudMode: enabled }),

      setOllamaApiKey: async (key) => {
        if (key) {
          await SecureStore.setItemAsync(OLLAMA_API_KEY_STORAGE_KEY, key);
          set({ ollamaApiKey: key });
        } else {
          await SecureStore.deleteItemAsync(OLLAMA_API_KEY_STORAGE_KEY);
          set({ ollamaApiKey: null });
        }
      },

      loadOllamaApiKey: async () => {
        try {
          const key = await SecureStore.getItemAsync(OLLAMA_API_KEY_STORAGE_KEY);
          if (key) {
            set({ ollamaApiKey: key });
          }
        } catch (e) {
          console.error('[OllamaStore] API key yüklenemedi:', e);
        }
      },

      setLocalIp: (ip) => set({ localIp: ip?.trim() || '192.168.1.203' }),
      setOllamaPort: (port) => set({ ollamaPort: port?.trim() || '11434' }),
      setOllamaModel: (model) => set({ ollamaModel: model?.trim() || 'gpt-oss:20b' }),
    }),
    {
      name: 'ollama-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        ollamaCloudMode: state.ollamaCloudMode,
        localIp: state.localIp,
        ollamaPort: state.ollamaPort,
        ollamaModel: state.ollamaModel,
      }),
    }
  )
);
