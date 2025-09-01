# Frontend Guideline Document

## 1. Frontend Architecture

### Overview

Our frontend is a **React Native** app built with **Expo**, written in **TypeScript**. We use **Expo Router** (backed by React Navigation) for navigation, and a combination of **React Context API** and **Zustand** for state management. Firebase services (Authentication, Firestore, Storage) power the backend, but this repo focuses solely on UI and client-side logic.

### Key Layers

*   **Entry Point**: `app/_layout.tsx` checks auth state via `AuthProvider` and directs users into `(auth)` or `(tabs)` stacks.
*   **Navigation**: File-system routing with Expo Router. Screens are grouped into folders: `(auth)` for login flows; `(tabs)` for main app tabs.
*   **Providers**: Global contexts wrap the app—`AuthProvider`, `ChatProvider`, `NotificationProvider`, and `ThemeProvider`—to supply user session, real-time chat data, notifications, and theming values.
*   **Services & Utilities**: Files like `authService.ts`, `chatService.ts`, and `reviewService.ts` abstract Firebase calls. Utilities handle input sanitization, network status (via NetInfo), and Firestore connection with polling fallback.
*   **Components**: A library of reusable UI components under `components/ui` (Button, Input, Card, Avatar, Modal, LoadingSkeleton, etc.).

### Scalability, Maintainability, and Performance

*   **Modular Folder Structure**: Grouped by feature and function—screens, components, providers, services—so new features slot in easily.
*   **Type Safety**: TypeScript enforces correct data shapes, reducing runtime errors and simplifying refactoring.
*   **Context & Zustand**: Context API covers broad app state (auth, chat, notifications, theme). Zustand handles local or ephemeral state (e.g., form inputs), keeping contexts slim.
*   **Animation on Native Thread**: React Native Reanimated and Moti ensure smooth animations without blocking the JS thread.
*   **Lazy Data Fetching**: Firestore queries are paginated or filtered to minimize payloads; we show loading skeletons or spinners to improve perceived performance.

## 2. Design Principles

1.  **Usability**: Clear flows, familiar patterns (bottom tabs, forms with labels), and immediate feedback (loading indicators, error messages).
2.  **Accessibility**: High-contrast color palettes, meaningful accessibility labels on buttons and inputs, and focus indicators for keyboard users.
3.  **Responsiveness**: Flexible layouts using tokens for spacing and sizing so screens adapt to different device dimensions.
4.  **Consistency**: A shared design language—components, color tokens, typography—across the entire app.
5.  **Privacy-First**: Anonymous usernames by default, clear privacy toggles, and unobtrusive prompts for optional location sharing.

*Application:* Every Screen uses the same `Header`, `Button`, and `Input` components. Forms validate inputs in real time. Empty or error states show friendly illustrations and messages.

## 3. Styling and Theming

### Styling Approach

*   **Design Tokens**: All colors, spacing, typography, and shadows are defined in `constants/colors.ts`, `spacing.ts`, `shadows.ts`, and `styles/typography.ts`. We rely on React Native’s `StyleSheet` API for consistency and performance.
*   **ThemeProvider**: Supplies light/dark mode values. Consumers use a `useTheme()` hook to pick colors and spacing.

### Theming

*   **Light & Dark Modes**: Two sets of color tokens automatically switch based on system preferences or user choice.
*   **Dynamic Accent**: Accent color can be overridden for special events or seasons via the theme context.

### Visual Style

*   **Style Style**: Modern flat design with gentle shadows to create depth (material-inspired).
*   **Animations**: Subtle transitions and micro-interactions (button presses, screen fades) via Reanimated and Moti.

### Color Palette

|                 |            |           |                    |
| --------------- | ---------- | --------- | ------------------ |
| Token           | Light Mode | Dark Mode | Usage              |
| `primary`       | #1E88E5    | #90CAF9   | Buttons, links     |
| `secondary`     | #FF7043    | #FFAB91   | Accent highlights  |
| `background`    | #F5F5F5    | #121212   | Screen backgrounds |
| `surface`       | #FFFFFF    | #1E1E1E   | Cards, modals      |
| `textPrimary`   | #212121    | #E0E0E0   | Main text          |
| `textSecondary` | #757575    | #B0B0B0   | Subtext, captions  |
| `error`         | #D32F2F    | #EF9A9A   | Error messages     |
| `success`       | #388E3C    | #A5D6A7   | Success messages   |

### Typography

*   **Font Family**: “Inter” for all text.
*   **Scale**: Heading, subheading, body, caption defined in `styles/typography.ts`.

## 4. Component Structure

### Organization

*   `components/ui/` holds generic, reusable building blocks (Button, Input, Avatar, Card, Modal, Skeleton).
*   `features/` folders combine screens with related components and services (e.g., `features/reviews/`, `features/chat/`).
*   Shared hooks (`useAuth`, `useChat`, `useTheme`) live in `hooks/`.

### Reusability & Maintainability

*   **Single Responsibility**: Each component does one thing (e.g., `LoadingSkeleton` only renders a placeholder).
*   **Styling via Props**: Components accept style overrides and variant props (e.g., `Button variant="primary" size="large"`).
*   **Storybook (optional)**: We can integrate Storybook to visualize components in isolation.

## 5. State Management

### Global State

*   **React Context API**: Four main providers wrap the app:

    *   `AuthProvider`: user session, login status
    *   `ChatProvider`: active chat rooms, message streams
    *   `NotificationProvider`: in-app notifications list
    *   `ThemeProvider`: current theme, color tokens

### Local & Ephemeral State

*   **Zustand**: Used for small-scale, isolated state (form values, toggle states) where Context would be overkill.

### Data Flow

1.  UI triggers a service call (e.g., `authService.signIn`).
2.  Service updates Firestore or Firebase Auth.
3.  Provider listens for auth or Firestore events and updates context state.
4.  UI re-renders based on new context values.

## 6. Routing and Navigation

*   **Expo Router**: File-based routing. Folders named `(auth)` and `(tabs)` map to authentication and main navigation stacks.
*   **React Navigation** under the hood powers transitions, deep linking, and safe area handling.

### Navigation Structure

`app/ ├─ (auth)/ │ ├─ signin.tsx │ ├─ signup.tsx │ ├─ forgot-password.tsx │ └─ profile-setup.tsx ├─ (tabs)/ │ ├─ index.tsx # Discover/Home │ ├─ search.tsx │ ├─ create.tsx │ ├─ chat.tsx │ └─ profile.tsx └─ chat/[id].tsx # Chat thread`

*   **Deep Linking**: Configured to open specific screens from external URLs or notifications.

## 7. Performance Optimization

*   **Animation Thread**: All complex animations run on the native UI thread via Reanimated.
*   **Lazy Loading**: Screens and heavy components are dynamically imported where possible.
*   **Pagination & Query Limits**: Firestore reads are batched and paginated to reduce payload sizes.
*   **Asset Optimization**: Images are resized on upload (via `expo-image-picker`) and cached locally.
*   **Memoization**: `React.memo` and `useMemo` prevent unnecessary re-renders of pure components.

## 8. Testing and Quality Assurance

### Unit Tests

*   **Jest**: Covers utility functions (sanitizers, formatters) and service calls (mocked Firebase).

### Integration & Component Tests

*   **React Native Testing Library**: Renders components in isolation, simulates user interaction (typing, pressing buttons), and asserts UI changes.

### End-to-End (Optional)

*   We can integrate **Detox** or **Appium** for automated end-to-end flows (sign-in → create review → chat).

### Linting & Static Analysis

*   **ESLint**: Enforces code style and catches potential bugs.
*   **Prettier**: Keeps formatting consistent.
*   **TypeScript**: Builds with `tsc --noEmit` to catch type errors before release.

### CI/CD Checks

*   **GitHub Actions**: Run lint, type checks, and tests on every pull request.
*   **Expo E2E/OTA**: After passing CI, Expo builds binaries and publishes OTA updates.

## 9. Conclusion and Overall Frontend Summary

This document lays out our **React Native + Expo** frontend with **TypeScript**, **Expo Router**, and a mix of **Context API** and **Zustand** for state. We’ve defined:

*   A **modular architecture** for scalability and clarity.
*   **Design principles** focused on usability, accessibility, and consistency.
*   A **flat modern style** with defined tokens for color and typography.
*   **Component-based** patterns that promote reuse and ease of testing.
*   Strategies for **performance** (native-thread animations, pagination) and **resilience** (network monitoring, error boundaries).
*   A **testing suite** powered by Jest and React Native Testing Library, enforced via CI.

Together, these guidelines ensure that any developer—regardless of prior familiarity with the codebase—can confidently build, maintain, and extend the LockerRoom Talk UI while delivering a polished and reliable user experience.
