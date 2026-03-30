import { GoogleGenerativeAI } from '@google/generative-ai';
import { useAIStore } from '../../store/aiStore';
import logger from '../../utils/logger';
import { IAIProvider, ChatHistoryItem } from './IAIProvider';
import { IMAGE_GENERATION_RULES } from '../../constants/auroraPrompts';

export class GeminiProvider implements IAIProvider {
  private genAI: GoogleGenerativeAI | null = null;
  private readonly MODEL_NAME = 'gemini-2.5-flash';

  private init() {
    const { apiKey, isAIEnabled } = useAIStore.getState();
    if (apiKey && isAIEnabled) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    } else {
      this.genAI = null;
    }
  }

  async chat(
    message: string,
    history: ChatHistoryItem[],
    systemInstruction: string,
    isGeneratingImage: boolean
  ): Promise<string> {
    this.init();
    
    if (!this.genAI) {
      logger.warn('Gemini API key is missing or AI is disabled', 'GeminiProvider');
      throw new Error('Gemini API key is not configured or AI is disabled');
    }

    try {
      const geminiSystemPrompt = `${systemInstruction}\n\n${IMAGE_GENERATION_RULES}`;

      const model = this.genAI.getGenerativeModel({
        model: this.MODEL_NAME,
        systemInstruction: geminiSystemPrompt,
      });

      const chat = model.startChat({ history });
      const result = await chat.sendMessage(message);
      let text = (await result.response).text().trim();

      // If image was requested, suppress unintended triggers
      if (isGeneratingImage) {
        text = text
          .replace(/\(AURORA_COMMAND:(PLAY_MUSIC|PAUSE_MUSIC|SET_APP_THEME|SET_DARK_MODE):.*?\)/gi, '')
          .trim();
      }

      return text;
    } catch (e) {
      logger.error(`Gemini Chat Error: ${e}`, 'GeminiProvider');
      throw e;
    }
  }
}
