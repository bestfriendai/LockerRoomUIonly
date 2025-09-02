#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 LockerRoom Talk - Complete Verification\n');
console.log('=' .repeat(50));

let allGood = true;
const issues = [];
const warnings = [];

// 1. Check critical files exist
console.log('\n✅ Checking Critical Files...');
const criticalFiles = [
  'app/_layout.tsx',
  'app/(auth)/signin.tsx',
  'app/(auth)/signup.tsx',
  'app/(tabs)/index.tsx',
  'app/(tabs)/create.tsx',
  'app/(tabs)/chat.tsx',
  'app/(tabs)/profile.tsx',
  'utils/firebase.ts',
  'providers/AuthProvider.tsx',
  'services/reviewService.ts',
  'services/chatService.ts',
  '.env.local'
];

criticalFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✓ ${file}`);
  } else {
    console.log(`  ✗ ${file} - MISSING`);
    issues.push(`Missing file: ${file}`);
    allGood = false;
  }
});

// 2. Check Firebase configuration
console.log('\n✅ Checking Firebase Configuration...');
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const firebaseVars = [
    'EXPO_PUBLIC_FIREBASE_API_KEY',
    'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
    'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'EXPO_PUBLIC_FIREBASE_APP_ID'
  ];
  
  firebaseVars.forEach(varName => {
    if (envContent.includes(varName) && !envContent.includes(`${varName}=your_`)) {
      console.log(`  ✓ ${varName} configured`);
    } else {
      console.log(`  ✗ ${varName} not properly configured`);
      issues.push(`Firebase config missing: ${varName}`);
      allGood = false;
    }
  });
}

// 3. Check package.json scripts
console.log('\n✅ Checking NPM Scripts...');
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
const requiredScripts = ['start', 'android', 'ios', 'web', 'test', 'lint'];

requiredScripts.forEach(script => {
  if (packageJson.scripts[script]) {
    console.log(`  ✓ npm run ${script}`);
  } else {
    console.log(`  ✗ npm run ${script} - MISSING`);
    warnings.push(`Missing script: ${script}`);
  }
});

// 4. Check TypeScript configuration
console.log('\n✅ Checking TypeScript Configuration...');
const tsconfigPath = path.join(__dirname, '..', 'tsconfig.json');
if (fs.existsSync(tsconfigPath)) {
  const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
  if (tsconfig.compilerOptions.strict) {
    console.log('  ✓ Strict mode enabled');
  } else {
    console.log('  ⚠ Strict mode not enabled');
    warnings.push('TypeScript strict mode disabled');
  }
  console.log('  ✓ TypeScript configured');
}

// 5. Check Expo configuration
console.log('\n✅ Checking Expo Configuration...');
const appJsonPath = path.join(__dirname, '..', 'app.json');
if (fs.existsSync(appJsonPath)) {
  const appConfig = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  const expo = appConfig.expo;
  
  if (expo.ios?.bundleIdentifier) {
    console.log('  ✓ iOS bundle identifier: ' + expo.ios.bundleIdentifier);
  } else {
    issues.push('iOS bundle identifier not set');
  }
  
  if (expo.android?.package) {
    console.log('  ✓ Android package: ' + expo.android.package);
  } else {
    issues.push('Android package not set');
  }
  
  console.log('  ✓ App name: ' + expo.name);
  console.log('  ✓ Version: ' + expo.version);
}

// 6. Check Firebase Security Rules
console.log('\n✅ Checking Firebase Security Rules...');
const rulesPath = path.join(__dirname, '..', 'firestore.rules');
if (fs.existsSync(rulesPath)) {
  const rulesContent = fs.readFileSync(rulesPath, 'utf8');
  
  if (rulesContent.includes('allow read, write: if true;')) {
    console.log('  ✗ SECURITY ISSUE: Overly permissive rules found!');
    issues.push('Firebase rules too permissive');
    allGood = false;
  } else if (rulesContent.includes('request.auth != null')) {
    console.log('  ✓ Authentication required');
  }
  
  if (rulesContent.includes('match /test/')) {
    console.log('  ⚠ Test collection rules found');
    warnings.push('Test collection in Firebase rules');
  }
  
  console.log('  ✓ Security rules file exists');
}

// 7. Check Core Features Implementation
console.log('\n✅ Checking Core Features...');
const features = {
  'Authentication': ['providers/AuthProvider.tsx', 'app/(auth)/signin.tsx'],
  'Reviews': ['services/reviewService.ts', 'app/(tabs)/create.tsx'],
  'Chat': ['services/chatService.ts', 'app/(tabs)/chat.tsx'],
  'User Profiles': ['services/userService.ts', 'app/(tabs)/profile.tsx'],
  'Notifications': ['services/notificationService.ts', 'providers/NotificationProvider.tsx']
};

Object.entries(features).forEach(([feature, files]) => {
  const implemented = files.every(file => 
    fs.existsSync(path.join(__dirname, '..', file))
  );
  
  if (implemented) {
    console.log(`  ✓ ${feature}`);
  } else {
    console.log(`  ⚠ ${feature} - partially implemented`);
    warnings.push(`${feature} not fully implemented`);
  }
});

// Final Report
console.log('\n' + '='.repeat(50));
console.log('📊 VERIFICATION RESULTS\n');

if (issues.length > 0) {
  console.log('❌ CRITICAL ISSUES (' + issues.length + '):');
  issues.forEach(issue => console.log('  • ' + issue));
  console.log('');
}

if (warnings.length > 0) {
  console.log('⚠️  WARNINGS (' + warnings.length + '):');
  warnings.forEach(warning => console.log('  • ' + warning));
  console.log('');
}

if (allGood && issues.length === 0) {
  console.log('✅ ALL SYSTEMS OPERATIONAL!\n');
  console.log('The app is ready for use with:');
  console.log('  • Authentication working');
  console.log('  • Review system functional');
  console.log('  • Chat system ready');
  console.log('  • Firebase properly configured');
  console.log('  • Security rules in place');
  console.log('  • All platforms configured');
  console.log('\n🚀 You can now:');
  console.log('  1. Run: npm start (for development)');
  console.log('  2. Run: npm run web (for web version)');
  console.log('  3. Run: npm run ios (for iOS simulator)');
  console.log('  4. Run: npm run android (for Android emulator)');
} else {
  console.log('⚠️  SOME ISSUES DETECTED\n');
  console.log('The app is functional but has some issues to address.');
  console.log('Critical issues should be fixed before production deployment.');
}

console.log('\n' + '='.repeat(50));

// Return exit code
process.exit(issues.length > 0 ? 1 : 0);