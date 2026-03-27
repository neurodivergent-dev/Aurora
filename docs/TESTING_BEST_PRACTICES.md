# 🧪 Aurora Testing Best Practices

**Oluşturulma Tarihi:** 27 Mart 2026  
**Yazar:** Aurora Development Team  
**Seviye:** Intermediate  
**Okuma Süresi:** 12 dakika

---

## 📋 İÇİNDEKİLER

1. [Neden Testing?](#neden-testing)
2. [Test Türleri](#test-türleri)
3. [Kurulum](#kurulum)
4. [Unit Tests](#unit-tests)
5. [Integration Tests](#integration-tests)
6. [Best Practices](#best-practices)
7. [Examples](#examples)
8. [CI/CD](#cicd)

---

## 🎯 NEDEN TESTING?

### **Testing Olmadan:**

```
❌ Manual testing her release'te
❌ "Works on my machine" syndrome
❌ Regression bugs (old features break)
❌ Refactoring fear ("Bir şey bozulur")
❌ User reports bugs (too late!)
```

### **Testing İle:**

```
✅ Automated testing (her commit'te)
✅ Confidence in changes
✅ Catch bugs BEFORE users
✅ Refactoring without fear
✅ Documentation through tests
```

---

## 📊 TEST TÜRLERİ

### **Testing Pyramid:**

```
        /\
       /  \
      / E2E \       ← Few (slow, expensive)
     /______\
    /        \
   /Integration\   ← Some (medium speed)
  /______________\
 /    Unit Tests   \ ← Many (fast, cheap)
/___________________\
```

---

### **Aurora'da Test Dağılımı:**

```
Unit Tests (7 files):
├── src/utils/__tests__/logger.test.ts ✅
├── src/utils/__tests__/backup.test.ts ✅
├── src/store/__tests__/aiStore.test.ts ✅
├── src/store/__tests__/dailyGoalsStore.test.ts ✅
├── src/services/__tests__/aiService.test.ts ✅
├── src/hooks/__tests__/useDailyReset.test.ts ✅
└── src/__tests__/utils/test-utils.ts ✅

Integration Tests (TODO):
├── AI Chat flow
├── Music playback flow
└── Theme switching flow

E2E Tests (TODO):
└── Full user journey (Detox/Maestro)
```

---

## 🛠️ KURULUM

### **Dependencies:**

```json
{
  "devDependencies": {
    "jest": "^29.7.0",
    "jest-expo": "~55.0.11",
    "@testing-library/react-native": "^13.3.3",
    "@testing-library/jest-native": "^5.4.3",
    "react-test-renderer": "19.2.0"
  }
}
```

### **Configuration:**

```javascript
// jest.config.js
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['./jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!**/__tests__/**',
    '!**/node_modules/**',
  ],
};
```

---

### **Setup File:**

```javascript
// jest.setup.js
import '@testing-library/jest-native/extend-expect';

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock react-native-logs
jest.mock('react-native-logs', () => ({
  logger: {
    createLogger: jest.fn(() => ({
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    })),
  },
  consoleTransport: jest.fn(),
}));
```

---

## 🧪 UNIT TESTS

### **Test Structure:**

```typescript
// src/utils/__tests__/logger.test.ts

import logger from '../logger';

// Mock the underlying logger
jest.mock('react-native-logs', () => {
  const mockLog = {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
  return {
    logger: {
      createLogger: jest.fn(() => mockLog),
    },
    consoleTransport: jest.fn(),
  };
});

describe('AuroraLogger', () => {
  const { logger: rnLogs } = require('react-native-logs');
  const mockLog = rnLogs.createLogger();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should log info with tag', () => {
    logger.info('test message', 'TestTag');
    expect(mockLog.info).toHaveBeenCalledWith('[TestTag] test message');
  });

  it('should log warn without tag', () => {
    logger.warn('test warning');
    expect(mockLog.warn).toHaveBeenCalledWith('test warning');
  });

  it('should log error with tag', () => {
    logger.error('test error', 'ErrorTag');
    expect(mockLog.error).toHaveBeenCalledWith('[ErrorTag] test error');
  });

  it('should log debug with tag', () => {
    logger.debug('test debug', 'DebugTag');
    expect(mockLog.debug).toHaveBeenCalledWith('[DebugTag] test debug');
  });
});
```

---

### **Test Patterns:**

```typescript
// AAA Pattern: Arrange, Act, Assert

it('should create playlist with valid data', () => {
  // Arrange
  const playlistName = 'My Playlist';
  const trackIds = ['track-1', 'track-2'];

  // Act
  createPlaylist(playlistName, trackIds);

  // Assert
  expect(state.myPlaylists).toHaveLength(1);
  expect(state.myPlaylists[0].name).toBe(playlistName);
  expect(state.myPlaylists[0].trackIds).toEqual(trackIds);
});
```

---

## 🔗 INTEGRATION TESTS

### **Example: AI Chat Flow:**

```typescript
// src/services/__tests__/aiService.integration.test.ts

import { aiService } from '../aiService';
import { useAIStore } from '../../store/aiStore';

describe('AI Service Integration', () => {
  beforeEach(() => {
    // Reset store state
    useAIStore.setState({
      apiKey: 'test-key',
      isAIEnabled: true,
      activeProvider: 'gemini',
    });
  });

  it('should chat with AI and parse commands', async () => {
    // Arrange
    const message = 'Change theme to cyberpunk';
    const history = [];

    // Act
    const response = await aiService.chat(message, history);

    // Assert
    expect(response).toContain('cyberpunk');
    expect(response).toContain('AURORA_COMMAND');
  });

  it('should handle API errors gracefully', async () => {
    // Arrange
    useAIStore.setState({ apiKey: 'invalid-key' });

    // Act
    const response = await aiService.chat('Hello', []);

    // Assert
    expect(response).toBeDefined();
    // Should not throw, should return empty or error message
  });
});
```

---

## ✅ BEST PRACTICES

### **DO:**

```typescript
✅ Test one thing per test
it('should create playlist', () => { ... });
it('should update playlist', () => { ... });
it('should delete playlist', () => { ... });

✅ Use descriptive names
it('should return error when API key is missing', () => { ... });

✅ Mock external dependencies
jest.mock('expo-secure-store');
jest.mock('@react-native-async-storage/async-storage');

✅ Test edge cases
it('should handle empty message', () => { ... });
it('should handle very long message', () => { ... });
it('should handle special characters', () => { ... });

✅ Use beforeEach for setup
beforeEach(() => {
  jest.clearAllMocks();
  resetStoreState();
});

✅ Test both success and failure
it('should succeed with valid input', () => { ... });
it('should fail with invalid input', () => { ... });
```

---

### **DON'T:**

```typescript
❌ Test multiple things in one test
it('should create and update and delete', () => { ... }); // NO!

❌ Use vague names
it('should work', () => { ... }); // What should work?!

❌ Skip mocking
// Real API calls = slow, flaky tests!

❌ Test implementation details
// Test behavior, not internal structure

❌ Ignore failures
// Red tests = broken code!
```

---

## 📚 EXAMPLES

### **Store Test:**

```typescript
// src/store/__tests__/aiStore.test.ts

import { useAIStore } from '../aiStore';

describe('AI Store', () => {
  beforeEach(() => {
    useAIStore.setState({
      apiKey: null,
      isAIEnabled: false,
      chatMessages: [],
    });
  });

  it('should set API key', async () => {
    // Arrange
    const testKey = 'test-api-key-123';

    // Act
    await useAIStore.getState().setApiKey(testKey);

    // Assert
    expect(useAIStore.getState().apiKey).toBe(testKey);
    expect(useAIStore.getState().isAIEnabled).toBe(true);
  });

  it('should add chat message', () => {
    // Arrange
    const message: ChatMessage = {
      id: 'msg-1',
      text: 'Hello AI',
      role: 'user',
      timestamp: Date.now(),
    };

    // Act
    useAIStore.getState().addChatMessage(message);

    // Assert
    expect(useAIStore.getState().chatMessages).toHaveLength(1);
    expect(useAIStore.getState().chatMessages[0]).toEqual(message);
  });

  it('should limit messages to 50', () => {
    // Arrange: Add 50 messages
    for (let i = 0; i < 50; i++) {
      useAIStore.getState().addChatMessage({
        id: `msg-${i}`,
        text: `Message ${i}`,
        role: 'user',
        timestamp: Date.now(),
      });
    }

    // Act: Add one more
    useAIStore.getState().addChatMessage({
      id: 'msg-51',
      text: 'Message 51',
      role: 'user',
      timestamp: Date.now(),
    });

    // Assert: Should still be 50 (oldest removed)
    expect(useAIStore.getState().chatMessages).toHaveLength(50);
  });
});
```

---

### **Service Test:**

```typescript
// src/services/__tests__/aiService.test.ts

import { aiService } from '../aiService';
import { useAIStore } from '../../store/aiStore';

describe('AI Service', () => {
  beforeEach(() => {
    useAIStore.setState({
      apiKey: 'test-key',
      isAIEnabled: true,
      activeProvider: 'gemini',
    });
  });

  it('should return empty string when AI disabled', async () => {
    // Arrange
    useAIStore.setState({ isAIEnabled: false });

    // Act
    const result = await aiService.chat('Hello', []);

    // Assert
    expect(result).toBe('');
  });

  it('should return empty string when no API key', async () => {
    // Arrange
    useAIStore.setState({ apiKey: null });

    // Act
    const result = await aiService.chat('Hello', []);

    // Assert
    expect(result).toBe('');
  });

  it('should handle network errors', async () => {
    // Arrange
    // Mock will throw error
    jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));

    // Act
    const result = await aiService.chat('Hello', []);

    // Assert
    expect(result).toBe('');
    // Should not throw!
  });
});
```

---

### **Hook Test:**

```typescript
// src/hooks/__tests__/useDailyReset.test.ts

import { renderHook, act } from '@testing-library/react-native';
import { useDailyReset } from '../useDailyReset';

describe('useDailyReset Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should check for daily reset on mount', () => {
    // Act
    renderHook(() => useDailyReset());

    // Assert
    expect(checkDailyReset).toHaveBeenCalled();
  });

  it('should reset goals if new day', () => {
    // Arrange
    const mockState = {
      lastResetDate: '2024-03-26',
      goals: [{ id: '1', completed: true }],
    };

    // Act
    renderHook(() => useDailyReset(), {
      initialProps: mockState,
    });

    jest.advanceTimersByTime(1000); // Wait for effect

    // Assert
    expect(resetGoals).toHaveBeenCalled();
  });
});
```

---

### **Component Test:**

```typescript
// src/components/__tests__/ChatInput.test.tsx

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ChatInput } from '../ChatInput';

describe('ChatInput Component', () => {
  it('should render input field', () => {
    // Arrange
    const onSend = jest.fn();

    // Act
    const { getByPlaceholderText } = render(
      <ChatInput onSend={onSend} disabled={false} />
    );

    // Assert
    expect(getByPlaceholderText('AI\'ye sor...')).toBeTruthy();
  });

  it('should call onSend when submit pressed', () => {
    // Arrange
    const onSend = jest.fn();
    const { getByPlaceholderText, getByTestId } = render(
      <ChatInput onSend={onSend} disabled={false} />
    );

    // Act
    const input = getByPlaceholderText('AI\'ye sor...');
    fireEvent.changeText(input, 'Hello AI');
    
    const sendButton = getByTestId('send-button');
    fireEvent.press(sendButton);

    // Assert
    expect(onSend).toHaveBeenCalledWith('Hello AI');
  });

  it('should be disabled when loading', () => {
    // Arrange
    const onSend = jest.fn();

    // Act
    const { getByTestId } = render(
      <ChatInput onSend={onSend} disabled={true} />
    );

    // Assert
    expect(getByTestId('send-button')).toBeDisabled();
  });
});
```

---

## 🚀 CI/CD

### **GitHub Actions:**

```yaml
# .github/workflows/test.yml

name: Tests

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run type check
        run: npm run typecheck

      - name: Run lint
        run: npm run lint

      - name: Run tests
        run: npm test -- --coverage --ci

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

---

### **Test Scripts:**

```json
{
  "scripts": {
    "test": "jest --watchAll",
    "test:ci": "jest --ci --forceExit --coverage",
    "test:coverage": "jest --coverage --coverageReporters=text --coverageReporters=lcov",
    "test:watch": "jest --watch",
    "test:clear": "jest --clearCache"
  }
}
```

---

## 📊 COVERAGE TARGETS

### **Aurora Coverage:**

```
Current:
├── Unit Tests: 7 files ✅
├── Coverage: ~10%
└── Critical Paths: Partially covered

v1.0 Target:
├── Unit Tests: 15 files
├── Coverage: 30%
└── Critical Paths: Fully covered

v2.0 Target:
├── Unit Tests: 30+ files
├── Coverage: 60%
└── Integration Tests: Added
```

---

### **Critical Paths to Test:**

```
Priority 1 (Must Test):
├── AI chat flow
├── Music playback
├── Theme switching
└── Data persistence

Priority 2 (Should Test):
├── Playlist management
├── Settings changes
├── Backup/Restore
└── Image generation

Priority 3 (Nice to Test):
├── UI components
├── Animations
├── Sound effects
└── Onboarding flow
```

---

## ✅ CHECKLIST

### **Before Merge:**

```markdown
## Testing Checklist

- [ ] New code has tests
- [ ] All tests passing
- [ ] Coverage not decreased
- [ ] Edge cases tested
- [ ] Error scenarios tested
- [ ] Mock external dependencies
- [ ] Test names are descriptive
- [ ] No skipped tests (fit/xit)
```

---

## 📖 KAYNAKLAR

- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [Aurora Error Handling](./ERROR_HANDLING_BEST_PRACTICES.md)
- [Aurora Logger](./LOGGER_USAGE.md)

---

**Son Güncelleme:** 27 Mart 2026  
**Versiyon:** 1.0  
**Durum:** ✅ Production Ready
