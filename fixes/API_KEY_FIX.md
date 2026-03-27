# 🔧 API Key Persistence Fix

## Problem

API key'ler hem SecureStore'da (doğru) hem de AsyncStorage'da (gereksiz kopya) persist ediliyor.

**Dosya:** `src/store/aiStore.ts`  
**Satırlar:** 154-165

## Solution

`partialize` fonksiyonundan API key'leri çıkar. API key'ler zaten `setApiKey`, `setGroqKey`, `setPollinationsApiKey` fonksiyonlarında SecureStore'a yazılıyor.

## Fix

**Değiştirilecek kod:**

```typescript
// src/store/aiStore.ts - Satır 154-165

{
  name: 'ai-storage',
  storage: createJSONStorage(() => AsyncStorage),
  partialize: (state) => ({
    // API key'ler SecureStore'da, burada YOK
    isAIEnabled: state.isAIEnabled,
    activeProvider: state.activeProvider,
    groqModel: state.groqModel,
    imageProvider: state.imageProvider,
    localSdModel: state.localSdModel,
    chatMessages: state.chatMessages,
    customSystemPrompt: state.customSystemPrompt,
    chatSoundsEnabled: state.chatSoundsEnabled,
    chatSoundType: state.chatSoundType,
    localSdIp: state.localSdIp,
    localSdPort: state.localSdPort,
  }),
}
```

**Çıkarılacak satırlar:**
- `pollinationsApiKey: state.pollinationsApiKey,`
- `apiKey: state.apiKey,` (zaten yoksa)
- `groqApiKey: state.groqApiKey,` (zaten yoksa)

## Test

1. API key gir
2. App'i kapat
3. App'i aç
4. API key hala var mı? → ✅ EVET (SecureStore'dan yükleniyor)

## Why This Works

- `setApiKey()` → SecureStore.setItemAsync() ✅
- `loadApiKey()` → SecureStore.getItemAsync() ✅
- `partialize` → Sadece Zustand state'i için, API key'ler zaten SecureStore'da

**Sonuç:** Gereksiz AsyncStorage kopyası silinir, güvenlik artar.
