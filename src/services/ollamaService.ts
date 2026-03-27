import { useOllamaStore } from '../store/ollamaStore';

const OLLAMA_CLOUD_HOST = 'https://ollama.com';

interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class OllamaService {
  /**
   * Ollama Chat — Cloud veya Local moda göre otomatik yönlendirir.
   * API formatı her iki modda da aynıdır: { model, messages, stream, options }
   */
  async chat(
    messages: OllamaMessage[],
    model?: string,
    options?: { temperature?: number; num_predict?: number }
  ): Promise<string> {
    const {
      ollamaCloudMode,
      ollamaApiKey,
      localIp,
      ollamaPort,
      ollamaModel,
    } = useOllamaStore.getState();

    const finalModel = model || ollamaModel;
    const finalOptions = options || { temperature: 0.7, num_predict: 1000 };

    // URL ve Header belirleme
    let url: string;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (ollamaCloudMode) {
      // Cloud Mode: https://ollama.com/api/chat + Bearer token
      if (!ollamaApiKey) {
        console.error('[OLLAMA CLOUD] API key eksik!');
        return 'Ollama Cloud API anahtarı eksik. Lütfen ayarlardan girin.';
      }
      url = `${OLLAMA_CLOUD_HOST}/api/chat`;
      headers['Authorization'] = `Bearer ${ollamaApiKey}`;
      console.log(`[OLLAMA CLOUD] İstek: ${url} | Model: ${finalModel}`);
    } else {
      // Local Mode: http://<ip>:<port>/api/chat
      const ip = localIp?.trim();
      const port = (ollamaPort?.trim() || '11434');

      if (!ip) {
        console.error('[OLLAMA LOCAL] IP adresi eksik!');
        return 'Yerel IP adresi eksik. Lütfen ayarlardan kontrol edin.';
      }

      url = `http://${ip}:${port}/api/chat`;
      console.log(`[OLLAMA LOCAL] İstek: ${url} | Model: ${finalModel}`);
    }

    const body = JSON.stringify({
      model: finalModel,
      messages,
      stream: false,
      options: finalOptions,
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.error(`[OLLAMA] API Hatası ${response.status}:`, errorText);
        throw new Error(`Ollama API Hatası: ${response.status}`);
      }

      const data = await response.json();
      const content = data.message?.content?.trim() || '';

      console.log(`[OLLAMA] Yanıt alındı (${content.length} karakter)`);
      return content;
    } catch (e) {
      console.error('[OLLAMA FATAL]:', e);

      if (ollamaCloudMode) {
        return `Ollama Cloud hatası: ${e instanceof Error ? e.message : 'Bilinmeyen hata'}. API anahtarınızı ve internet bağlantınızı kontrol edin.`;
      }
      return `Yerel Ollama hatası: ${e instanceof Error ? e.message : 'Bilinmeyen hata'}. Ollama'nın çalıştığından (ollama serve) ve OLLAMA_HOST=0.0.0.0 ayarının yapıldığından emin olun.`;
    }
  }
}

export const ollamaService = new OllamaService();
