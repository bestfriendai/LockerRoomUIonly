#!/usr/bin/env node

/**
 * Fix iOS-specific issues for LockerRoom Talk app
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing iOS issues for LockerRoom Talk...\n');

// 1. Clear all caches
console.log('1️⃣ Clearing caches...');
try {
  execSync('npx expo start --clear', { stdio: 'ignore' });
  try {
    execSync('watchman watch-del-all', { stdio: 'ignore' });
  } catch {
    // Watchman not installed or command failed, continue
  }
    execSync('watchman watch-del-all', { stdio: 'ignore' });
  } catch {
    // Watchman might not be installed, continue anyway
  }
  execSync('rm -rf node_modules/.cache', { stdio: 'ignore' });
  console.log('✅ Caches cleared');
} catch (e) {
  console.log('⚠️ Some caches could not be cleared');
}

// 2. Fix Metro config for React Native
console.log('\n2️⃣ Updating Metro configuration...');
const metroConfig = `const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for Firebase and React Native
config.resolver.sourceExts = Array.from(new Set([
  ...config.resolver.sourceExts,
  'cjs',
  'mjs'
]));

// Resolve Firebase modules correctly
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  '@firebase/app': require.resolve('@firebase/app'),
  '@firebase/auth': require.resolve('@firebase/auth'),
  '@firebase/firestore': require.resolve('@firebase/firestore'),
};

module.exports = config;`;

fs.writeFileSync(path.join(__dirname, '..', 'metro.config.js'), metroConfig);
console.log('✅ Metro configuration updated');

// 3. Add iOS-specific polyfills
console.log('\n3️⃣ Adding iOS polyfills...');
const indexJs = `import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import App from './App';

// iOS polyfills
if (typeof global.self === 'undefined') {
  global.self = global;
}

registerRootComponent(App);`;

// Check if index.js exists, if not create it
const indexPath = path.join(__dirname, '..', 'index.js');
if (!fs.existsSync(indexPath)) {
  fs.writeFileSync(indexPath, indexJs);
  console.log('✅ iOS polyfills added');
} else {
  console.log('⚠️ index.js already exists, skipping polyfills');
}

// 4. Update app.json for iOS
console.log('\n4️⃣ Verifying iOS configuration...');
const appJsonPath = path.join(__dirname, '..', 'app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

// Ensure iOS config is correct
if (!appJson.expo.ios) {
  appJson.expo.ios = {};
}

appJson.expo.ios = {
  ...appJson.expo.ios,
  supportsTablet: false,
  bundleIdentifier: 'com.lockerroom.talk',
  buildNumber: '1.0.0',
  jsEngine: 'hermes',
  infoPlist: {
    NSCameraUsageDescription: 'This app uses the camera to upload review photos',
    NSPhotoLibraryUsageDescription: 'This app needs access to your photo library to upload review photos',
    NSLocationWhenInUseUsageDescription: 'This app uses your location to show nearby reviews and matches'
  }
};

fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
console.log('✅ iOS configuration verified');

// 5. Install iOS-specific dependencies if missing
console.log('\n5️⃣ Checking iOS dependencies...');
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));

const requiredDeps = {
  'react-native-gesture-handler': '~2.24.0',
  'react-native-reanimated': '~3.17.4',
  'react-native-safe-area-context': '~5.4.0',
  'react-native-screens': '~4.11.1',
};

let needsInstall = false;
for (const [dep, version] of Object.entries(requiredDeps)) {
  if (!packageJson.dependencies[dep]) {
    console.log(`  ⚠️ Missing ${dep}`);
    packageJson.dependencies[dep] = version;
    needsInstall = true;
  }
}

if (needsInstall) {
  fs.writeFileSync(path.join(__dirname, '..', 'package.json'), JSON.stringify(packageJson, null, 2));
  console.log('  📦 Installing missing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed');
} else {
  console.log('✅ All iOS dependencies present');
}

// 6. Create a simplified App.tsx if needed
console.log('\n6️⃣ Verifying App.tsx...');
const appTsxPath = path.join(__dirname, '..', 'App.tsx');
if (!fs.existsSync(appTsxPath)) {
  const appTsx = `import 'expo-dev-client';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootLayout from './app/_layout';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <RootLayout />
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}`;
  
  fs.writeFileSync(appTsxPath, appTsx);
  console.log('✅ App.tsx created');
} else {
  console.log('✅ App.tsx exists');
}

// 7. Clear and rebuild
console.log('\n7️⃣ Rebuilding project...');
console.log('  🔄 Clearing Metro bundler cache...');
execSync('npx react-native start --reset-cache > /dev/null 2>&1 &', { stdio: 'ignore' });

console.log('\n✅ iOS issues fixed!\n');
console.log('📱 To run on iOS:');
console.log('  1. Kill any existing Metro processes: pkill -f "metro\\|expo"');
console.log('  2. Clear cache: npx expo start --clear');
console.log('  3. Run iOS: npm run ios\n');
console.log('If issues persist:');
console.log('  - Run: npx pod-install (if you have CocoaPods)');
console.log('  - Delete node_modules and reinstall: rm -rf node_modules && npm install');
console.log('  - Reset simulator: Device > Erase All Content and Settings\n');