# 🤝 Contributing to Aurora

**Oluşturulma Tarihi:** 27 Mart 2026  
**Yazar:** Aurora Development Team  
**Seviye:** All Levels  
**Okuma Süresi:** 8 dakika

---

## 👋 WELCOME!

Thanks for your interest in contributing to Aurora! This guide will help you get started.

---

## 📋 TABLE OF CONTENTS

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Setup](#development-setup)
4. [Making Changes](#making-changes)
5. [Pull Request Guidelines](#pull-request-guidelines)
6. [Coding Standards](#coding-standards)
7. [Testing](#testing)
8. [Documentation](#documentation)

---

## 🎯 CODE OF CONDUCT

### **Our Pledge:**

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Keep discussions professional
- No harassment or discrimination

---

## 🚀 GETTING STARTED

### **Ways to Contribute:**

```
✅ Code (features, bug fixes)
✅ Documentation (guides, translations)
✅ Testing (unit tests, E2E tests)
✅ Design (UI/UX improvements)
✅ Bug reports
✅ Feature suggestions
✅ Community help
```

---

## 🛠️ DEVELOPMENT SETUP

### **1. Fork and Clone:**

```bash
# Fork the repository on GitHub
# Then clone your fork:
git clone https://github.com/YOUR_USERNAME/aurora.git
cd aurora
```

### **2. Install Dependencies:**

```bash
npm install
```

### **3. Start Development:**

```bash
# Start Expo
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

### **4. Run Tests:**

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run type check
npm run typecheck

# Run lint
npm run lint
```

---

## 📝 MAKING CHANGES

### **1. Create a Branch:**

```bash
# Always branch from main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-fix-name
```

### **Branch Naming:**

```
✅ feature/add-new-theme
✅ fix/memory-leak-soundplayer
✅ docs/update-readme
✅ test/add-logger-tests
✅ refactor/split-background-effects

❌ patch-1
❌ fix
❌ my-branch
```

---

### **2. Make Changes:**

```bash
# Edit files
# Make sure to:
# - Follow coding standards
# - Add tests for new features
# - Update documentation
# - Run lint and typecheck
```

### **Commit Messages:**

```bash
# Use conventional commits
git commit -m "feat: add new cyberpunk theme"
git commit -m "fix: resolve memory leak in SoundPlayer"
git commit -m "docs: update installation guide"
git commit -m "test: add logger unit tests"
git commit -m "refactor: split BackgroundEffects component"
```

**Format:**
```
type: subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Tests
- `chore`: Maintenance

---

### **3. Push Changes:**

```bash
git push origin feature/your-feature-name
```

---

## 🔄 PULL REQUEST GUIDELINES

### **Before Submitting:**

```markdown
## PR Checklist

- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Type check passing
- [ ] Lint passing
- [ ] No console.log statements
- [ ] Accessibility considered
- [ ] Breaking changes documented
```

---

### **PR Description Template:**

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)

## Testing
Describe how you tested your changes

## Screenshots (if applicable)
Add screenshots of UI changes

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
```

---

## 📏 CODING STANDARDS

### **TypeScript:**

```typescript
// ✅ DO: Use TypeScript types
interface User {
  id: string;
  name: string;
  email: string;
}

// ❌ DON'T: Use any
const user: any = {};

// ✅ DO: Use proper return types
const getUser = async (id: string): Promise<User> => { ... }

// ❌ DON'T: Omit return types
const getUser = async (id: string) => { ... }
```

---

### **React:**

```typescript
// ✅ DO: Use functional components
export const MyComponent = ({ title }: Props) => {
  return <View>{title}</View>;
};

// ❌ DON'T: Use class components (unless necessary)

// ✅ DO: Use hooks properly
const MyComponent = () => {
  const [state, setState] = useState(initialValue);
  const value = useMemo(() => computeExpensive(state), [state]);
  const handler = useCallback(() => doSomething(), [dependencies]);
  
  return <View />;
};

// ❌ DON'T: Call hooks conditionally
const MyComponent = ({ condition }) => {
  if (condition) {
    useEffect(() => { ... });  // ❌ WRONG!
  }
};
```

---

### **Logging:**

```typescript
// ✅ DO: Use logger
import { auroraLogger as logger } from '@/utils/logger';

logger.info('User action', 'Auth', { userId: '123' });
logger.error('API failed', 'API', { error: e.message });

// ❌ DON'T: Use console.log
console.log('Debug info');  // ❌
```

---

### **Error Handling:**

```typescript
// ✅ DO: Use Result type
import { Result, success, error } from '@/types/result';

const fetchData = async (): Promise<Result<Data>> => {
  try {
    const data = await api.call();
    return success(data);
  } catch (e) {
    return error<Data>('Failed to fetch', 'FETCH_ERROR');
  }
};

// ❌ DON'T: Return empty strings
const fetchData = async (): Promise<string> => {
  try {
    return await api.call();
  } catch (e) {
    return "";  // ❌ Silent failure!
  }
};
```

---

### **Accessibility:**

```typescript
// ✅ DO: Add accessibility props
<TouchableOpacity
  onPress={handlePress}
  accessibilityLabel="Send message"
  accessibilityRole="button"
  accessibilityState={{ disabled }}
>
  <Send size={24} />
</TouchableOpacity>

// ❌ DON'T: Skip accessibility
<TouchableOpacity onPress={handlePress}>
  <Send size={24} />
</TouchableOpacity>
```

---

## 🧪 TESTING

### **Test Requirements:**

```
✅ New features MUST have tests
✅ Bug fixes SHOULD have regression tests
✅ Critical paths MUST be tested
✅ Target coverage: 30%+
```

---

### **Running Tests:**

```bash
# Run all tests
npm test

# Run specific test file
npm test -- src/utils/__tests__/logger.test.ts

# Run with coverage
npm run test:coverage

# Run in CI mode
npm run test:ci
```

---

### **Writing Tests:**

```typescript
// src/utils/__tests__/example.test.ts

describe('MyFunction', () => {
  it('should return expected value', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = myFunction(input);
    
    // Assert
    expect(result).toBe('expected');
  });

  it('should handle edge case', () => {
    // Arrange
    const input = '';
    
    // Act
    const result = myFunction(input);
    
    // Assert
    expect(result).toBe('default');
  });
});
```

---

## 📚 DOCUMENTATION

### **Documentation Requirements:**

```
✅ New features MUST be documented
✅ API changes MUST be documented
✅ Breaking changes MUST be noted
✅ Code examples SHOULD be provided
```

---

### **Documentation Files:**

```
docs/
├── ARCHITECTURE.md
├── COMPONENT_GUIDE.md
├── ERROR_HANDLING_BEST_PRACTICES.md
├── LOGGER_USAGE.md
├── TESTING_BEST_PRACTICES.md
└── CONTRIBUTING.md (this file)
```

---

### **Updating Documentation:**

```markdown
## When to Update Docs

- New feature added → Update relevant guide
- API changed → Update API docs
- Breaking change → Update migration guide
- Bug fixed → Update troubleshooting if needed
```

---

## 🐛 BUG REPORTS

### **Bug Report Template:**

```markdown
## Description
Clear description of the bug

## Reproduction Steps
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- Device: [e.g., iPhone 14]
- OS: [e.g., iOS 17.0]
- App Version: [e.g., 1.0.0]

## Screenshots
If applicable

## Additional Context
Any other details
```

---

## 💡 FEATURE SUGGESTIONS

### **Feature Request Template:**

```markdown
## Problem Statement
What problem does this solve?

## Proposed Solution
How should it work?

## Alternatives Considered
Other solutions you've thought about

## Use Cases
Who will use this and how?

## Additional Context
Mockups, examples, etc.
```

---

## 📊 CONTRIBUTION FLOW

```
1. Find issue or create feature
         ↓
2. Comment "I'll work on this"
         ↓
3. Fork repository
         ↓
4. Create branch
         ↓
5. Make changes
         ↓
6. Test locally
         ↓
7. Commit (conventional commits)
         ↓
8. Push to fork
         ↓
9. Create Pull Request
         ↓
10. Code review
         ↓
11. Address feedback
         ↓
12. Merge to main ✅
```

---

## 🏆 RECOGNITION

### **Contributors:**

All contributors will be added to the [CONTRIBUTORS.md](./CONTRIBUTORS.md) file.

**Significant contributions:**
- Core features
- Major bug fixes
- Comprehensive documentation
- Community help

---

## ❓ QUESTIONS?

### **Get Help:**

- 📧 Email: support@metaframe.studio (placeholder)
- 💬 GitHub Discussions
- 🐛 GitHub Issues
- 📖 Documentation: `/docs`

---

## 📖 KAYNAKLAR

- [Aurora Architecture](./ARCHITECTURE.md)
- [Aurora Component Guide](./COMPONENT_GUIDE.md)
- [Aurora Error Handling](./ERROR_HANDLING_BEST_PRACTICES.md)
- [Aurora Logger](./LOGGER_USAGE.md)
- [Aurora Testing](./TESTING_BEST_PRACTICES.md)

---

**Son Güncelleme:** 27 Mart 2026  
**Versiyon:** 1.0  
**Durum:** ✅ Production Ready
