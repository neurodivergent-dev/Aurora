import { IAIProvider, ChatHistoryItem } from './IAIProvider';
import { useAIStore } from '../../store/aiStore';
import { groqService } from '../groqService';
import { IMAGE_GENERATION_RULES } from '../../constants/auroraPrompts';

export class GroqAdapter implements IAIProvider {
  async chat(
    message: string,
    history: ChatHistoryItem[],
    systemInstruction: string,
    isGeneratingImage: boolean
  ): Promise<string> {
    const { groqModel } = useAIStore.getState();

    // Map history to Groq format
    const groqHistory = history.map((h) => ({
      role: h.role === 'model' ? 'assistant' : 'user',
      content: h.parts[0]?.text || ''
    }));

    // Combine system message
    const groqSystemMsg = `${IMAGE_GENERATION_RULES}\n\n${systemInstruction}`;

    // Delegate to existing service
    let content = await groqService.chat(
      message,
      groqHistory,
      groqSystemMsg,
      groqModel
    );

    // Apply regex cleanup if generating image to avoid accidental triggers
    if (isGeneratingImage) {
      content = content
        .replace(/\(AURORA_COMMAND:(PLAY_MUSIC|PAUSE_MUSIC|SET_APP_THEME|SET_DARK_MODE):.*?\)/gi, '')
        .trim();
    }

    return content;
  }
}
