# 🔧 KRİTİK FİX'LER - TOPLU PROMPT

## 1. API Key Persistence Fix (2 dakika)

**Dosya:** `src/store/aiStore.ts`  
**Satırlar:** 154-165

**Sorun:** API key'ler hem SecureStore'da hem de AsyncStorage'da (gereksiz kopya)

**Fix:** `partialize` fonksiyonundan API key'leri çıkar:

```typescript
// ŞU ANKİ KOD (SİLİNECEK):
partialize: (state) => ({
  pollinationsApiKey: state.pollinationsApiKey,  // ❌ Çıkar
  // apiKey ve groqApiKey zaten yok, ama pollinationsApiKey var
  chatMessages: state.chatMessages,
  // ...
}),

// YENİ KOD:
partialize: (state) => ({
  // API key'ler YOK - zaten SecureStore'da
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
```

---

## 2. MarkdownText Hooks Violation Fix (1 dakika)

**Dosya:** `src/components/MarkdownText.tsx`  
**Satırlar:** 108-113

**Sorun:** `useEffect` koşul içinde (React hooks kural ihlali)

**Şu anki kod:**
```typescript
if (imageMatch) {
  React.useEffect(() => {  // ❌ KOŞULLU HOOK!
    if (localSdIp && !generatedLocalImages[index]) {
      handleLocalGenerate();
    }
  }, [localSdIp, rawPrompt]);
}
```

**Fix:**
```typescript
useEffect(() => {
  if (imageMatch && localSdIp && !generatedLocalImages[index]) {
    handleLocalGenerate();
  }
}, [imageMatch, localSdIp, index, rawPrompt]);  // ✅ Tüm bağımlılıklar
```

---

## 3. SoundPlayer Memory Leak Fix (2 dakika)

**Dosya:** `src/components/SoundPlayer.tsx`  
**Satırlar:** 179-224

**Sorun:** Event listener cleanup yok

**Şu anki kod (179-224 arası bir yerde):**
```typescript
useEffect(() => {
  musicListenerRef.current = player.addListener('playbackStatusUpdate', (status) => {
    // ...
  });

  return () => {
    // ❌ CLEANUP YOK!
  };
}, [currentTrack]);
```

**Fix:**
```typescript
return () => {
  if (musicListenerRef.current) {
    musicListenerRef.current.remove();  // ✅ Listener'ı temizle
  }
};
```

---

## 4. Console.log'ları Kaldır (10 dakika)

**Dosyalar:**
- `src/store/musicStore.ts` - 4 console.log
- `src/services/aiService.ts` - 6 console.log
- `src/components/SoundPlayer.tsx` - 4 console.log
- `src/components/MarkdownText.tsx` - 3 console.log
- `src/store/aiStore.ts` - 1 console.error

**Fix:** Sil veya logger utility kullan:

```typescript
// Option A: Direkt sil
console.log("[loadLocalMusic] Açılıyor...");  // ❌ SİL

// Option B: Logger utility
import { logger } from '../utils/logger';
logger.log("[loadLocalMusic] Açılıyor...");  // ✅ __DEV__ check ile
```

---

## 5. TypeScript Errors Fix (15 dakika)

**Hatalar:**
```
src/components/AddGoalForm.tsx:23 - Cannot find module '../types/goal'
src/components/GoalCard.tsx:24 - Cannot find module '../types/goal'
src/lib/database.ts:2 - Cannot find module '../types/goal'
src/hooks/useDailyReset.ts:4 - Cannot find module '../store/dailyGoalsStore'
```

**Fix:** Eksik dosyaları oluştur veya import'ları düzelt.

---

## Test Checklist

- [ ] API key gir → App'i kapat → App'i aç → Key hala var?
- [ ] AI chat çalışıyor mu?
- [ ] Local SD image generation çalışıyor mu?
- [ ] Müzik çalıyor mu?
- [ ] Memory leak var mı? (Uzun kullanım testi)
- [ ] TypeScript build geçiyor mu? (`npm run typecheck`)

---

## Öncelik Sırası

1. ✅ API Key Persistence (2 dk) - GÜVENLİK
2. ✅ MarkdownText Hooks (1 dk) - REACT KURALLARI
3. ✅ SoundPlayer Cleanup (2 dk) - MEMORY LEAK
4. ⚠️ Console.log'lar (10 dk) - KOD KALİTESİ
5. ⚠️ TypeScript Errors (15 dk) - BUILD

**Toplam:** ~30 dakika

---

## Komutlar

```bash
# Type check
npm run typecheck

# Lint
npm run lint

# Build
npx expo build:android

# Test
npm test
```
