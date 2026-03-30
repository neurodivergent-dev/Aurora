import { useAIStore } from "../store/aiStore";
import { useSettingsStore } from "../store/settingsStore";
import { AURORA_SYSTEM_PROMPT, OLLAMA_SYSTEM_PROMPT } from "../constants/auroraPrompts";
import logger from "../utils/logger";

// Providers
import { IAIProvider, ChatHistoryItem } from "./providers/IAIProvider";
import { GeminiProvider } from "./providers/GeminiProvider";
import { GroqAdapter } from "./providers/GroqAdapter";
import { OllamaAdapter } from "./providers/OllamaAdapter";

class AIService {
  private providers: Record<string, IAIProvider>;

  constructor() {
    this.providers = {
      gemini: new GeminiProvider(),
      groq: new GroqAdapter(),
      ollama: new OllamaAdapter()
    };
  }

  async chat(
    message: string,
    history: ChatHistoryItem[],
    context: string = '',
    language: string = 'en',
    customPrompt?: string | null
  ): Promise<string> {
    const { activeProvider } = useAIStore.getState();
    const { userName } = useSettingsStore.getState();

    try {
      const now = new Date();
      const isoDate = now.toISOString().split('T')[0];
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const dayName = now.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { weekday: 'long' });
      const localTime = now.toLocaleTimeString(language === 'tr' ? 'tr-TR' : 'en-US', { hour: '2-digit', minute: '2-digit' });

      const msgLower = message.toLowerCase();

      // Soft Routing for Fat Actions (Obez Aksiyonlar için Dinamik Yönlendirme)
      const isGeneratingImage = /\[IMAGE:.*?\]/i.test(message);

      const allowThemeCreation = !isGeneratingImage && /tema (yap|oluştur|yarat|değiştir)|yeni tema|create theme|make theme|new theme|theme creator|tema oluştur|tema yap|tema değiştir|change theme|design theme|tema tasarla/.test(msgLower) && !/(kapak|artwork|resim)/.test(msgLower);
      const allowImageGeneration = /resim|çiz|fotoğraf|foto|image|picture|draw|kapak|cover|artwork/.test(msgLower) || isGeneratingImage;
      const allowMusicAddition = !isGeneratingImage && /müzik ekle|şarkı ekle|yükle|hafızadan|import|add music|add song|ekle/.test(msgLower);

      // Select system instruction base based on whether it is Ollama (different command formatting)
      const systemInstruction = activeProvider === 'ollama'
        ? OLLAMA_SYSTEM_PROMPT({
          language,
          customPrompt,
          context,
          isoDate,
          dayName,
          localTime,
          timeZone,
          userName,
          allowThemeCreation,
          allowImageGeneration,
          allowMusicAddition
        })
        : AURORA_SYSTEM_PROMPT({
          language,
          customPrompt,
          context,
          isoDate,
          dayName,
          localTime,
          timeZone,
          userName,
          allowThemeCreation,
          allowImageGeneration,
          allowMusicAddition
        });

      // Strategy Pattern Logic - execute the targeted adapter
      const provider = this.providers[activeProvider] || this.providers['gemini'];

      const response = await provider.chat(
        message,
        history,
        systemInstruction,
        isGeneratingImage
      );

      return response;

    } catch (e) {
      logger.error(`AIService.chat error: ${e}`, 'AIService');
      throw e;
    }
  }
}

export const aiService = new AIService();
