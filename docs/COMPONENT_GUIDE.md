# 🧩 Aurora Component Guide

**Oluşturulma Tarihi:** 27 Mart 2026  
**Yazar:** Aurora Development Team  
**Seviye:** All Levels  
**Okuma Süresi:** 10 dakika

---

## 📋 İÇİNDEKİLER

1. [Component Types](#component-types)
2. [Presentational Components](#presentational-components)
3. [Container Components](#container-components)
4. [Global Components](#global-components)
5. [Component Patterns](#component-patterns)
6. [Best Practices](#best-practices)
7. [Examples](#examples)

---

## 🎯 COMPONENT TYPES

### **Three Types in Aurora:**

```
1. Presentational (Dumb)
   - Receive props
   - Render UI
   - No state management
   - Example: <MessageBubble />

2. Container (Smart)
   - Manage state
   - Fetch data
   - Pass props to children
   - Example: <AIChatScreen />

3. Global
   - Always present
   - App-wide functionality
   - Example: <SoundPlayer />
```

---

## 🎨 PRESENTATIONAL COMPONENTS

### **Characteristics:**

```typescript
✅ No state (or only local UI state)
✅ No API calls
✅ No store connections
✅ Receive data via props
✅ Emit events via callback props
✅ Easy to test
✅ Reusable
```

---

### **Example: MessageBubble**

```typescript
// src/screens/AIChatScreen/components/MessageBubble.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/components/ThemeProvider';

interface MessageBubbleProps {
  message: ChatMessage;
  onCopy?: (text: string) => void;
  onShare?: (text: string) => void;
}

export const MessageBubble = React.memo(({ 
  message, 
  onCopy, 
  onShare 
}: MessageBubbleProps) => {
  const { colors } = useTheme();
  const isUser = message.role === 'user';

  return (
    <View style={[
      styles.bubble,
      isUser ? styles.userBubble : styles.aiBubble,
      { backgroundColor: isUser ? colors.primary : colors.card }
    ]}>
      <Text style={[
        styles.text,
        { color: isUser ? colors.white : colors.text }
      ]}>
        {message.text}
      </Text>
      
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => onCopy?.(message.text)}>
          <Copy size={16} color={colors.subText} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onShare?.(message.text)}>
          <Share size={16} color={colors.subText} />
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 15,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
});
```

**Usage:**
```typescript
<MessageBubble 
  message={message} 
  onCopy={handleCopy}
  onShare={handleShare}
/>
```

---

### **Example: ChatInput**

```typescript
// src/screens/AIChatScreen/components/ChatInput.tsx

import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Send, Mic } from 'lucide-react-native';
import { useTheme } from '@/components/ThemeProvider';

interface ChatInputProps {
  onSend: (message: string) => void;
  onVoice?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput = ({
  onSend,
  onVoice,
  disabled = false,
  placeholder = 'AI\'ye sor...'
}: ChatInputProps) => {
  const { colors } = useTheme();
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSend(text.trim());
      setText('');
    }
  };

  return (
    <View style={[
      styles.container,
      { backgroundColor: colors.card, borderColor: colors.border }
    ]}>
      <TextInput
        style={[styles.input, { color: colors.text }]}
        value={text}
        onChangeText={setText}
        placeholder={placeholder}
        placeholderTextColor={colors.subText}
        multiline
        editable={!disabled}
      />
      
      <View style={styles.actions}>
        {onVoice && (
          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: colors.background }]}
            onPress={onVoice}
            disabled={disabled}
            accessibilityLabel="Sesli giriş"
            accessibilityRole="button"
          >
            <Mic size={20} color={colors.text} />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[
            styles.sendButton,
            { 
              backgroundColor: text.trim() ? colors.primary : colors.border,
              opacity: disabled ? 0.5 : 1
            }
          ]}
          onPress={handleSend}
          disabled={!text.trim() || disabled}
          accessibilityLabel="Mesaj gönder"
          accessibilityRole="button"
        >
          <Send size={20} color={colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderWidth: 1,
    borderRadius: 24,
    margin: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingHorizontal: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

---

## 📦 CONTAINER COMPONENTS

### **Characteristics:**

```typescript
✅ Manage state
✅ Connect to stores
✅ Make API calls
✅ Handle business logic
✅ Pass data to children
✅ Handle errors
✅ Loading states
```

---

### **Example: AIChatScreen (Simplified)**

```typescript
// src/screens/AIChatScreen/AIChatScreen.tsx

import React, { useState, useRef, useCallback } from 'react';
import { View, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useAIStore } from '@/store/aiStore';
import { useThemeStore } from '@/store/themeStore';
import { useAIChat } from './hooks/useAIChat';
import { ChatHeader } from './components/ChatHeader';
import { MessageBubble } from './components/MessageBubble';
import { ChatInput } from './components/ChatInput';
import { TypingIndicator } from './components/TypingIndicator';
import { styles } from './styles';

export const AIChatScreen = () => {
  const { chatMessages, addChatMessage } = useAIStore();
  const { colors } = useThemeStore();
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Use custom hook for chat logic
  const { handleSend } = useAIChat({
    onSendStart: () => setIsLoading(true),
    onSendEnd: () => setIsLoading(false),
  });

  const onSend = useCallback(async (message: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: message,
      role: 'user',
      timestamp: Date.now(),
    };
    addChatMessage(userMessage);

    // Send to AI
    await handleSend(message);
  }, [handleSend, addChatMessage]);

  const renderMessage = useCallback(({ item }: { item: ChatMessage }) => (
    <MessageBubble 
      message={item}
      onCopy={handleCopy}
      onShare={handleShare}
    />
  ), []);

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ChatHeader />
      
      <FlatList
        ref={flatListRef}
        data={chatMessages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {isLoading && <TypingIndicator />}

      <ChatInput 
        onSend={onSend}
        onVoice={handleVoiceInput}
        disabled={isLoading}
      />
    </KeyboardAvoidingView>
  );
};
```

---

## 🌍 GLOBAL COMPONENTS

### **Always Present in App:**

```typescript
// app/_layout.tsx

export default function RootLayout() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        {/* Global Components */}
        <SoundPlayer />        {/* Always listening */}
        <MiniPlayer />         {/* Always showing current track */}
        <BackgroundEffects />  {/* Always rendering effects */}
        
        {/* App Navigation */}
        <Stack>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="modal" />
        </Stack>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
```

---

### **SoundPlayer (Global)**

```typescript
// src/components/SoundPlayer.tsx

export const SoundPlayer: React.FC = () => {
  const { soundTrigger, soundsEnabled } = useThemeStore();
  const { isPlaying, currentTrack, volume } = useMusicStore();
  const playerRef = useRef<AudioPlayer | null>(null);

  // Handle UI sounds
  useEffect(() => {
    if (!soundsEnabled || !soundTrigger) return;

    const playSound = async () => {
      const player = createAudioPlayer(SOUND_ASSETS[soundTrigger.type]);
      player.volume = 0.2;
      player.play();
    };

    playSound();

    return () => {
      if (playerRef.current) {
        playerRef.current.release();
        playerRef.current = null;
      }
    };
  }, [soundTrigger, soundsEnabled]);

  // Handle music playback
  useEffect(() => {
    if (!currentTrack) {
      if (playerRef.current) {
        playerRef.current.pause();
        playerRef.current.release();
        playerRef.current = null;
      }
      return;
    }

    const player = createAudioPlayer(currentTrack.url);
    player.volume = volume;
    player.play();
    playerRef.current = player;

    return () => {
      if (playerRef.current) {
        playerRef.current.release();
      }
    };
  }, [currentTrack]);

  return null; // No UI, just functionality
};
```

---

### **MiniPlayer (Global)**

```typescript
// src/components/MiniPlayer.tsx

export const MiniPlayer: React.FC = () => {
  const { currentTrack, isPlaying, play, pause } = useMusicStore();
  const { colors } = useTheme();
  const navigation = useNavigation();

  if (!currentTrack) return null;

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.card }]}
      onPress={() => navigation.navigate('music-player')}
      accessibilityLabel="Müzik çalar"
      accessibilityRole="button"
    >
      <View style={styles.trackInfo}>
        <Text style={[styles.title, { color: colors.text }]}>
          {currentTrack.title}
        </Text>
        <Text style={[styles.artist, { color: colors.subText }]}>
          {currentTrack.artist}
        </Text>
      </View>

      <TouchableOpacity 
        onPress={isPlaying ? pause : play}
        accessibilityLabel={isPlaying ? "Duraklat" : "Oynat"}
        accessibilityRole="button"
      >
        {isPlaying ? (
          <Pause size={24} color={colors.text} />
        ) : (
          <Play size={24} color={colors.text} />
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );
};
```

---

## 🎯 COMPONENT PATTERNS

### **1. React.memo for Performance**

```typescript
// ✅ DO: Memoize presentational components
export const MessageBubble = React.memo(({ message, onCopy }) => {
  // ...
});

// ❌ DON'T: Memoize everything
export const Screen = React.memo(() => {
  // Screens rarely benefit from memo
});
```

---

### **2. useCallback for Event Handlers**

```typescript
// ✅ DO: Stabilize callback references
const handleSend = useCallback(async (message: string) => {
  // ...
}, [dependencies]);

<ChatInput onSend={handleSend} />  // Won't re-render unnecessarily
```

---

### **3. Compound Components**

```typescript
// Flexible component API
<Card>
  <Card.Header>
    <Card.Title>Title</Card.Title>
  </Card.Header>
  <Card.Content>
    <p>Content here</p>
  </Card.Content>
  <Card.Footer>
    <Button>Action</Button>
  </Card.Footer>
</Card>
```

---

### **4. Render Props**

```typescript
// Flexible rendering
<ErrorBoundary fallback={(error) => (
  <CustomError error={error} />
)}>
  <MyComponent />
</ErrorBoundary>
```

---

## ✅ BEST PRACTICES

### **DO:**

```typescript
✅ Single responsibility
// One component = one job
<MessageBubble />  // Just renders message
<ChatInput />      // Just handles input

✅ Descriptive names
<MessageBubble />  // Clear what it does
<Item />           // ❌ Too vague

✅ Prop types
interface Props {
  message: ChatMessage;
  onSend: (text: string) => void;
  disabled?: boolean;
}

✅ Default values
const Component = ({ 
  disabled = false, 
  placeholder = 'Enter text' 
}: Props) => { ... };

✅ Accessibility
<TouchableOpacity
  accessibilityLabel="Send message"
  accessibilityRole="button"
  accessibilityState={{ disabled }}
/>

✅ React.memo for pure UI
export const MessageBubble = React.memo(({ message }) => { ... });
```

---

### **DON'T:**

```typescript
❌ God components
// Don't do everything in one component
const GodComponent = () => {
  // Fetch data
  // Handle state
  // Render UI
  // Handle navigation
  // Send analytics
  // ... NO! Split it!
};

❌ Prop drilling
// Don't pass through 5 levels
<Level1 user={user}>
  <Level2 user={user}>
    <Level3 user={user}>
      <Level4 user={user}>  // STOP!
        <Display name={user.name} />
      </Level4>
    </Level3>
  </Level2>
</Level1>

// Use context or store instead!

❌ Inline styles
// Don't create new objects every render
<View style={{ padding: 10, margin: 5 }} />  // ❌

// Use StyleSheet
const styles = StyleSheet.create({
  container: { padding: 10, margin: 5 }
});

❌ Business logic in UI
// Don't mix logic with presentation
const BadComponent = () => {
  const calculateComplexValue = () => { ... };  // ❌ Move to utility
  return <View>{calculateComplexValue()}</View>;
};
```

---

## 📚 EXAMPLES

### **Component Checklist:**

```markdown
## Before Creating Component

- [ ] Single responsibility?
- [ ] Clear name?
- [ ] Props typed?
- [ ] Accessibility added?
- [ ] Memo if needed?
- [ ] Testable?
- [ ] Documented?
```

---

### **Component Template:**

```typescript
// src/components/MyComponent.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from './ThemeProvider';

interface MyComponentProps {
  /** Title to display */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Callback when pressed */
  onPress?: () => void;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * MyComponent - Brief description
 * 
 * Usage:
 * <MyComponent 
 *   title="Hello" 
 *   subtitle="World"
 *   onPress={handlePress}
 * />
 */
export const MyComponent = React.memo(({ 
  title, 
  subtitle,
  onPress,
  disabled = false
}: MyComponentProps) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: colors.card },
        disabled && styles.disabled
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={`${title} ${subtitle || ''}`}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        {title}
      </Text>
      {subtitle && (
        <Text style={[styles.subtitle, { color: colors.subText }]}>
          {subtitle}
        </Text>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
  },
  disabled: {
    opacity: 0.5,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
});
```

---

## 📊 COMPONENT METRICS

```
Total Components: 16+

Breakdown:
├── Presentational: 8 (50%)
│   ├── MessageBubble
│   ├── ChatInput
│   ├── ChatHeader
│   ├── TypingIndicator
│   ├── ThemedButton
│   ├── ThemedCard
│   ├── EmptyState
│   └── CustomAlert
│
├── Container: 4 (25%)
│   ├── AIChatScreen
│   ├── HomeScreen
│   ├── SettingsScreen
│   └── MusicPlayerScreen
│
└── Global: 4 (25%)
    ├── SoundPlayer
    ├── MiniPlayer
    ├── BackgroundEffects
    └── ThemeProvider
```

---

## 📖 KAYNAKLAR

- [React Components](https://react.dev/learn)
- [React Native Components](https://reactnative.dev/docs/components-and-apis)
- [Aurora Architecture](./ARCHITECTURE.md)
- [Aurora Testing](./TESTING_BEST_PRACTICES.md)

---

**Son Güncelleme:** 27 Mart 2026  
**Versiyon:** 1.0  
**Durum:** ✅ Production Ready
