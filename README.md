# 🌅 Aurora

**AI DJ for Your Mind & Music**

A minimalist, offline-first music player with AI-powered personalization. Experience your music like never before with an intelligent DJ that understands your vibe.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-green.svg)
![License](https://img.shields.io/badge/license-MIT-yellow.svg)
![Tests](https://img.shields.io/badge/tests-7%20files-green.svg)
![Docs](https://img.shields.io/badge/docs-6%20files-blue.svg)

---

## 📚 Documentation

| Guide | Description |
|-------|-------------|
| [🏗️ Architecture](./docs/ARCHITECTURE.md) | High-level overview, state management, navigation |
| [🧩 Components](./docs/COMPONENT_GUIDE.md) | Component types, patterns, best practices |
| [🛡️ Error Handling](./docs/ERROR_HANDLING_BEST_PRACTICES.md) | Result type pattern, user-facing errors |
| [📝 Logger](./docs/LOGGER_USAGE.md) | Logging setup, usage, production logging |
| [🧪 Testing](./docs/TESTING_BEST_PRACTICES.md) | Unit tests, integration tests, CI/CD |
| [🤝 Contributing](./docs/CONTRIBUTING.md) | How to contribute, coding standards |

**New to Aurora?** Start with [Architecture](./docs/ARCHITECTURE.md) → [Components](./docs/COMPONENT_GUIDE.md) → [Testing](./docs/TESTING_BEST_PRACTICES.md)

---

## ✨ Features

### 🎵 Music Playback
- Play local music files from your device
- Create and manage custom playlists
- Shuffle and repeat modes
- Beautiful full-screen player with lyrics support
- Mini player for seamless multitasking

### 🤖 AI DJ
- **Multi-Provider Support**: Google Gemini, Groq, and local Ollama models
- **Natural Control**: Chat with your AI to change themes, add music, adjust settings
- **Custom Personas**: Define your AI's personality
- **Smart Actions**: AI can execute app commands through conversation
- **Chat History**: Last 50 messages saved locally

### 🎨 Theme System
- **35+ Premium Themes**: Cyberpunk, Matrix, Cosmos, Nebula, and more
- **Dynamic Themes**: Music rhythm-based theme transitions
- **Custom Themes**: Create themes with AI or manually
- **Light/Dark/System** mode support

### 🌊 Background Effects
- **18+ Animated Effects**: Bokeh, Quantum, Waves, DNA, Matrix, and more
- **Dynamic Switching**: Effects respond to your music
- **Custom Effects**: AI-generated background configurations

### 🔒 Privacy First
- **100% Offline**: No internet required (except AI features)
- **Zero Data Collection**: Your data stays on your device
- **Local Storage**: SQLite + MMKV for fast, secure storage
- **No Ads**: Clean, uninterrupted experience

### 🌍 Internationalization
- English and Turkish support
- Auto-detect device language
- Easy to extend with more languages

---

## 🔒 Security Note

### Local Network Connections (HTTP)
For local AI integration (Ollama and Stable Diffusion), Aurora uses standard **HTTP** connections to communicate with services running on your local machine or LAN. 
- **Ollama**: Connects via `http://[IP]:[PORT]/api/chat`
- **Stable Diffusion**: Connects via `http://[IP]:[PORT]/sdapi/v1/txt2img`

> [!IMPORTANT]
> Since these connections are unencrypted (HTTP), they are intended for use within **trusted local networks** only. If exposing these services over a public network, it is highly recommended to use a reverse proxy with HTTPS (like Nginx or Caddy).

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
# Clone the repository
git clone https://github.com/neurodivergent-dev/aurora.git
cd aurora

# Install dependencies
npm install

# Start the development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on Web
npm run web
```

### Clean Install (if needed)

```bash
# Windows PowerShell
.\clean-reinstall.ps1

# Reset Metro cache
.\reset-metro.ps1
```

---

## 📱 Screenshots

> Add your screenshots here:
> - `assets/screenshots/home.png`
> - `assets/screenshots/player.png`
> - `assets/screenshots/ai-chat.png`
> - `assets/screenshots/themes.png`

---

## 🏗️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | React Native + Expo SDK 55 |
| **Language** | TypeScript |
| **Navigation** | expo-router (file-based) |
| **State** | Zustand + persist middleware |
| **Storage** | MMKV, AsyncStorage, SecureStore |
| **Database** | expo-sqlite |
| **AI** | Google Gemini, Groq, Ollama |
| **Media** | expo-av |
| **Animations** | react-native-reanimated |
| **Icons** | lucide-react-native |
| **i18n** | i18next + react-i18next |
| **Testing** | Jest + Testing Library |

---

## 📂 Project Structure

```
aurora/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation
│   │   ├── index.tsx      # Library
│   │   ├── playlists.tsx
│   │   ├── ai-chat.tsx
│   │   └── settings.tsx
│   ├── music-player.tsx
│   └── _layout.tsx
│
├── src/
│   ├── components/        # Reusable UI components
│   ├── screens/           # Screen components
│   ├── store/             # Zustand stores
│   ├── services/          # Business logic
│   ├── lib/               # Core utilities (database)
│   ├── hooks/             # Custom hooks
│   ├── utils/             # Helper functions
│   ├── constants/         # Themes, categories, prompts
│   └── i18n/              # Translations
│
├── assets/
│   ├── images/            # Icons, splash screens
│   ├── fonts/             # Custom fonts
│   └── sounds/            # Default music tracks
│
├── scripts/               # Build scripts
├── scripts/               # Build scripts
└── package.json
```

---

## 🎯 Configuration

### AI Setup

To use AI features, configure your API keys in the app settings:

1. Open **Settings** → **AI Settings**
2. Choose your provider (Gemini, Groq, or Ollama)
3. Enter your API key
4. Start chatting with your AI DJ

### Package ID

- **iOS Bundle ID**: `com.metaframe.aurora`
- **Android Package**: `com.metaframe.aurora`

To change, update `app.json` and rebuild.

---

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run in CI mode
npm run test:ci

# Type check
npm run typecheck

# Lint
npm run lint
```

### Coverage Targets

| Directory | Target | Status |
|-----------|--------|--------|
| `src/utils` | 80% | ✅ 70% |
| `src/store` | 80% | 🟡 40% |
| `src/hooks` | 70% | 🟡 30% |
| `src/services` | 70% | 🟡 25% |
| **Overall** | **30%** | **🟡 ~10%** |

📖 **Learn More:** [Testing Best Practices](./docs/TESTING_BEST_PRACTICES.md)

---

## 🚀 Building for Production

### Android

```bash
# Build APK
eas build --platform android --profile preview

# Build for Play Store
eas build --platform android --profile production
```

### iOS

```bash
# Build for TestFlight
eas build --platform ios --profile production
```

### EAS Configuration

See [eas.json](./eas.json) for build profiles.

---

## 📄 Features Roadmap

- [ ] Spotify/Apple Music integration
- [ ] Smart playlists (AI-generated)
- [ ] Social sharing features
- [ ] Widget support
- [ ] CarPlay / Android Auto
- [ ] More AI providers (Claude, local LLMs)
- [ ] Advanced audio EQ
- [ ] Sleep timer with fade-out

---

## 🤝 Contributing

Contributions are welcome! We appreciate all types of contributions:

- 🐛 Bug reports
- 💡 Feature suggestions
- 📝 Documentation improvements
- 🧪 Test additions
- 🎨 Design enhancements
- 🌍 Translations

### Getting Started

1. Read [Contributing Guide](./docs/CONTRIBUTING.md)
2. Read [Architecture Overview](./docs/ARCHITECTURE.md)
3. Fork the repository
4. Create a feature branch (`git checkout -b feature/amazing-feature`)
5. Make your changes (follow [coding standards](./docs/CONTRIBUTING.md#coding-standards))
6. Write tests (see [Testing Guide](./docs/TESTING_BEST_PRACTICES.md))
7. Commit your changes (`git commit -m 'feat: add amazing feature'`)
8. Push to the branch (`git push origin feature/amazing-feature`)
9. Open a Pull Request

### Code Style

- ✅ TypeScript for all code
- ✅ ESLint + Prettier configured
- ✅ Logger instead of console.log
- ✅ Error handling with Result type
- ✅ Accessibility labels on touchables
- ✅ Tests for new features

📖 **Full Guide:** [CONTRIBUTING.md](./docs/CONTRIBUTING.md)

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 👨‍💻 About MetaFrame

Aurora is developed by **MetaFrame**, a studio focused on creating smart tools for modern life.

### Other Apps by MetaFrame

- **FocusTabs** - Productivity & Focus
- **Mindbook Pro** - Mental Health & Journaling
- **Mindbook Trial** - Free version
- **Aurora** - AI Music Player (this app)

🌐 **Publisher Page:** [APPLION - MetaFrame](https://applion.jp/android/developer/MetaFrame/)

---

## 📚 Additional Resources

### Documentation

- [🏗️ Architecture Overview](./docs/ARCHITECTURE.md)
- [🧩 Component Guide](./docs/COMPONENT_GUIDE.md)
- [🛡️ Error Handling Best Practices](./docs/ERROR_HANDLING_BEST_PRACTICES.md)
- [📝 Logger Usage Guide](./docs/LOGGER_USAGE.md)
- [🧪 Testing Best Practices](./docs/TESTING_BEST_PRACTICES.md)
- [🤝 Contributing Guide](./docs/CONTRIBUTING.md)

### Project Status

- [Code Analysis Report](./qwen.md)
- [Features Roadmap](./features/)
- [Manual Tests](./manual_tests.md)
- [Code Review Guidelines](./code_review.md)

### Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Expo Router Documentation](https://expo.github.io/router/)
- Icons by [Lucide](https://lucide.dev)
- AI by [Google Gemini](https://ai.google.dev) & [Groq](https://groq.com)
- State management by [Zustand](https://zustand-demo.pmnd.rs)

---

## 📬 Contact

- **GitHub**: [@neurodivergent-dev](https://github.com/neurodivergent-dev)
- **Project Link**: [github.com/neurodivergent-dev/aurora](https://github.com/neurodivergent-dev/aurora)

---

**Made with ❤️ and AI**

*"Your music, amplified by intelligence."*
