# Tech Stack Document

This document explains the technology choices for the LockerRoom Talk UI-only app in plain English. It describes how each tool fits into the project, why it was picked, and how it benefits users and developers alike.

## 1. Frontend Technologies

These are the building blocks of the app’s user interface—what people see and interact with on their phones.

*   **React Native**\
    A popular framework that lets us write one codebase in JavaScript/TypeScript and run it on both iOS and Android devices. This saves time and keeps the user experience consistent across platforms.
*   **Expo**\
    A set of tools and services on top of React Native that simplifies setup, gives us access to phone features (camera, location, etc.) without writing native code, and handles building and publishing the app for us.
*   **Expo Router (with React Navigation under the hood)**\
    Lets us define screens and navigation using a familiar file-and-folder structure. It makes it clear how users move from one screen to another (for example, from sign-in screens into the main tabs).
*   **TypeScript**\
    Adds simple checks to our JavaScript code so we catch mistakes early. It ensures data (like user profiles or chat messages) has the right shape before we try to use it, reducing crashes and bugs.
*   **State Management**\
    • **React Context API (AuthProvider, ChatProvider, NotificationProvider, ThemeProvider)** for global settings and user session data.\
    • **Zustand** for smaller, localized bits of state (like a form’s temporary values).
*   **Styling & Icons**\
    • **Custom design tokens (colors, spacing, typography)** stored in simple files so the look and feel remain uniform.\
    • **Lucide React Native** for crisp, customizable icons throughout the app.
*   **Animations**\
    • **React Native Reanimated** and **Moti** to create smooth transitions (for example, sliding between chat messages or showing a loading skeleton). These libraries run animations on the device’s high-performance thread, avoiding janky motions.
*   **Utility Libraries**\
    • **lodash** for common helper functions (like deep-cloning objects),\
    • **date-fns** for working with dates,\
    • **uuid** for generating unique IDs,\
    • **@react-native-async-storage/async-storage** for saving small pieces of data on the device (like user preferences),\
    • **@react-native-community/netinfo** to monitor online/offline status,\
    • **expo-image-picker** and **expo-location** to let users select pictures or share their approximate location if they choose.

## 2. Backend Technologies

Although this project is UI-only, it relies on Firebase to handle everything on the server side.

*   **Firebase Authentication**\
    Securely manages user sign-up, sign-in, password reset, and session persistence without building our own login system.
*   **Cloud Firestore**\
    A real-time NoSQL database that stores user profiles, reviews, chat messages, and notifications. It keeps data in sync across devices automatically.
*   **Firebase Storage**\
    Stores user-uploaded images (profile pictures or review photos) and serves them efficiently.
*   **Security Rules**\
    Custom Firebase rules ensure only the right people can read or write certain pieces of data (for example, only the author can edit their own review).

## 3. Infrastructure and Deployment

This section covers where the code lives, how it’s tested, and how updates reach users.

*   **Version Control: Git & GitHub**\
    Our code is stored in a Git repository hosted on GitHub. This lets multiple developers collaborate safely and track every change.
*   **CI/CD (Continuous Integration / Continuous Deployment)**\
    We use GitHub Actions to automatically run tests (unit and UI) every time code is pushed, ensuring new changes don’t introduce bugs. When everything passes, Expo’s build service creates updated app packages for iOS and Android.
*   **Expo Build & Publish**\
    Expo handles building the native binaries and publishing them to Apple’s App Store and Google Play Store. It also offers Over-The-Air (OTA) updates, letting us fix minor issues and push UI updates instantly without requiring a full app-store release.
*   **Testing Tools**\
    • **Jest** for quick unit tests.\
    • **React Native Testing Library** for component and flow tests (simulating user interactions).\
    • **ESLint** and **Babel** ensure code style consistency and compatibility across devices.\
    • **Metro** is the bundler that packages our JavaScript code for mobile.

## 4. Third-Party Integrations

These external services add specific features without custom building them from scratch.

*   **Firebase Suite**\
    Authentication, real-time database, and storage, all managed by Google’s backend infrastructure.
*   **Device APIs via Expo**\
    • **Image Picker** for selecting or taking photos.\
    • **Location** for optional location sharing in user profiles or the discovery feed.\
    • **NetInfo** to detect connectivity changes and show offline banners or retry buttons.
*   **AI-Assisted Developer Tools**\
    • **Claude Code** and **Cline** help developers browse and modify code faster during development (in the terminal and collaborative settings).

## 5. Security and Performance Considerations

Ensuring users feel safe and the app stays snappy.

*   **Input Sanitization & Validation**\
    All user inputs go through functions that remove harmful characters and check required fields before sending data to the server.
*   **Secure Data Rules**\
    Firebase security rules prevent unauthorized reads and writes. For example, only the review’s author can delete it.
*   **Offline Resilience**\
    • Cached Firestore data lets users see recently viewed reviews and messages when offline.\
    • A custom connection manager retries failed requests with exponential backoff.
*   **Performance Optimizations**\
    • Animations run on a separate thread with Reanimated to avoid frame drops.\
    • Loading skeletons and spinners mask network delays, giving immediate visual feedback.\
    • Pagination and batched reads in Firestore limit how much data we fetch at once.

## 6. Conclusion and Overall Tech Stack Summary

We chose tools that balance developer productivity with a smooth, polished experience for users:

*   React Native + Expo: one codebase for iOS & Android, quick iteration, and easy access to device features.
*   TypeScript: catches errors early, making the app more reliable.
*   Firebase: handles authentication, real-time data, and media storage without custom servers.
*   React Context & Zustand: simple, scalable ways to share state across the app.
*   Reanimated & Moti: keeps animations fluid and responsive.
*   Expo’s CI/CD & OTA updates: let us fix small issues instantly and ship new features faster.

Together, these technologies provide a robust foundation for the LockerRoom Talk UI. They keep the app secure, performant, and easy to maintain, while allowing us to build on top of Firebase for backend services. This stack ensures that users enjoy a seamless, polished experience, and developers can focus on adding new features instead of reinventing core infrastructure.
