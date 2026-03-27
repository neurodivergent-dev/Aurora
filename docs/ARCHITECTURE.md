# 🏗️ Aurora Architecture Overview

**Oluşturulma Tarihi:** 27 Mart 2026  
**Yazar:** Aurora Development Team  
**Seviye:** All Levels  
**Okuma Süresi:** 15 dakika

---

## 📋 İÇİNDEKİLER

1. [High-Level Architecture](#high-level-architecture)
2. [Directory Structure](#directory-structure)
3. [State Management](#state-management)
4. [Navigation](#navigation)
5. [Services](#services)
6. [Components](#components)
7. [Data Flow](#data-flow)
8. [Key Decisions](#key-decisions)

---

## 🎯 HIGH-LEVEL ARCHITECTURE

### **Aurora Stack:**

```
┌─────────────────────────────────────────┐
│           User Interface                 │
│  (React Native + Reanimated + SVG)      │
├─────────────────────────────────────────┤
│           State Management               │
│  (Zustand: 7 stores)                    │
├─────────────────────────────────────────┤
│           Business Logic                 │
│  (Services: AI, Music, Sound, etc.)     │
├─────────────────────────────────────────┤
│           Storage Layer                  │
│  (MMKV + AsyncStorage + SecureStore)    │
├─────────────────────────────────────────┤
│           External APIs                  │
│  (Gemini, Groq, Ollama, Pollinations)   │
└─────────────────────────────────────────┘
```

---

## 📁 DIRECTORY STRUCTURE

```
C:\Aurora\
├── app/                          # Expo Router (file-based routing)
│   ├── (tabs)/                   # Main tab navigation
│   │   ├── _layout.tsx           # Tab bar layout
│   │   ├── index.tsx             # Home tab → HomeScreen
│   │   ├── playlists.tsx         # Playlists tab
│   │   ├── ai-chat.tsx           # AI Chat tab
│   │   └── settings.tsx          # Settings tab
│   ├── _layout.tsx               # Root layout
│   ├── modal.tsx                 # Modal route
│   ├── music-player.tsx          # Full-screen player
│   └── ...                       # Other routes
│
├── src/                          # Main source code
│   ├── components/               # Reusable UI components
│   │   ├── BackgroundEffects.tsx
│   │   ├── MarkdownText.tsx
│   │   ├── SoundPlayer.tsx
│   │   ├── MiniPlayer.tsx
│   │   └── ...
│   │
│   ├── screens/                  # Screen components
│   │   ├── AIChatScreen/         # Modular screen structure
│   │   │   ├── AIChatScreen.tsx
│   │   │   ├── components/
│   │   │   ├── handlers/
│   │   │   └── hooks/
│   │   ├── HomeScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   └── ...
│   │
│   ├── services/                 # Business logic
│   │   ├── aiService.ts
│   │   ├── groqService.ts
│   │   ├── ollamaService.ts
│   │   ├── SoundService.ts
│   │   └── ...
│   │
│   ├── store/                    # Zustand state management
│   │   ├── aiStore.ts
│   │   ├── musicStore.ts
│   │   ├── themeStore.ts
│   │   └── ...
│   │
│   ├── utils/                    # Utility functions
│   │   ├── logger.ts
│   │   ├── backup.ts
│   │   └── ...
│   │
│   ├── types/                    # TypeScript types
│   │   └── chat.ts
│   │
│   └── i18n/                     # Internationalization
│       ├── locales/
│       │   ├── en.ts
│       │   └── tr.ts
│       └── i18n.ts
│
├── docs/                         # Documentation
│   ├── ERROR_HANDLING_BEST_PRACTICES.md
│   ├── LOGGER_USAGE.md
│   ├── TESTING_BEST_PRACTICES.md
│   └── ARCHITECTURE.md (this file)
│
└── assets/                       # Static assets
    ├── fonts/
    ├── images/
    └── sounds/
```

---

## 🗄️ STATE MANAGEMENT

### **7 Zustand Stores:**

```
┌─────────────────────────────────────────┐
│  aiStore                                │
│  - API keys (SecureStore)              │
│  - Chat messages                        │
│  - Provider selection                   │
│  - Image generation config              │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  musicStore (MMKV)                      │
│  - Current track                        │
│  - Playback state                       │
│  - Playlists                            │
│  - Local tracks                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  themeStore                             │
│  - Active theme                         │
│  - Colors (light/dark)                  │
│  - Background effects                   │
│  - Sound settings                       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  languageStore                          │
│  - Current language (EN/TR)             │
│  - Sync with i18n                       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  settingsStore                          │
│  - User profile                         │
│  - App preferences                      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  onboardingStore                        │
│  - Onboarding completion status         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  ollamaStore                            │
│  - Ollama configuration                 │
│  - Local/Cloud mode                     │
└─────────────────────────────────────────┘
```

---

### **Storage Strategy:**

```typescript
// Sensitive Data → SecureStore
aiStore.apiKey → SecureStore
ollamaStore.credentials → SecureStore

// Frequent Updates → MMKV
musicStore.volume → MMKV
musicStore.playbackPosition → MMKV

// General Persistence → AsyncStorage
themeStore.themeId → AsyncStorage
languageStore.language → AsyncStorage
settingsStore.preferences → AsyncStorage
```

---

## 🧭 NAVIGATION

### **Expo Router Structure:**

```
app/
├── _layout.tsx              # Root layout (providers)
│   ├── ThemeProvider
│   ├── SafeAreaProvider
│   ├── SoundPlayer
│   └── MiniPlayer
│
├── (tabs)/
│   ├── _layout.tsx          # Tab navigation
│   ├── index.tsx            # Home → HomeScreen
│   ├── playlists.tsx        # Playlists → PlaylistsScreen
│   ├── ai-chat.tsx          # AI Chat → AIChatScreen
│   └── settings.tsx         # Settings → SettingsScreen
│
├── modal.tsx                # Modal presentation
├── music-player.tsx         # Full-screen player (modal)
├── playlist-detail.tsx      # Playlist detail (slide from right)
├── onboarding.tsx           # First-run onboarding
├── theme-settings.tsx       # Theme customization
├── ai-settings.tsx          # AI configuration
└── backup-settings.tsx      # Backup/restore
```

---

### **Navigation Guards:**

```typescript
// Onboarding check
useEffect(() => {
  if (!onboardingCompleted) {
    router.replace('/onboarding');
  }
}, [onboardingCompleted]);

// AI feature gate
if (!aiEnabled) {
  // Hide AI chat tab
  // Show setup prompt
}
```

---

## 🔧 SERVICES

### **Service Layer:**

```
┌─────────────────────────────────────────┐
│  aiService                              │
│  - Multi-provider AI (Gemini/Groq/Ollama)
│  - Command parsing                       │
│  - Chat history management               │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  groqService                            │
│  - Groq API wrapper                      │
│  - Llama models                          │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  ollamaService                          │
│  - Ollama API (local/cloud)              │
│  - Self-hosted models                    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  SoundService                           │
│  - UI sound effects                      │
│  - Ambient sounds                        │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  SpeechService                          │
│  - Text-to-speech                        │
│  - Voice output                          │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  VoiceInputService                      │
│  - Speech-to-text                        │
│  - Groq Whisper                          │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  NotificationService                    │
│  - Push notifications                    │
│  - Daily reminders                       │
└─────────────────────────────────────────┘
```

---

## 🧩 COMPONENTS

### **Component Hierarchy:**

```
App (root)
├── ThemeProvider
├── SafeAreaProvider
├── SoundPlayer (global)
├── MiniPlayer (global)
│
└── Router
    └── (tabs)
        ├── HomeScreen
        │   ├── TrackList
        │   ├── MiniPlayer
        │   └── BackgroundEffects
        │
        ├── AIChatScreen (modular)
        │   ├── ChatHeader
        │   ├── MessageBubble (memo)
        │   ├── ChatInput
        │   ├── TypingIndicator
        │   └── MarkdownText
        │
        ├── PlaylistsScreen
        │   └── PlaylistList
        │
        └── SettingsScreen
            ├── ProfileSection
            ├── AIConfigSection
            └── ThemeSection
```

---

### **Component Types:**

```typescript
// Presentational Components (dumb)
<MessageBubble message={message} />
<ChatInput onSend={handleSend} />
<TrackItem track={track} onPress={play} />

// Container Components (smart)
<AIChatScreen />  // Manages state, logic
<HomeScreen />    // Fetches data, passes down

// Global Components
<SoundPlayer />   // Always present, handles audio
<MiniPlayer />    // Always present, shows current track
<BackgroundEffects /> // Always present, visual effects
```

---

## 🔄 DATA FLOW

### **Example: AI Command Execution**

```
1. User Input
   ↓
2. AIChatScreen
   ↓
3. useAIChat hook
   ↓
4. aiService.chat()
   ↓
5. AI Provider (Gemini/Groq/Ollama)
   ↓
6. Response with commands
   ↓
7. parseAction() in handlers
   ↓
8. Store action (e.g., useThemeStore.setThemeId())
   ↓
9. Theme updates
   ↓
10. ThemeProvider context
    ↓
11. All components re-render with new theme
```

---

### **Example: Music Playback**

```
1. User taps "Play"
   ↓
2. useMusicStore.play()
   ↓
3. SoundPlayer component detects change
   ↓
4. createAudioPlayer(track.url)
   ↓
5. player.play()
   ↓
6. playbackStatusUpdate listener
   ↓
7. useMusicStore.setPlaybackPosition()
   ↓
8. UI updates (progress bar, time)
```

---

## 🎯 KEY DECISIONS

### **1. Why Zustand?**

```
✅ Minimal boilerplate
✅ No providers needed
✅ TypeScript-first
✅ Persist middleware built-in
✅ Small bundle size (1KB)
✅ Easy testing

❌ No devtools out-of-box (but available)
❌ No middleware ecosystem like Redux
```

---

### **2. Why Expo Router?**

```
✅ File-based routing (like Next.js)
✅ Deep linking built-in
✅ TypeScript support
✅ Native navigation (React Navigation based)
✅ Easy to understand

❌ Less flexible than manual React Navigation
❌ Newer, less community resources
```

---

### **3. Why Multiple AI Providers?**

```
✅ Redundancy (if one fails, others work)
✅ Cost optimization (use cheapest for simple tasks)
✅ Feature diversity (different models excel at different things)
✅ User choice (privacy-focused can use local Ollama)

❌ More complex code
❌ More API keys to manage
```

---

### **4. Why MMKV for Music?**

```
✅ 10x faster than AsyncStorage
✅ Synchronous API (no promises)
✅ Perfect for frequent updates (playback position)
✅ Small bundle size

❌ iOS only (but we use AsyncStorage fallback)
❌ Less mature than AsyncStorage
```

---

### **5. Why Modular Screen Pattern?**

```
AIChatScreen/
├── AIChatScreen.tsx      # Main component
├── components/            # Sub-components
├── handlers/              # Business logic
└── hooks/                 # Custom hooks

✅ Separation of concerns
✅ Easier testing
✅ Reusable components
✅ Clear file structure

❌ More files to manage
❌ Slightly more complex imports
```

---

## 📊 ARCHITECTURE METRICS

```
Total Files: 103 TS/TSX
Total Lines: ~15,000+

Breakdown:
├── Screens: 24 files (23%)
├── Components: 16 files (16%)
├── Services: 8 files (8%)
├── Stores: 7 files (7%)
├── Utils: 2 files (2%)
├── Types: 1 file (1%)
├── Routes: 15 files (15%)
├── Tests: 7 files (7%)
└── Other: 23 files (22%)
```

---

## ✅ CHECKLIST

### **Architecture Review:**

```markdown
## Architecture Checklist

- [ ] Clear separation of concerns
- [ ] State management appropriate
- [ ] Services are testable
- [ ] Components are reusable
- [ ] Navigation is intuitive
- [ ] Data flow is clear
- [ ] Error handling exists
- [ ] Logging implemented
- [ ] TypeScript types defined
- [ ] Documentation exists
```

---

## 📖 KAYNAKLAR

- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Expo Router](https://expo.github.io/router/)
- [React Native](https://reactnative.dev/)
- [Aurora Error Handling](./ERROR_HANDLING_BEST_PRACTICES.md)
- [Aurora Logger](./LOGGER_USAGE.md)
- [Aurora Testing](./TESTING_BEST_PRACTICES.md)

---

**Son Güncelleme:** 27 Mart 2026  
**Versiyon:** 1.0  
**Durum:** ✅ Production Ready
