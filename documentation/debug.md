# Debugging Guide for LockerRoom Talk UI-Only Codebase

This guide walks you through strategies, tools, and common pitfalls when debugging the LockerRoom Talk React Native (Expo) UI implementation. It covers setup, authentication, navigation, UI, state, Firebase integration, networking, animations, and testing.

## 1. Setup Your Debug Environment

1.  Install React Native Debugger (RN Debugger) or Flipper.
2.  Enable Expo CLI logging: `expo start --dev-client` or `EXPO_DEBUG=true expo start`.
3.  In VS Code, use the React Native Tools extension to set breakpoints and step through code.
4.  Configure breakpoints in `metro.config.js` if you have custom transforms.

**Tip:** Connect the iOS/Android emulator or a physical device and open the in-app developer menu (Cmd + D on iOS, Cmd + M on Android) to enable remote debugging.

## 2. Authentication Flow Issues

### Common Symptoms

• Sign-up/sign-in screens hang or don’t navigate.\
• Password reset emails not sent.\
• Auth state never updates.

### Debug Steps

1.  Add `console.log` inside `AuthProvider`’s `onAuthStateChanged` callback.
2.  Check Firebase rules in the Firebase Console or via `firebase emulators:start`.
3.  Ensure `firebase.initializeApp(...)` is called before any auth APIs.
4.  Inspect network requests in Chrome DevTools (Remote JS Debugging) to verify the `identitytoolkit` calls.

**Example:**

`useEffect(() => { const unsub = auth().onAuthStateChanged(user => { console.log('Auth state:', user); setUser(user); }); return unsub; }, []);`

## 3. Navigation & Routing Problems

### Common Symptoms

• Expo Router doesn’t load the correct stack.\
• Params aren’t passed to screens.\
• Tabs disappear or freeze.

### Debug Steps

1.  Validate your file‐system path matches Expo Router conventions: `(auth)/signin.tsx`, `(tabs)/index.tsx`, etc.
2.  Insert `useFocusEffect(() => console.log('Screen focused'));` to confirm route activation.
3.  Inspect `route.params` in each screen:

`const { id } = useRoute().params as { id: string }; console.log('Chat ID:', id);`

1.  Upgrade `expo-router` to latest stable and re-run `npx expo prebuild` if you’ve changed native code.

## 4. UI & Styling Glitches

### Common Symptoms

• Layouts break on different screen sizes.\
• Colors or fonts don’t match designs.\
• Touchables don’t respond.

### Debug Steps

1.  Use React Native’s **Inspector** (Cmd + I) to examine views, margins, paddings, and z-index.
2.  Verify your design tokens in `constants/colors.ts` and `spacing.ts`.
3.  Ensure `StyleSheet.create({})` is used to avoid inline styles recalculations.
4.  Wrap custom `TouchableOpacity` or `Pressable` with `hitSlop` if taps are small.

**Tip:** Test on multiple device simulators and use Expo’s web build (`expo start --web`) to spot CSS-like issues early.

## 5. State Management & Context Bugs

### Common Symptoms

• Context values remain `undefined`.\
• Components don’t re-render on state update.

### Debug Steps

1.  Confirm your provider hierarchy wraps the entire app in `app/_layout.tsx`:

`<AuthProvider> <ChatProvider> <NotificationProvider>{children}</NotificationProvider> </ChatProvider> </AuthProvider>`

1.  In consumer components, add `console.log(useContext(AuthContext))`.
2.  If using Zustand, ensure your store hooks are called at top‐level (not inside conditionals).
3.  Memoize heavy context values with `useMemo` to avoid infinite re-renders.

## 6. Firebase Integration & Security Rules

### Common Symptoms

• Firestore reads/writes fail with permission errors.\
• Storage uploads return `403 Forbidden`.

### Debug Steps

1.  Test locally with Firebase Emulator Suite: `firebase emulators:start`.
2.  Run `firebase deploy --only firestore:rules` after each rule change.
3.  Use the Firebase Console logs to trace security rule evaluations.
4.  Inspect SDK calls:

`await firestore().collection('reviews').add(data) .catch(err => console.error('Firestore Error:', err));`

**Tip:** Write unit tests for security rules using the Firebase Emulator and `@firebase/rules-unit-testing`.

## 7. Network & Offline Resilience

### Common Symptoms

• App hangs when offline.\
• Polling manager thrashes Firestore.

### Debug Steps

1.  Use `@react-native-community/netinfo` to log connectivity changes:

`NetInfo.addEventListener(state => console.log('Connection:', state));`

1.  Inspect your polling logic in `firestoreConnectionManager.ts` for exponential backoff.
2.  Utilize Firestore’s built-in offline cache: `await firestore().enablePersistence();`.
3.  Show a persistent banner or modal when offline to avoid silent failures.

## 8. Animations & Performance Bottlenecks

### Common Symptoms

• Frame drops during transitions.\
• Excessive JS thread usage.

### Debug Steps

1.  Install React Native Reanimated DevTools for frame rate monitoring.
2.  Move heavy calculations off the JS thread with `useAnimatedStyle` and `worklet` functions.
3.  Reduce simultaneous animations or lower spring tension.
4.  Profile with `react-native-performance` or Flipper’s performance plugin.

## 9. Logging & Global Error Handling

1.  Ensure you have an `ErrorBoundary` at the root: catches render errors.
2.  Add a custom `errorHandler` in `App.tsx`:

`ErrorUtils.setGlobalHandler((error, isFatal) => { console.error(isFatal ? 'Fatal:' : 'Error:', error); // Show user-friendly alert });`

1.  Use Sentry or Logflare for production error aggregation.

## 10. Testing & Validating Fixes

1.  Write unit tests for components using **Jest** and **React Native Testing Library**.
2.  Add integration tests for flows (sign-up, review creation) with **Detox** or **Appium**.
3.  Run `npm test -- --coverage` to ensure critical logic is covered.
4.  Use snapshot tests sparingly—focus on behavior over markup.

## 11. Common Pitfalls & Quick Resolutions

• **Stale state in hooks:** Add proper dependency arrays.\
• **Unreachable code after network errors:** Always `.catch()` your promises.\
• **Over-nesting providers:** Simplify by grouping related contexts.\
• **Version mismatches:** Keep `expo`, `react-native`, and `firebase` SDKs aligned via `expo doctor`.

## 12. Additional Tools & Tips

*   **VS Code Extensions:** React Native Tools, ESLint, Prettier.
*   **Chrome Debugger:** `global.XMLHttpRequest = GLOBAL.originalXMLHttpRequest` workaround for network inspect.
*   **Flipper Plugins:** Layout Inspector, React DevTools, Hermes Debugger.
*   **Performance:** Profile memory and CPU in Xcode Instruments or Android Studio.

By following these steps and leveraging the recommended tools, you’ll be well-equipped to identify, diagnose, and resolve issues across the LockerRoom Talk UI codebase. Happy debugging!
