import { IAIProvider, ChatHistoryItem } from './IAIProvider';
import { ollamaService } from '../ollamaService';
import {
  IMAGE_GENERATION_RULES,
  OLLAMA_COMMAND_LIST
} from '../../constants/auroraPrompts';

export class OllamaAdapter implements IAIProvider {
  async chat(
    message: string,
    history: ChatHistoryItem[],
    systemInstruction: string,
    isGeneratingImage: boolean
  ): Promise<string> {
    // Ollama needs a very explicit system prompt
    const fullSystemContent = `${IMAGE_GENERATION_RULES}\n\n${OLLAMA_COMMAND_LIST}\n\n${systemInstruction}`;

    const ollamaHistory: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: 'system',
        content: fullSystemContent
      },
      ...history.map((h) => ({
        role: h.role === 'model' ? 'assistant' : 'user' as 'user' | 'assistant',
        content: h.parts[0]?.text || ''
      })),
      { role: 'user', content: message }
    ];

    // Delegate to the actual Ollama Service
    let content = await ollamaService.chat(ollamaHistory);

    // If image generation was requested, suppress unintended music/theme triggers
    if (isGeneratingImage) {
      content = content
        .replace(/\(AURORA_COMMAND:(PLAY_MUSIC|PAUSE_MUSIC|SET_APP_THEME|SET_DARK_MODE):.*?\)/gi, '')
        .trim();
    }

    return content;
  }
}
