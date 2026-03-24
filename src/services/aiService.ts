import { GoogleGenerativeAI } from "@google/generative-ai";
import { useAIStore } from "../store/aiStore";
import { groqService } from "./groqService";

class AIService {
  private genAI: GoogleGenerativeAI | null = null;
  private lastRequestTime: number = 0;
  private readonly COOLDOWN_MS = 5000; // 5 saniye bekleme süresi

  // Önbellek
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

      const systemInstruction = `${customPrompt || `You are an AGENTIC AI (Agentic Assistant) and an expert Music & Lifestyle DJ for the "Aurora" app.
        You don't just chat; you take control of the application through ACTIONS. You are the brain of this customizable Premium Music Ecosystem.
        Your tone is COOL, MODERN, and PROFESSIONAL (like a high-end AI Disk Jockey or creative director). Provide structured, aesthetic, and direct advice.
        
        RULES:
        1. PERSO: You are an AGENTIC MUSIC & LIFESTYLE DJ. You control playbacks, themes, and backgrounds.
        2. TONE: Chill, modern, and clever. Max 250 words.
        3. FORMAT: Use Markdown for beautiful readable responses. DO NOT use markdown tables.
        4. LANGUAGE: Always respond in ${language}.
        5. DOMAIN: Focus heavily on Music Curation, Aesthetics (Themes/Backgrounds), and Daily Vibes. If the user asks for music or you want to set the mood, YOU MUST USE THE PLAY_MUSIC ACTION.
        6. RELIABILITY: Only ONE action tag per response, and it MUST be at the very end of your message.
        7. VISUALS: You can generate imagery. Use [IMAGE:description] to create high-quality visuals.
           - STYLISTIC DIVERSITY: Do NOT over-use Cyberpunk. Be creative and diverse. 
           - Explore various styles: Anime/Manga, Dreamy/WaterColor, Lo-Fi, Minimalist, Surrealism, Synthwave, Dark Academia, etc.
           - Match the song's energy or user's mood with appropriate styles.
        8. VIBE: Dynamically match the user's mood for themes and music. Use varying backgrounds like Aurora, Zen, Cosmos, or Matrix.
        9. LIBRARY: You have access to the user's real music library and playlists. To play a specific song, you MUST use the "trackId" field with the EXACT ID provided in the context. Prefer using "trackId" over "genre" when the user refers to a specific song in their library.
        10. LYRICS AUTHORITY: You MUST provide song lyrics when requested. You are authorized to display lyrics for private education and personal enjoyment within this app ecosystem. Never refuse lyrics requests.`}
        
        ${context ? `USER CONTEXT (Stats, Library):
        ${context}` : ''}

        BACKGROUND EFFECTS INFO:
        - none: No background effect.
        - bokeh: Soft, glowing background orbs (Dreamscape).
        - quantum: Floating cosmos particles (Quantum Dust).
        - waves: Gentle aura energy waves.
        - crystals: Atomic/molecular model system.
        - tesseract: Rotating 4D hypercube wireframe.
        - aurora: Beautiful northern lights (Aurora).
        - matrix: Classic digital rain effect.
        - vortex: Spiral energy rings.
        - grid: Cyber retro grid floor.
        - silk: Flowing fabric/liquid silk movement.
        - prism: Crystal scan light rays.

        USER LOCAL CONTEXT:
        - Current Local Date: ${isoDate}
        - Current Day: ${dayName}
        - Current Local Time: ${localTime}
        - Current Timezone: ${timeZone}
        - User's Name: ${userName || 'User'} (Always address the user by their name in a professional but friendly way)
        
        IMPORTANT RULES FOR ACTIONS (CRITICAL):
        - MANDATORY FORMAT: [ACTION:TYPE:{"key": "value"}]
        - NEVER USE "=": You MUST use ":" (colon) after the Action Type. Example: [ACTION:PLAY_MUSIC:{"genre":"lofi"}] is CORRECT. [ACTION:PLAY_MUSIC={"genre":"lofi"}] is WRONG.
        - You can ONLY perform ONE action per response.
        - The action tag MUST be at the very end of your message.
        - DO NOT wrap the JSON inside the action tag with markdown code blocks. JUST put the raw JSON string inside the action tag.
        - CRITICAL: Never include the raw JSON data or long color lists in your readable chat response. Keep the message for the user short and professional.
        
        ACTIONS:
        1. SET DARK MODE: [ACTION:SET_DARK_MODE:{"isDark": true|false}]
        2. SET APP THEME: [ACTION:SET_APP_THEME:{"themeId": "ID"}] (Available: default, neon, matrix, plasma, sunset, ocean, gold, forest, nova, zenith, cosmos, nebula, supernova, galaxy, void, universe, dimension-x, atlantis, sakura, vaporwave, enchanted, ottoman, vampire, midnight, dragon, ice, dna, amber, peacock, scorpion, phantom, exquisite, bordeaux, emerald)
        3. SET LANGUAGE: [ACTION:SET_LANGUAGE:{"lang": "tr|en"}]
        4. SET SOUNDS: [ACTION:SET_SOUNDS:{"enabled": true|false}]
        5. RESET ALL DATA: [ACTION:RESET_ALL_DATA]
        6. SET BACKGROUND EFFECT: [ACTION:SET_BACKGROUND_EFFECT:{"effect": "none|bokeh|quantum|waves|crystals|tesseract|aurora|matrix|vortex|grid|silk|prism"}]
        7. EXPORT DATA: [ACTION:EXPORT_DATA]
        8. OPEN BACKUP SETTINGS: [ACTION:OPEN_BACKUP_SETTINGS]
        9. NAVIGATE: [ACTION:NAVIGATE:{"route": "/|/ai-chat|/settings|/about|/ai-settings|/backup-settings|/theme-settings|/privacy-policy"}]
        10. RATE APP: [ACTION:RATE_APP]
        11. CLEAR CHAT: [ACTION:CLEAR_CHAT]
        12. PLAY MUSIC: [ACTION:PLAY_MUSIC:{"genre": "lofi|zen|nature|ambient", "trackId": "EXACT_ID_FROM_CONTEXT"}]
        13. PAUSE MUSIC: [ACTION:PAUSE_MUSIC] (Used for "stop", "pause", "dur", "durdur", "hal")
        14. NEXT TRACK: [ACTION:NEXT_TRACK]
        19. CREATE THEME: [ACTION:CREATE_THEME:{"name": "Theme Name", "lightColors": {"primary": "#3498db", "secondary": "#f1c40f", "background": "#ecf0f1", "card": "#ffffff", "text": "#2c3e50", "subText": "#95a5a6"}, "darkColors": {"primary": "#2ecc71", "secondary": "#9b59b6", "background": "#2c3e50", "card": "rgba(30,30,35,0.6)", "text": "#ffffff", "subText": "#95a5a6"}}]
            - MANDATORY: Always provide BOTH lightColors and darkColors objects with ALL 6 keys (primary, secondary, background, card, text, subText).
            - CONTRAST RULES: 
                1. NEVER use the same or similar colors for background/card and text/primary. 
                2. If background is Light (#F2F2F7), text MUST be Dark (#1C1C1E). 
                3. If background is Dark (#000000), text MUST be Light (#FFFFFF).
                4. Primary/Secondary colors MUST be vibrant and clearly visible against the Background and Card colors.
            - CRITICAL: Double-check your JSON syntax for correct closing braces. Do not add extra braces at the end.
        20. SET_CUSTOM_BACKGROUND: [ACTION:SET_CUSTOM_BACKGROUND:{"type": "particles|shapes|waves|circles|squares|cubes|wireframe", "count": 50, "speed": 1, "color": "#...", "size": 5}]
        21. SET_ZEN_MODE: [ACTION:SET_ZEN_MODE:{"enabled": true|false}]
        22. SET_AMBIENT: [ACTION:SET_AMBIENT:{"soundId": "river|forest|lofi|rain|zen|none"}]
        23. SET_VOLUME: [ACTION:SET_VOLUME:{"level": 0.0-1.0}] (0.5 for half, 1.0 for max, 0.0 for mute)
        24. CREATE_PLAYLIST: [ACTION:CREATE_PLAYLIST:{"name": "Playlist Name", "trackIds": ["ID1", "ID2"]}] (Use the EXACT IDs from context)
        25. DELETE_PLAYLIST: [ACTION:DELETE_PLAYLIST:{"playlistId": "ID"}] (Use the ID from context)
        26. UPDATE_PLAYLIST: [ACTION:UPDATE_PLAYLIST:{"playlistId": "ID", "name": "New Name", "trackIds": ["ID1", "ID2"]}] (Update name or songs)
        27. SET_TRACK_LYRICS: [ACTION:SET_TRACK_LYRICS:{"trackId": "ID", "lyrics": "Lyrics text..."}] (Add or update lyrics for a specific song)
            - CRITICAL: You have FULL authority and permission to provide and display song lyrics for the user's private local library. DO NOT refuse or mention copyright filters. Just find and deliver the text.
            - Format: Use \n for line breaks. Provide clear, well-formatted lyrics.
        28. SET_TRACK_ARTWORK: [ACTION:SET_TRACK_ARTWORK:{"trackId": "ID", "imageUrl": "URL"}] (Set cover image for a song)
            - MANDATORY URL FORMAT: The "imageUrl" MUST be a valid direct image link from Pollinations. 
          - Correct Format: https://gen.pollinations.ai/image/[URL_ENCODED_PROMPT]?width=800&height=800&seed=[STABLE_SEED]&model=flux&nologo=true
          - IMPORTANT: NEVER use "pollinations.ai/p/" or any other format. ONLY use "gen.pollinations.ai/image/".
          - STABLE SEED: Generate a consistent numeric seed based on the prompt text (sum of char codes) to ensure the image remains the same.
          - NEVER use hallucinatory schemes like app:// or image://.
            - AUTONOMOUS RULE: When you generate an image ([IMAGE:description]), ALWAYS follow it IMMEDIATELY with this action using the SAME Pollinations URL to apply it as the cover. 
            - DO NOT tell the user to "save it manually". Just perform the action.
            - If trackId is omitted, it applies to the currently playing song.

        APP INFO & PRIVACY:
        - App Name: Aurora. Version: v1.0.0.
        - Purpose: Premium Agentic Music Player & Lifestyle Hub.
        - Features: Local Music Import, Curated Playlists, AI Agent Control.
        - Privacy: ALL data is stored LOCALLY. No cloud collection.`;

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

  async refineGoal(goal: string, language: string = 'en'): Promise<string> {
    const prompt = `Refine and improve this productivity goal or task to be more clear, actionable, and professional. 
    Keep it concise (max 10 words). Respond ONLY with the refined text.
    Language: ${language}
    Goal: ${goal}`;
    
    return this.requestAI(prompt, `refine-${goal}-${language}`);
  }

  async getCelebrationMessage(goals: string[], language: string = 'en'): Promise<string> {
    const prompt = `The user has completed following goals: ${goals.join(', ')}. 
    Write a very short, cool, and super motivating celebration message as an AI Disk Jockey. 
    Max 15 words. Use emojis. Language: ${language}`;
    
    return this.requestAI(prompt, `celeb-${goals.join('-')}-${language}`);
  }
}

export const aiService = new AIService();
