# 🛡️ Aurora Error Handling Best Practices

**Oluşturulma Tarihi:** 27 Mart 2026  
**Yazar:** Aurora Development Team  
**Seviye:** All Levels  
**Okuma Süresi:** 15 dakika

---

## 📋 İÇİNDEKİLER

1. [Neden Error Handling?](#neden-error-handling)
2. [Kötü Örnekler (Yapma!)](#kötü-örnekler-yapma)
3. [Result Type Pattern](#result-type-pattern)
4. [Implementasyon](#implementasyon)
5. [User-Facing Error Messages](#user-facing-error-messages)
6. [Error Boundaries](#error-boundaries)
7. [Logger Entegrasyonu](#logger-entegrasyonu)
8. [Checklist](#checklist)

---

## 🎯 NEDEN ERROR HANDLING?

### **Kullanıcı Deneyimi:**

```
❌ BAD:
User: "AI neden çalışmıyor?"
App: *sessizlik* (returns "")
User: "App bozuk!" → 1⭐ review

✅ GOOD:
User: "AI neden çalışmıyor?"
App: "AI servisine bağlanılamadı. Lütfen internet bağlantınızı kontrol edin."
User: "Ah, WiFi kapalıymış" → ⭐⭐⭐⭐⭐
```

### **Developer Deneyimi:**

```
❌ BAD:
Bug report: "App crash ediyor"
You: "Nerede? Hangi hata?"
User: "Bilmiyorum"
You: 🔍🕵️‍♂️ (debugging nightmare)

✅ GOOD:
Bug report: "App crash ediyor"
You: "Hangi hata mesajını gördün?"
User: "AI_FAILED: API key eksik"
You: "Ah, API key sorunu!" → 5 dakikada fix
```

---

## ❌ KÖTÜ ÖRNEKLER (YAPMA!)

### **1. Silent Failure (En Kötü!)**

```typescript
// ❌ ASLA YAPMA!
async function chat(message: string): Promise<string> {
  try {
    const response = await api.call(message);
    return response;
  } catch (e) {
    console.error("Error:", e);  // ❌ Console'a yazdı, kullanıcı bilmiyor
    return "";  // ❌ SESSİZ BAŞARISIZLIK!
  }
}

// Kullanıcı:
// - AI'ya soru soruyor
// - "" dönüyor
// - Ekranda hiçbir şey yok
// - "App bozuk!" diyor
```

**Neden Kötü?**
```
❌ Kullanıcı ne olduğunu anlamıyor
❌ Debugging imkansız
❌ User trust kaybediyorsun
❌ 1-star review garantili
```

---

### **2. Generic Error Message**

```typescript
// ❌ ÇOK DA İYİ DEĞİL
catch (e) {
  alert("Bir hata oluştu");  // ❌ Hangi hata? Ne yapmalı?
}
```

**Neden Kötü?**
```
❌ Kullanıcı ne yapacağını bilmiyor
❌ "Tekrar dene" mi? "App'i sil" mi?
❌ Helpless hissettiriyor
```

---

### **3. Error Ignoring**

```typescript
// ❌ ERROR'I YOK SAYMA
async function loadMusic() {
  try {
    const tracks = await fetchTracks();
    return tracks;
  } catch (e) {
    // ❌ Hata var ama hiçbir şey yapmıyoruz
  }
  return [];  // ❌ Empty array, user sees nothing
}
```

**Neden Kötü?**
```
❌ Data kaybı
❌ User confused ("Müzikler nerede?")
❌ Silent data corruption
```

---

### **4. Stack Trace Exposure**

```typescript
// ❌ KULLANICIYA STACK TRACE GÖSTERME
catch (e) {
  alert(e.stack);  // ❌ Kullanıcı "TypeError: Cannot read property..." ne yapsın?
}
```

**Neden Kötü?**
```
❌ Kullanıcı anlamaz
❌ Security risk (internal details exposed)
❌ Unprofessional görünüyor
```

---

## ✅ RESULT TYPE PATTERN (YAP!)

### **Temel Yapı:**

```typescript
// src/types/result.ts

/**
 * Type-safe error handling pattern
 * 
 * Usage:
 * const result = await someFunction();
 * if (!result.success) {
 *   showError(result.error); // User-friendly message
 * }
 */

export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string; details?: Record<string, unknown> };

/**
 * Helper function to create success result
 */
export const success = <T>(data: T): Result<T> => ({
  success: true,
  data,
});

/**
 * Helper function to create error result
 */
export const error = <T>(
  errorMessage: string,
  code?: string,
  details?: Record<string, unknown>
): Result<T> => ({
  success: false,
  error: errorMessage,
  code,
  details,
});
```

---

### **Örnek Implementasyon:**

```typescript
// src/services/aiService.ts

import { Result, success, error } from '../types/result';

class AIService {
  async chat(
    message: string,
    history: ChatMessage[]
  ): Promise<Result<string>> {
    
    // Validation
    if (!message.trim()) {
      return error<string>(
        "Mesaj boş olamaz",
        "INVALID_INPUT"
      );
    }

    try {
      // API call
      const response = await this.api.call(message, history);
      
      if (!response) {
        return error<string>(
          "AI yanıt vermedi",
          "EMPTY_RESPONSE"
        );
      }

      return success<string>(response);

    } catch (e) {
      // Network error
      if (e instanceof TypeError && e.message.includes('fetch')) {
        return error<string>(
          "İnternet bağlantısı yok. Lütfen kontrol edin.",
          "NETWORK_ERROR"
        );
      }

      // API key error
      if (e instanceof Error && e.message.includes('API key')) {
        return error<string>(
          "API anahtarı eksik veya geçersiz. Ayarlardan kontrol edin.",
          "AUTH_ERROR"
        );
      }

      // Generic error
      return error<string>(
        "AI servisine bağlanılamadı. Lütfen tekrar deneyin.",
        "AI_FAILED",
        { originalError: e.message } // Dev logs için
      );
    }
  }
}
```

---

### **Kullanım (Caller Side):**

```typescript
// src/screens/AIChatScreen/hooks/useAIChat.ts

import { error as showError } from '../utils/errorHandler';

const handleSend = async () => {
  setIsLoading(true);

  const result = await aiService.chat(message, history);

  if (!result.success) {
    // ❌ Artık kullanıcı dostu hata mesajı var!
    showError(result.error, {
      code: result.code,
      action: 'retry'
    });
    
    setIsLoading(false);
    return;
  }

  // ✅ Success, data available
  addMessage({
    role: 'model',
    text: result.data,
  });

  setIsLoading(false);
};
```

---

## 🎨 USER-FACING ERROR MESSAGES

### **Error Message Template:**

```typescript
// src/utils/errorHandler.ts

interface ErrorConfig {
  message: string;
  code?: string;
  action?: 'retry' | 'settings' | 'contact' | 'none';
  severity?: 'info' | 'warning' | 'error';
}

export const errorMessages: Record<string, ErrorConfig> = {
  // Network Errors
  NETWORK_ERROR: {
    message: "İnternet bağlantısı yok. Lütfen kontrol edin.",
    action: 'retry',
    severity: 'warning',
  },
  
  // Auth Errors
  AUTH_ERROR: {
    message: "API anahtarı eksik veya geçersiz.",
    action: 'settings',
    severity: 'error',
  },
  
  // AI Errors
  AI_FAILED: {
    message: "AI servisine bağlanılamadı.",
    action: 'retry',
    severity: 'error',
  },
  
  EMPTY_RESPONSE: {
    message: "AI yanıt vermedi. Tekrar deneyin.",
    action: 'retry',
    severity: 'info',
  },
  
  // Validation Errors
  INVALID_INPUT: {
    message: "Geçersiz giriş. Lütfen kontrol edin.",
    action: 'none',
    severity: 'info',
  },
  
  // Default
  UNKNOWN: {
    message: "Bir hata oluştu. Lütfen tekrar deneyin.",
    action: 'retry',
    severity: 'error',
  },
};

/**
 * Show error to user with appropriate action
 */
export const showError = (
  message: string,
  config?: { code?: string; action?: string }
) => {
  // Get user-friendly message from template
  const errorConfig = config?.code 
    ? errorMessages[config.code] 
    : errorMessages.UNKNOWN;

  // Show alert
  CustomAlert.show({
    title: "Hata",
    message: errorConfig?.message || message,
    type: errorConfig?.severity || 'error',
    buttons: [
      {
        text: "Tamam",
        onPress: () => {},
      },
      ...(errorConfig?.action === 'retry' ? [{
        text: "Tekrar Dene",
        onPress: () => retryLastAction(),
      }] : []),
      ...(errorConfig?.action === 'settings' ? [{
        text: "Ayarlara Git",
        onPress: () => navigation.navigate('Settings'),
      }] : []),
    ],
  });

  // Log for debugging (development only)
  logger.error(`[ERROR] ${config?.code}: ${message}`);
};
```

---

## 🛡️ ERROR BOUNDARIES

### **Route-Level Error Boundary:**

```typescript
// app/ErrorBoundary.tsx

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { logger } from '../src/utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error for debugging
    logger.error('[ERROR BOUNDARY]', error, errorInfo);
    
    // In production, you could send to crash reporting service
    // Sentry.captureException(error, { extra: errorInfo });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <Text style={styles.title}>Bir hata oluştu</Text>
          <Text style={styles.message}>
            {this.state.error?.message || 'Bilinmeyen hata'}
          </Text>
          <Button title="Tekrar Dene" onPress={this.handleRetry} />
          <Button 
            title="Ana Sayfaya Dön" 
            onPress={() => window.location.reload()} 
          />
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default ErrorBoundary;
```

---

### **Usage in App Layout:**

```typescript
// app/_layout.tsx

import { ErrorBoundary } from './ErrorBoundary';

export default function RootLayout() {
  return (
    <ErrorBoundary fallback={<CustomFallback />}>
      <ThemeProvider>
        <SafeAreaProvider>
          <Stack>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="modal" />
            {/* ... other screens */}
          </Stack>
        </SafeAreaProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
```

---

## 📝 LOGGER ENTEGRASYONU

### **Error Logging:**

```typescript
// src/utils/logger.ts

import { logger, consoleTransport } from "react-native-logs";
import AsyncStorage from '@react-native-async-storage/async-storage';

const config = {
  levels: {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  },
  severity: __DEV__ ? "debug" : "info",
  transport: consoleTransport,
  async: true,
};

const log = logger.createLogger(config);

export const auroraLogger = {
  // ... existing methods

  /**
   * Log error with context for debugging
   */
  errorWithContext: async (
    context: string,
    error: Error,
    metadata?: Record<string, unknown>
  ) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      context,
      message: error.message,
      stack: error.stack,
      metadata,
    };

    // Development: log to console
    if (__DEV__) {
      log.error(`${context}: ${error.message}`, logEntry);
      return;
    }

    // Production: save to AsyncStorage for debugging
    try {
      const existingLogs = await AsyncStorage.getItem('error-logs') || '[]';
      const logs = JSON.parse(existingLogs);
      logs.push(logEntry);
      
      // Keep last 100 errors
      const trimmedLogs = logs.slice(-100);
      await AsyncStorage.setItem('error-logs', JSON.stringify(trimmedLogs));
    } catch (e) {
      // Silent fail (can't log logging errors 😅)
    }
  },

  /**
   * Export logs for debugging
   */
  exportLogs: async () => {
    const logs = await AsyncStorage.getItem('error-logs');
    return logs ? JSON.parse(logs) : [];
  },

  /**
   * Clear error logs
   */
  clearLogs: async () => {
    await AsyncStorage.removeItem('error-logs');
  },
};
```

---

## ✅ CHECKLIST

### **Error Handling Implementation:**

```markdown
## Before Merge Checklist

### Type Safety
- [ ] Result<T> type kullanılıyor mu?
- [ ] Success/error helper functions kullanılıyor mu?
- [ ] Error codes tanımlanmış mı?

### User Experience
- [ ] User-friendly error messages var mı?
- [ ] Action buttons (retry, settings) var mı?
- [ ] Error severity (info/warning/error) belirtilmiş mi?

### Developer Experience
- [ ] Errors logger'a yazılıyor mu?
- [ ] Error context/metadata eklenmiş mi?
- [ ] Stack trace development'ta görünüyor mu?

### Error Boundaries
- [ ] Route-level error boundary var mı?
- [ ] Custom fallback UI var mı?
- [ ] Error recovery (retry) mechanism var mı?

### Testing
- [ ] Error scenarios tested mi?
- [ ] User-facing messages doğru mu?
- [ ] Error codes unique mi?
```

---

## 📚 ÖRNEKLER

### **Full Example: Music Service**

```typescript
// src/services/musicService.ts

import { Result, success, error } from '../types/result';
import { auroraLogger } from '../utils/logger';

interface MusicTrack {
  id: string;
  title: string;
  url: string;
}

class MusicService {
  /**
   * Load tracks from device
   */
  async loadTracks(): Promise<Result<MusicTrack[]>> {
    try {
      const tracks = await MediaLibrary.getAssetsAsync({
        mediaType: 'audio',
      });

      if (!tracks || tracks.assets.length === 0) {
        return error<MusicTrack[]>(
          "Cihazda müzik bulunamadı.",
          "NO_TRACKS"
        );
      }

      const formattedTracks = tracks.assets.map(asset => ({
        id: asset.id,
        title: asset.filename,
        url: asset.uri,
      }));

      return success<MusicTrack[]>(formattedTracks);

    } catch (e) {
      // Permission denied
      if (e instanceof Error && e.message.includes('permission')) {
        return error<MusicTrack[]>(
          "Müzik erişim izni yok. Ayarlardan izin verin.",
          "PERMISSION_DENIED"
        );
      }

      // Log error with context
      await auroraLogger.errorWithContext(
        'MusicService.loadTracks',
        e as Error,
        { mediaType: 'audio' }
      );

      return error<MusicTrack[]>(
        "Müzikler yüklenirken bir hata oluştu.",
        "LOAD_FAILED"
      );
    }
  }

  /**
   * Play a track
   */
  async playTrack(trackId: string): Promise<Result<void>> {
    try {
      const track = await this.getTrackById(trackId);
      
      if (!track) {
        return error<void>(
          "Şarkı bulunamadı.",
          "TRACK_NOT_FOUND"
        );
      }

      await Audio.playAsync(track.url);
      return success<void>(undefined);

    } catch (e) {
      await auroraLogger.errorWithContext(
        'MusicService.playTrack',
        e as Error,
        { trackId }
      );

      return error<void>(
        "Şarkı çalınamadı. Dosya bozuk olabilir.",
        "PLAY_FAILED"
      );
    }
  }
}

export const musicService = new MusicService();
```

---

### **Usage in Screen:**

```typescript
// src/screens/HomeScreen.tsx

import { musicService } from '../services/musicService';
import { showError } from '../utils/errorHandler';

const HomeScreen = () => {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);

  const loadMusic = async () => {
    const result = await musicService.loadTracks();

    if (!result.success) {
      // Show user-friendly error
      showError(result.error, {
        code: result.code,
        action: result.code === 'PERMISSION_DENIED' ? 'settings' : 'retry'
      });
      return;
    }

    // Success: update state
    setTracks(result.data);
  };

  const handlePlay = async (trackId: string) => {
    const result = await musicService.playTrack(trackId);

    if (!result.success) {
      showError(result.error, {
        code: result.code,
      });
      return;
    }

    // Success: navigate to player
    navigation.navigate('MusicPlayer');
  };

  return (
    <View>
      <Button title="Müzikleri Yükle" onPress={loadMusic} />
      {/* ... rest of UI */}
    </View>
  );
};
```

---

## 🎯 SUMMARY

### **DO:**

```typescript
✅ Result<T> type kullan
✅ User-friendly messages göster
✅ Error codes tanımla
✅ Logger'a yaz (development)
✅ Error boundaries kullan
✅ Retry mechanisms ekle
```

### **DON'T:**

```typescript
❌ return "" (silent failure)
❌ console.error only (user doesn't see)
❌ Generic "Bir hata oluştu"
❌ Stack trace to user
❌ Ignore errors
```

---

## 📖 KAYNAKLAR

- [TypeScript Error Handling](https://www.typescriptlang.org/docs/handbook/error-handling.html)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Result Type Pattern](https://github.com/ghengeveld/result-type)
- [Aurora Logger Documentation](./LOGGER_USAGE.md)

---

**Son Güncelleme:** 27 Mart 2026  
**Versiyon:** 1.0  
**Durum:** ✅ Production Ready
