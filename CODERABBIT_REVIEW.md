# CodeRabbit Review Instructions

## 🐰 About CodeRabbit

CodeRabbit is an AI-powered code review tool that provides comprehensive analysis of your codebase, including:
- Security vulnerabilities
- Performance issues
- Code quality problems
- Best practice violations
- Accessibility concerns
- Testing gaps

## 🚀 How to Trigger CodeRabbit Review

### Option 1: Via Pull Request (Recommended)
1. Make any change to the codebase
2. Create a pull request
3. CodeRabbit will automatically review the changes
4. Comment `@coderabbitai review` for a full review

### Option 2: Direct Commands
In any pull request, you can use these commands:
- `@coderabbitai review` - Full review of the PR
- `@coderabbitai summary` - Generate a summary
- `@coderabbitai resolve` - Mark comments as resolved
- `@coderabbitai help` - Show all available commands

## 📋 Review Checklist

### Security
- [ ] Authentication implementation (Firebase Auth)
- [ ] Session management (AsyncStorage)
- [ ] Data validation and sanitization
- [ ] API security and rate limiting
- [ ] Firestore security rules

### Performance
- [ ] Component optimization (React.memo, useMemo)
- [ ] Image loading and caching
- [ ] List rendering (FlashList)
- [ ] Bundle size optimization
- [ ] Memory leak prevention

### Code Quality
- [ ] TypeScript type safety
- [ ] Error handling patterns
- [ ] Code organization and structure
- [ ] Naming conventions
- [ ] Dead code elimination

### Best Practices
- [ ] React Native patterns
- [ ] Firebase patterns
- [ ] State management (Zustand)
- [ ] Navigation (Expo Router)
- [ ] Platform-specific code

### Testing
- [ ] Unit test coverage
- [ ] Integration tests
- [ ] Edge case handling
- [ ] Error scenarios
- [ ] Performance tests

## 🔍 Areas Requiring Special Attention

1. **Authentication Flow**
   - Sign in/sign up process
   - Session persistence
   - Password reset flow
   - Anonymous user handling

2. **Location Services**
   - Current location detection
   - Location permissions
   - Geolocation accuracy
   - Location-based filtering

3. **Real-time Features**
   - Chat functionality
   - Notifications
   - Live updates
   - Offline support

4. **Data Management**
   - Firestore queries
   - Data caching
   - Pagination
   - Search functionality

## 📊 Current Status

- **Platform**: React Native 0.79.5 + Expo 53
- **Backend**: Firebase (Auth, Firestore, Storage)
- **State**: Zustand + React Context
- **Navigation**: Expo Router (file-based)
- **Language**: TypeScript (strict mode)

## 🎯 Expected Outcomes

After CodeRabbit review, we expect:
1. Identification of security vulnerabilities
2. Performance optimization suggestions
3. Code quality improvements
4. Best practice recommendations
5. Accessibility enhancements
6. Testing strategy suggestions

## 📝 Notes for Reviewers

- The app is an anonymous dating review platform
- Focus on user privacy and data security
- Consider mobile performance constraints
- Review cross-platform compatibility
- Check accessibility features

---

To start the review process, create a pull request and mention @coderabbitai in the comments.