# Project Requirements Document (PRD)

## 1. Project Overview

LockerRoom Talk is a cross-platform mobile app (iOS & Android, with potential web support) that lets users anonymously share and read dating reviews, join real-time chat rooms, and discover new connections. This UI-only implementation provides every screen, component, and interaction logic—while delegating data storage, authentication, and real-time syncing to Firebase services (Authentication, Cloud Firestore, Storage). It’s all built in React Native with Expo and TypeScript.

We’re building this to give users a safe, privacy-first space for honest dating feedback and social interaction. Success means delivering a polished, responsive UI with smooth animations and clear feedback; enabling seamless sign-up, profile setup, review creation, chat messaging, search/discovery, and notifications; and setting a rock-solid foundation for future backend enhancements.

## 2. In-Scope vs. Out-of-Scope

**In-Scope (v1.0 UI-Only)**

*   User authentication screens (Sign Up, Sign In, Forgot/Reset Password)
*   Profile setup & edit flows (name, age, bio, anonymous username, privacy toggles)
*   Review system UI (create review form, masonry feed, filters, like/share buttons)
*   Real-time chat UI (list of rooms, chat thread view, send text/images)
*   Search & Discover screens (universal search bar, discover feed)
*   In-app notifications screen (read/unread status)
*   Navigation setup (Expo Router with `(auth)` and `(tabs)` stacks, bottom tabs)
*   Custom UI components library (Button, Input, Card, Avatar, Modal, Loading skeletons)
*   Animations (React Native Reanimated & Moti)
*   Error boundary & global error handler
*   Network status monitoring & offline/online UI feedback
*   Integration stubs for Firebase services (calling auth, Firestore, storage APIs)
*   Basic unit & integration tests for UI flows

**Out-of-Scope (v1.0)**

*   Any custom backend implementation (all backend calls go to Firebase)
*   Push notifications (device push)
*   Analytics/dashboard for admin users
*   Payment integration
*   Video/audio calling or media streaming
*   Multi-language/localization support (English-only v1)
*   Full offline data persistence (beyond basic Firestore caching)

## 3. User Flow

A new user opens the app and lands on the splash screen. The app checks authentication status via `AuthProvider`. If not signed in, the user is shown the `(auth)` flow: they can Sign Up (email + password), then fill out their profile (name, age, bio), choose an anonymous handle, and optionally allow location services. If they forget their password, they use the Forgot/Reset screens. Once their account and profile are set, they’re routed into the main `(tabs)` experience.

An authenticated user sees a bottom tab navigator with five tabs:

1.  **Discover** – a masonry-style feed of reviews with location or category filters.
2.  **Search** – a global search interface for reviews, users, and chat rooms.
3.  **Create** – the review creation form (title, content, rating, category, images).
4.  **Chat** – list of chat rooms and direct message threads; tapping one opens real-time messaging.
5.  **Profile** – view/edit personal profile, adjust privacy, see own reviews, visit others’ profiles.

Throughout, visual feedback (loading spinners, skeletons, empty-state screens) and animated transitions guide the user. Network changes trigger offline banners and retry logic in data-fetching services.

## 4. Core Features

*   **Authentication & Authorization**\
    • Sign Up / Sign In / Sign Out / Password Reset\
    • Demo login option\
    • `AuthProvider` for session persistence
*   **Profile Management**\
    • Profile creation & editing (name, age, bio)\
    • Anonymous username generation\
    • Privacy toggles per profile field\
    • Optional location permission
*   **Review System**\
    • Create review form (title, body, rating, category, target)\
    • Masonry-style review feed\
    • Like/unlike/share buttons\
    • Category & location filtering
*   **Real-Time Chat**\
    • Public chat rooms & direct messages\
    • Chat list & chat thread screens\
    • Text/image sending via `chatService`\
    • `ChatProvider` for live updates
*   **Search & Discovery**\
    • Universal search bar (reviews, users, rooms)\
    • Dynamic filtering & result list
*   **Notifications**\
    • In-app notifications screen\
    • Read/unread status toggles\
    • `NotificationProvider`
*   **UI Components & Animations**\
    • Reusable UI library (Button, Input, Card, Modal, Avatar)\
    • Smooth transitions with Reanimated & Moti\
    • Loading skeletons & error/empty states
*   **Error Handling & Resilience**\
    • Global ErrorBoundary & custom error alerts\
    • Network status monitoring with NetInfo\
    • Firestore connection manager with polling fallback
*   **Data Security & Integrity**\
    • Input sanitization utilities\
    • Client-side data validation\
    • Stub calls to Firebase security rules

## 5. Tech Stack & Tools

*   **Frontend:**\
    • React Native (with Expo)\
    • Expo Router for file-based navigation\
    • TypeScript
*   **State Management:**\
    • React Context API & custom providers\
    • Zustand (for localized state)
*   **Backend Services (via Firebase):**\
    • Firebase Authentication\
    • Cloud Firestore\
    • Firebase Storage
*   **Navigation:**\
    • React Navigation (Expo Router abstraction)
*   **UI & Styling:**\
    • Lucide React Native icons\
    • Custom design tokens (colors, spacing, typography)
*   **Animations:**\
    • React Native Reanimated\
    • Moti
*   **Utilities & APIs:**\
    • `@react-native-async-storage/async-storage`\
    • `@react-native-community/netinfo`\
    • `expo-image-picker`, `expo-location`\
    • `lodash`, `date-fns`, `uuid`
*   **Testing & Tooling:**\
    • Jest & React Native Testing Library\
    • ESLint, Babel, Metro
*   **AI-Assisted Development:**\
    • Claude Code (in-terminal coding assistant)\
    • Cline (collaborative AI partner)

## 6. Non-Functional Requirements

*   **Performance:**\
    • Screen loads under 200ms on mid-range devices\
    • Animations 60fps target\
    • Use skeletons/spinners to mask network delays
*   **Security & Compliance:**\
    • All inputs sanitized before submission\
    • Firebase security rules enforced for data reads/writes\
    • No personal data stored locally beyond session tokens
*   **Usability & Accessibility:**\
    • WCAG-inspired color contrast\
    • Accessible labels on interactive elements\
    • Responsive layouts for varied screen sizes
*   **Reliability & Resilience:**\
    • Automated retry on network failures\
    • Graceful offline indicators and limited fallback caching
*   **Maintainability:**\
    • Clear folder structure (features, components, services, providers)\
    • Type-safe interfaces (TypeScript)\
    • Modular, reusable components

## 7. Constraints & Assumptions

*   Requires reliable Firebase service availability (Auth, Firestore, Storage).
*   Expo managed workflow (no native code modifications in v1).
*   Assumes users will grant location permission for location-based features.
*   Network connectivity may be intermittent; offline mode is limited to Firestore cache.
*   AI tools (Claude Code, Cline) assumed accessible in developer environment.

## 8. Known Issues & Potential Pitfalls

*   **Firebase Rate Limits:** Heavy chat or review traffic could hit Firestore limits.\
    *Mitigation:* Implement query batching, limit real-time listeners, and paginate.
*   **Animation Jank on Low-End Devices:** Complex Reanimated sequences may drop frames.\
    *Mitigation:* Optimize animation hooks, use `useNativeDriver`, reduce simultaneous transitions.
*   **Race Conditions in Auth Flow:** Rapid navigation changes can confuse `AuthProvider`.\
    *Mitigation:* Debounce auth state changes and guard against unmounted components.
*   **Network Flapping:** Frequent online/offline toggles may cause repeated retries.\
    *Mitigation:* Introduce exponential backoff in polling manager.
*   **Ambiguous Privacy Settings:** Users might misunderstand what “anonymous” entails.\
    *Mitigation:* Provide clear tooltips and onboarding tips around anonymity.

This document provides a clear, unambiguous foundation for the UI-only LockerRoom Talk app. AI-driven components, folder structures, detailed service interfaces, and testing strategies can now be generated confidently from this PRD.
