import { GoogleGenerativeAI } from "@google/generative-ai";
import { useAIStore } from "../store/aiStore";
import { groqService } from "./groqService";
import { AURORA_SYSTEM_PROMPT } from "../constants/auroraPrompts";

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
        console.log(`[AI SERVICE] Groq'a istek gönderiliyor (${groqModel})...`);
        const text = await groqService.chat(prompt, [], "You are a helpful productivity assistant. Respond ONLY with the requested text, no chatter.", groqModel);

        if (text) {
          this.cache[cacheKey] = { msg: text, time: now };
          this.lastRequestTime = now;
        }
        return text;
      } catch (e) {
        console.error("Groq Request Error:", e);
        return "";
      }
    }

    // Default Gemini
    this.init();
    if (!this.genAI) return "";

    try {
      console.log(`[AI SERVICE] Gemini'ye istek gönderiliyor (${useFallback ? this.FALLBACK_MODEL : this.MODEL_NAME})...`);
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
      const allowThemeCreation = /tema (yap|oluştur|yarat)|yeni tema|create theme|make theme|new theme/.test(msgLower);
      const allowImageGeneration = /resim|çiz|fotoğraf|foto|image|picture|draw|kapak|cover|artwork/.test(msgLower);
      const allowMusicAddition = /müzik ekle|şarkı ekle|yükle|hafızadan|import|add music|add song|ekle/.test(msgLower);

      const systemInstruction = AURORA_SYSTEM_PROMPT({
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
        const { localSdIp, ollamaModel } = useAIStore.getState();
        if (!localSdIp) return "Yerel IP (localSdIp) eksik. Lütfen ayarlardan kontrol edin.";

        const ollamaHistory = [
          { role: 'system', content: systemInstruction },
          ...history.map(h => ({
            role: h.role === 'model' ? 'assistant' : 'user',
            content: h.parts[0].text
          })),
          { role: 'user', content: message }
        ];

        try {
          console.log(`[OLLAMA] İstek gönderiliyor: ${ollamaModel} @ ${localSdIp}`);
          const response = await fetch(`http://${localSdIp}:11434/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: ollamaModel,
              messages: ollamaHistory,
              stream: false,
              options: { temperature: 0.7, num_predict: 1000 }
            })
          });

          if (!response.ok) throw new Error(`Ollama API Hatası: ${response.status}`);

          const data = await response.json();
          return data.message.content;
        } catch (e) {
          console.error("Ollama Chat Error:", e);
          return "Yerel modele (Ollama) bağlanılamadı. Lütfen Ollama'nın (ollama serve) çalıştığından ve Windows'ta OLLAMA_HOST=0.0.0.0 ayarının yapıldığından emin olun.";
        }
      }

      if (activeProvider === 'groq') {
        const groqHistory = history.map(h => ({
          role: h.role === 'model' ? 'assistant' : 'user',
          content: h.parts[0].text
        }));
        return groqService.chat(message, groqHistory, systemInstruction, groqModel);
      } else {
        this.init();
        if (!this.genAI) return "";
        const model = this.genAI.getGenerativeModel({ model: this.MODEL_NAME, systemInstruction });
        const chat = model.startChat({ history });
        const result = await chat.sendMessage(message);
        return (await result.response).text().trim();
      }
    } catch (e) {
      console.error("AI Chat Error:", e);
      return "";
    }
  }
}

export const aiService = new AIService();
