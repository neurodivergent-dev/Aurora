import { GoogleGenerativeAI } from "@google/generative-ai";
import { useAIStore } from "../store/aiStore";
import { groqService } from "./groqService";
import { ollamaService } from "./ollamaService";
import { AURORA_SYSTEM_PROMPT, OLLAMA_SYSTEM_PROMPT } from "../constants/auroraPrompts";

class AIService {
  private genAI: GoogleGenerativeAI | null = null;
  private lastRequestTime: number = 0;
  private readonly COOLDOWN_MS = 5000;

  private cache: Record<string, { msg: string, time: number }> = {};

  private init() {
    const { apiKey, isAIEnabled } = useAIStore.getState();
    if (apiKey && isAIEnabled) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    } else {
      this.genAI = null;
    }
  }

  private readonly MODEL_NAME = "gemini-2.5-flash";
  private readonly FALLBACK_MODEL = "gemini-1.5-flash";

  // Genel istek fonksiyonu (Hata yönetimi ve kota kontrolü ile)
  private async requestAI(prompt: string, cacheKey: string, forceRefresh = false, useFallback = false): Promise<string> {
    const { activeProvider, groqModel } = useAIStore.getState();
    const now = Date.now();

    // 1. Önbellek kontrolü
    if (!forceRefresh && this.cache[cacheKey] && (now - this.cache[cacheKey].time < 3600000)) {
      return this.cache[cacheKey].msg;
    }

    // 2. Cooldown kontrolü
    if (!forceRefresh && (now - this.lastRequestTime < this.COOLDOWN_MS)) {
      return this.cache[cacheKey]?.msg || "";
    }

    if (activeProvider === 'groq') {
      try {
        const systemMsg = "You are a helpful productivity assistant. Respond ONLY with the requested text. NEVER use JSON tool calls.";
        const text = await groqService.chat(prompt, [], systemMsg, groqModel);

        if (text) {
          this.cache[cacheKey] = { msg: text, time: now };
          this.lastRequestTime = now;
        }
        return text;
      } catch (e) {
        return "";
      }
    }

    // Default Gemini
    this.init();
    if (!this.genAI) return "";

    try {
      this.lastRequestTime = now;
      const model = this.genAI.getGenerativeModel({ model: useFallback ? this.FALLBACK_MODEL : this.MODEL_NAME });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim().replace(/^"|"$/g, '');

      this.cache[cacheKey] = { msg: text, time: now };
      return text;
    } catch (e) {
      if (e instanceof Error && e.message?.includes('429')) {
        if (!useFallback) return this.requestAI(prompt, cacheKey, forceRefresh, true);
      }
      return "";
    }
  }

  async chat(message: string, history: { role: string, parts: { text: string }[] }[], context: string = '', language: string = 'en', customPrompt?: string | null): Promise<string> {
    const { activeProvider, groqModel } = useAIStore.getState();
    const { userName } = require('../store/settingsStore').useSettingsStore.getState();

    try {
      const now = new Date();
      const isoDate = now.toISOString().split('T')[0];
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const dayName = now.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { weekday: 'long' });
      const localTime = now.toLocaleTimeString(language === 'tr' ? 'tr-TR' : 'en-US', { hour: '2-digit', minute: '2-digit' });

      const msgLower = message.toLowerCase();

      // Soft Routing for Fat Actions (Obez Aksiyonlar için Dinamik Yönlendirme)
      // Visuals [IMAGE:...] check to prevent accidental triggers
      const isGeneratingImage = /\[IMAGE:.*?\]/i.test(message);

      const allowThemeCreation = !isGeneratingImage && /tema (yap|oluştur|yarat|değiştir)|yeni tema|create theme|make theme|new theme|theme creator|tema oluştur|tema yap|tema değiştir|change theme|design theme|tema tasarla/.test(msgLower) && !/(kapak|artwork|resim)/.test(msgLower);
      const allowImageGeneration = /resim|çiz|fotoğraf|foto|image|picture|draw|kapak|cover|artwork/.test(msgLower) || isGeneratingImage;
      const allowMusicAddition = !isGeneratingImage && /müzik ekle|şarkı ekle|yükle|hafızadan|import|add music|add song|ekle/.test(msgLower);

      // Ollama için kısa prompt, diğerleri için tam prompt
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

      if (activeProvider === 'ollama') {
        const ollamaHistory = [
          {
            role: 'system' as const, content: `PROMPT RULE (CRITICAL):
For [IMAGE:description] tags, ALWAYS use ENGLISH keywords ONLY. Add artistic technical terms like "8k, cinematic, ultra realistic, masterpiece".
Even if the user speaks Turkish, the description inside [IMAGE:] MUST be in ENGLISH.
IMPORTANT: When you create an image with [IMAGE:description], you MUST also add the command to apply it to the cover!
Format: (AURORA_COMMAND:SET_TRACK_ARTWORK:{"imageUrl": "IMAGE_TAG"})  <-- Use "IMAGE_TAG" as the value.

COMMANDS (USE THESE EXACTLY):
- SET_VOLUME: (AURORA_COMMAND:SET_VOLUME:{"level": 0.0-1.0}) -> USE THIS for volume requests!
- TOGGLE_FAVORITE: (AURORA_COMMAND:TOGGLE_FAVORITE:{"trackId": "ID"}) -> Adds/Removes song from favorites.
- TOGGLE_SHUFFLE: (AURORA_COMMAND:TOGGLE_SHUFFLE) -> Toggles shuffle mode.
- TOGGLE_REPEAT: (AURORA_COMMAND:TOGGLE_REPEAT) -> Toggles repeat mode.
- NEXT_TRACK: (AURORA_COMMAND:NEXT_TRACK)
- PREV_TRACK: (AURORA_COMMAND:PREV_TRACK)
- CREATE_PLAYLIST: (AURORA_COMMAND:CREATE_PLAYLIST:{"name": "Playlist Name", "trackIds": ["ID1", "ID2"]})
- UPDATE_PLAYLIST: (AURORA_COMMAND:UPDATE_PLAYLIST:{"playlistId": "ID", "name": "New Name", "trackIds": ["ID1"]})
- DELETE_PLAYLIST: (AURORA_COMMAND:DELETE_PLAYLIST:{"playlistId": "ID"})
- PLAY_MUSIC: (AURORA_COMMAND:PLAY_MUSIC:{"trackId": "..."})
- PAUSE_MUSIC: (AURORA_COMMAND:PAUSE_MUSIC)
- SET_BACKGROUND_EFFECT: (AURORA_COMMAND:SET_BACKGROUND_EFFECT:{"effect": "..."})

Example: [IMAGE:cyberpunk city, neon lights, 8k, cinematic] (AURORA_COMMAND:SET_TRACK_ARTWORK:{"imageUrl": "IMAGE_TAG"})

${systemInstruction}`
          },
          ...history.map(h => ({
            role: (h.role === 'model' ? 'assistant' : 'user') as 'user' | 'assistant',
            content: h.parts[0].text
          })),
          { role: 'user' as const, content: message }
        ];

        let content = await ollamaService.chat(ollamaHistory);

        // If image was requested, suppress unintended music/theme triggers
        if (isGeneratingImage) {
          content = content.replace(/\(AURORA_COMMAND:(PLAY_MUSIC|PAUSE_MUSIC|SET_APP_THEME|SET_DARK_MODE):.*?\)/gi, '').trim();
        }

        return content;
      }

      if (activeProvider === 'groq') {
        const groqHistory = history.map(h => ({
          role: h.role === 'model' ? 'assistant' : 'user',
          content: h.parts[0].text
        }));
        const groqSystemMsg = `PROMPT RULE: For [IMAGE:...] tags, ALWAYS use ENGLISH keywords only (8k, cinematic, etc). 
        You MUST also add: (AURORA_COMMAND:SET_TRACK_ARTWORK:{"imageUrl": "IMAGE_TAG"}) after the tag.
        
${systemInstruction}`;

        let content = await groqService.chat(message, groqHistory, groqSystemMsg, groqModel);

        if (isGeneratingImage) {
          content = content.replace(/\(AURORA_COMMAND:(PLAY_MUSIC|PAUSE_MUSIC|SET_APP_THEME|SET_DARK_MODE):.*?\)/gi, '').trim();
        }
        return content;
      } else {
        this.init();
        if (!this.genAI) return "";

        const geminiSystemPrompt = `${systemInstruction}
        
PROMPT RULE (CRITICAL):
For [IMAGE:description] tags, ALWAYS use ENGLISH keywords ONLY. Add artistic technical terms like "8k, cinematic, ultra realistic, masterpiece".
Even if the user speaks Turkish, the description inside [IMAGE:] MUST be in ENGLISH.
IMPORTANT: When you create an image with [IMAGE:description], you MUST also add the command to apply it to the cover!
Format: (AURORA_COMMAND:SET_TRACK_ARTWORK:{"imageUrl": "IMAGE_TAG"})  <-- Use "IMAGE_TAG" as the value.

Example: [IMAGE:cyberpunk city, neon lights, 8k, cinematic] (AURORA_COMMAND:SET_TRACK_ARTWORK:{"imageUrl": "IMAGE_TAG"})`;

        const model = this.genAI.getGenerativeModel({ model: this.MODEL_NAME, systemInstruction: geminiSystemPrompt });
        const chat = model.startChat({ history });
        const result = await chat.sendMessage(message);
        let text = (await result.response).text().trim();

        // If image was requested, suppress unintended triggers
        if (isGeneratingImage) {
          text = text.replace(/\(AURORA_COMMAND:(PLAY_MUSIC|PAUSE_MUSIC|SET_APP_THEME|SET_DARK_MODE):.*?\)/gi, '').trim();
        }

        return text;
      }
    } catch (e) {
      return "";
    }
  }
}

export const aiService = new AIService();
