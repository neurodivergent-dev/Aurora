# Aurora - Code and Architecture Review Report

## 1. Internationalization (i18n) Issues
Critical violation of the "no hardcoded strings" rule. Several screens and components contain hardcoded Turkish or English text.

### Findings:
- **[app/ai-settings.tsx](file:///c:/Aurora/app/ai-settings.tsx)**: Contains many hardcoded Turkish strings (e.g., "Yerel", "Ollama Ayarlarını Kaydet", "Görüntü Modeli Adı").
- **[src/components/MarkdownText.tsx](file:///c:/Aurora/src/components/MarkdownText.tsx)**: Hardcoded "Yerel SD Üretiyor...", "Yerel SD ile Üret", and "API Key Required".
- **[src/components/GlassAlert.tsx](file:///c:/Aurora/src/components/GlassAlert.tsx)**: Hardcoded "Tamam" button text.
- **[src/components/AIConfigModal.tsx](file:///c:/Aurora/src/components/AIConfigModal.tsx)**: Hardcoded feature descriptions in Turkish.
- **[src/services/aiService.ts](file:///c:/Aurora/src/services/aiService.ts)**: System prompts and error messages are hardcoded in English/Turkish within the class.

### Recommendation:
- Move all strings to [src/i18n/locales/tr.ts](file:///c:/Aurora/src/i18n/locales/tr.ts) and `en.ts`.
- Use the `useTranslation` hook in components.

---

## 2. Architectural Debt & State Management

### Findings:
- **Large Component Files**: [app/ai-settings.tsx](file:///c:/Aurora/app/ai-settings.tsx) is ~47KB. It's a "God Component" handling UI, complex state transitions, and service interactions.
- **Persistence Complexity**: 
    - [aiStore.ts](file:///c:/Aurora/src/store/aiStore.ts) manually manages `SecureStore` for keys while using Zustand's `persist` middleware for other fields. This creates a split source of truth during rehydration.
    - [musicStore.ts](file:///c:/Aurora/src/store/musicStore.ts) uses both `MMKV` (via custom adapter) and `AsyncStorage` (default in other stores). Consistency is needed.
- **Redundant Theme Logic**: [src/components/ThemeProvider.tsx](file:///c:/Aurora/src/components/ThemeProvider.tsx) and [src/hooks/useAppColorScheme.ts](file:///c:/Aurora/src/hooks/useAppColorScheme.ts) both implement system theme detection and update the store. This can lead to race conditions or double renders.

### Recommendation:
- **Refactor [ai-settings.tsx](file:///c:/Aurora/app/ai-settings.tsx)**: Split into smaller sub-components (e.g., `GeminiConfig`, `OllamaConfig`, `ImageProviderConfig`).
- **Unify Storage**: Standardize on `MMKV` for all stores where performance matters, or keep `AsyncStorage` for simplicity across the board.
- **Centralize Theme Logic**: Move system theme listener strictly into [ThemeProvider](file:///c:/Aurora/src/components/ThemeProvider.tsx#35-98) or a single singleton hook.

---

## 3. Service Layer Issues

### Findings:
- **[aiService.ts](file:///c:/Aurora/src/services/aiService.ts)**: Contains complex "Soft Routing" logic (regex checks for "image", "music", etc.) mixed with provider logic. This makes it hard to test and extend.
- **Model Hardcoding**: Gemini model versions (`gemini-2.5-flash`) are hardcoded in the service.

### Recommendation:
- **Strategy Pattern**: Implement a [Provider](file:///c:/Aurora/src/components/ThemeProvider.tsx#35-98) interface and separate `GeminiProvider`, `GroqProvider`, and `OllamaProvider`.
- **Config-Driven**: Move system prompts to a central configuration or the i18n layer if they are user-facing.

---

## 4. Database & Migrations

### Findings:
- **[src/lib/database.ts](file:///c:/Aurora/src/lib/database.ts)**: Uses `try-catch` blocks for manual `ALTER TABLE` migrations. While functional, it's brittle as the schema grows.

### Recommendation:
- Consider a simple version-based migration helper to track and apply structural changes sequentially.

---

## Final Verdict
The project has a solid foundation (Zustand, Expo Router, SQLite), but is currently suffering from **Scale Friction**. The AI and Music features have grown rapidly, leading to large files and hardcoded logic. A "Cleanup & Modularization" phase is highly recommended.
