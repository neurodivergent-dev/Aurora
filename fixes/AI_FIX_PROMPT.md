# AI CODE FIX PROMPT

Aşağıdaki 3 kritik hatayı düzelt. Her fix için ilgili dosyayı aç ve değiştir.

---

## FIX 2: React Hooks Kural İhlali

**Dosya:** `src/components/MarkdownText.tsx`
**Satır:** 108-113 civarı

`useEffect` hook'u koşul içinde kullanılmış. Hook'u koşul dışına çıkar, condition'ı içine koy.

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

**Yeni kod:**
```typescript
useEffect(() => {
  if (imageMatch && localSdIp && !generatedLocalImages[index]) {
    handleLocalGenerate();
  }
}, [imageMatch, localSdIp, index, rawPrompt]);  // ✅ Tüm bağımlılıklar
```

---

## FIX 3: SoundPlayer Memory Leak

**Dosya:** `src/components/SoundPlayer.tsx`
**Satır:** 179-224 civarı (currentTrack useEffect'i)

Event listener için cleanup fonksiyonu eksik. `return () => { ... }` içinde listener'ı temizle.

**Şu anki kod (cleanup kısmı):**
```typescript
return () => {
  // ❌ CLEANUP YOK!
};
```

**Yeni kod:**
```typescript
return () => {
  if (musicListenerRef.current) {
    musicListenerRef.current.remove();  // ✅ Listener'ı temizle
  }
};
```

---

## ÖNEMLİ

- Her fix'ten sonra dosyayı kaydet
- Tüm fix'ler bittikten sonra `npm run typecheck` çalıştır
- Hata varsa göster, düzeltelim

**Başla!**
