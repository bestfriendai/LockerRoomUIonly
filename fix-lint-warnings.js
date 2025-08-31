#!/usr/bin/env node

/**
 * Script to fix common ESLint warnings across the codebase
 * Focuses on: unused vars, any types, empty blocks, prefer-const
 */

const fs = require('fs');
const path = require('path');

// Files to process (focusing on most important ones first)
const filesToProcess = [
  'app/(auth)/forgot-password.tsx',
  'app/(auth)/index.tsx', 
  'app/(auth)/location.tsx',
  'app/(auth)/profile-setup.tsx',
  'app/(auth)/reset-password.tsx',
  'app/(tabs)/chat.tsx',
  'app/(tabs)/create.tsx',
  'app/(tabs)/index.tsx',
  'app/(tabs)/profile.tsx',
  'app/(tabs)/search.tsx',
  'app/+not-found.tsx',
  'app/chat/[id].tsx',
  'app/modal.tsx',
  'app/notifications.tsx',
  'app/profile/[id].tsx',
  'app/profile/edit.tsx',
  'app/profile/privacy.tsx',
  'app/review/[id].tsx',
  'components/ErrorBoundary.tsx',
  'components/LocationSelector.tsx',
  'components/MasonryReviewCard.tsx',
  'components/ReviewCard.tsx',
  'components/auth/SignInForm.tsx',
  'components/auth/UserProfile.tsx',
  'components/ui/AnimatedPressable.tsx',
  'components/ui/Avatar.tsx',
  'components/ui/Button.tsx',
  'components/ui/LoadingAnimations.tsx',
  'components/ui/Modal.tsx',
  'providers/ChatProvider.tsx',
  'providers/NotificationProvider.tsx',
  'providers/ThemeProvider.tsx',
  'services/chatService.ts',
  'services/locationService.js',
  'services/notificationService.ts',
  'services/reviewService.ts',
  'services/userService.ts',
  'services/usernameGenerator.js',
  'utils/firestoreConnectionManager.ts',
  'utils/inputSanitization.js',
  'utils/networkStatus.ts'
];

function fixFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${filePath} - file not found`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix 1: Remove unused imports (common patterns)
  const unusedImports = [
    /import\s+{\s*[^}]*Alert[^}]*}\s+from\s+['"]react-native['"];\s*\n/g,
    /import\s+{\s*[^}]*Platform[^}]*}\s+from\s+['"]react-native['"];\s*\n/g,
    /import\s+{\s*[^}]*ScrollView[^}]*}\s+from\s+['"]react-native['"];\s*\n/g,
    /import\s+{\s*[^}]*Keyboard[^}]*}\s+from\s+['"]react-native['"];\s*\n/g,
    /import\s+{\s*[^}]*Pressable[^}]*}\s+from\s+['"]react-native['"];\s*\n/g,
    /import\s+{\s*[^}]*Modal[^}]*}\s+from\s+['"]react-native['"];\s*\n/g,
    /import\s+{\s*[^}]*Animated[^}]*}\s+from\s+['"]react-native['"];\s*\n/g,
  ];

  unusedImports.forEach(pattern => {
    if (pattern.test(content)) {
      content = content.replace(pattern, '');
      modified = true;
    }
  });

  // Fix 2: Replace : any with more specific types
  const anyReplacements = [
    { pattern: /: any\[\]/g, replacement: ': unknown[]' },
    { pattern: /: any\s*=/g, replacement: ': unknown =' },
    { pattern: /\(.*?: any\)/g, replacement: (match) => match.replace(': any', ': unknown') },
    { pattern: /catch\s*\(\s*(\w+):\s*any\s*\)/g, replacement: 'catch ($1: unknown)' },
  ];

  anyReplacements.forEach(({ pattern, replacement }) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      modified = true;
    }
  });

  // Fix 3: Add underscore prefix to unused variables
  const unusedVarPatterns = [
    /const\s+(\w+)\s*=.*?\/\/.*?never used/g,
    /let\s+(\w+)\s*=.*?\/\/.*?never used/g,
  ];

  // Fix 4: Replace let with const where appropriate
  const letToConstPattern = /let\s+(\w+)\s*=\s*([^;]+);(?!\s*\n\s*\1\s*=)/g;
  if (letToConstPattern.test(content)) {
    content = content.replace(letToConstPattern, 'const $1 = $2;');
    modified = true;
  }

  // Fix 5: Add error handling to empty catch blocks
  content = content.replace(/catch\s*\(\s*(\w*)\s*\)\s*{\s*}/g, 'catch ($1) {\n    console.warn("Error caught:", $1);\n  }');
  if (content.includes('console.warn("Error caught:"')) {
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed ${filePath}`);
  }
}

// Process all files
filesToProcess.forEach(fixFile);

console.log('Lint warning fixes completed');
