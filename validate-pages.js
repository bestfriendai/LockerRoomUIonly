#!/usr/bin/env node

/**
 * Comprehensive page validation script
 * Checks each screen/page for proper implementation
 */

const fs = require('fs');
const path = require('path');

// Define all pages/screens to validate
const pagesToValidate = [
  // Auth screens
  { path: 'app/(auth)/index.tsx', type: 'auth', name: 'Auth Index' },
  { path: 'app/(auth)/signin.tsx', type: 'auth', name: 'Sign In' },
  { path: 'app/(auth)/signup.tsx', type: 'auth', name: 'Sign Up' },
  { path: 'app/(auth)/forgot-password.tsx', type: 'auth', name: 'Forgot Password' },
  { path: 'app/(auth)/reset-password.tsx', type: 'auth', name: 'Reset Password' },
  { path: 'app/(auth)/profile-setup.tsx', type: 'auth', name: 'Profile Setup' },
  { path: 'app/(auth)/location.tsx', type: 'auth', name: 'Location Setup' },
  
  // Main tabs
  { path: 'app/(tabs)/index.tsx', type: 'tab', name: 'Home/Reviews' },
  { path: 'app/(tabs)/search.tsx', type: 'tab', name: 'Search' },
  { path: 'app/(tabs)/create.tsx', type: 'tab', name: 'Create Review' },
  { path: 'app/(tabs)/chat.tsx', type: 'tab', name: 'Chat' },
  { path: 'app/(tabs)/profile.tsx', type: 'tab', name: 'Profile' },
  
  // Individual screens
  { path: 'app/chat/[id].tsx', type: 'screen', name: 'Chat Room' },
  { path: 'app/profile/[id].tsx', type: 'screen', name: 'User Profile' },
  { path: 'app/profile/edit.tsx', type: 'screen', name: 'Edit Profile' },
  { path: 'app/profile/privacy.tsx', type: 'screen', name: 'Privacy Settings' },
  { path: 'app/review/[id].tsx', type: 'screen', name: 'Review Details' },
  { path: 'app/notifications.tsx', type: 'screen', name: 'Notifications' },
  { path: 'app/modal.tsx', type: 'screen', name: 'Modal' },
  { path: 'app/+not-found.tsx', type: 'screen', name: 'Not Found' },
  
  // Root layout
  { path: 'app/_layout.tsx', type: 'layout', name: 'Root Layout' },
];

// Validation checks
const validationChecks = {
  auth: [
    'useAuth hook imported and used',
    'Form validation implemented',
    'Error handling present',
    'Loading states handled',
    'Navigation after success'
  ],
  tab: [
    'useAuth hook for user state',
    'Theme provider used',
    'Proper data fetching',
    'Loading states',
    'Error boundaries'
  ],
  screen: [
    'Proper imports',
    'State management',
    'Navigation handling',
    'Error handling'
  ],
  layout: [
    'Providers properly wrapped',
    'AuthGuard implemented',
    'Error boundary present',
    'Font loading handled'
  ]
};

function validatePage(pageInfo) {
  const { path: filePath, type, name } = pageInfo;
  
  if (!fs.existsSync(filePath)) {
    return { name, status: 'MISSING', issues: [`File ${filePath} not found`] };
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  const checks = validationChecks[type] || [];

  // Common validation checks
  if (!content.includes('export default')) {
    issues.push('Missing default export');
  }

  if (content.includes('console.log') && !content.includes('__DEV__')) {
    issues.push('Console.log statements should be guarded with __DEV__');
  }

  if (content.includes(': any') && !content.includes('// @ts-ignore')) {
    issues.push('Contains any types that should be more specific');
  }

  // Type-specific checks
  switch (type) {
    case 'auth':
      if (!content.includes('useAuth')) {
        issues.push('Missing useAuth hook');
      }
      if (!content.includes('useState') && !content.includes('useReducer')) {
        issues.push('No state management detected');
      }
      if (!content.includes('try') && !content.includes('catch')) {
        issues.push('No error handling detected');
      }
      break;

    case 'tab':
      if (!content.includes('useTheme')) {
        issues.push('Missing theme integration');
      }
      if (!content.includes('SafeAreaView') && !content.includes('useSafeAreaInsets')) {
        issues.push('No safe area handling');
      }
      break;

    case 'screen':
      if (!content.includes('useRouter') && !content.includes('router')) {
        issues.push('No navigation handling detected');
      }
      break;

    case 'layout':
      if (!content.includes('AuthProvider')) {
        issues.push('Missing AuthProvider');
      }
      if (!content.includes('ThemeProvider')) {
        issues.push('Missing ThemeProvider');
      }
      if (!content.includes('AuthGuard')) {
        issues.push('Missing AuthGuard');
      }
      break;
  }

  // Check for proper TypeScript usage
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    if (!content.includes('interface') && !content.includes('type ') && content.length > 500) {
      issues.push('Large file without TypeScript interfaces/types');
    }
  }

  // Check for accessibility
  if (content.includes('<Text') && !content.includes('accessibilityLabel')) {
    issues.push('Text components missing accessibility labels');
  }

  const status = issues.length === 0 ? 'PASS' : issues.length <= 2 ? 'WARN' : 'FAIL';
  return { name, status, issues };
}

// Run validation
console.log('🔍 Validating all pages and screens...\n');

const results = pagesToValidate.map(validatePage);

// Report results
let passCount = 0;
let warnCount = 0;
let failCount = 0;

results.forEach(result => {
  const { name, status, issues } = result;
  
  let icon = '✅';
  if (status === 'WARN') {
    icon = '⚠️';
    warnCount++;
  } else if (status === 'FAIL') {
    icon = '❌';
    failCount++;
  } else if (status === 'PASS') {
    passCount++;
  }

  console.log(`${icon} ${name} - ${status}`);
  
  if (issues.length > 0) {
    issues.forEach(issue => console.log(`   • ${issue}`));
  }
  console.log();
});

// Summary
console.log('📊 Validation Summary:');
console.log(`✅ Pass: ${passCount}`);
console.log(`⚠️  Warn: ${warnCount}`);
console.log(`❌ Fail: ${failCount}`);
console.log(`📄 Total: ${results.length}`);

if (failCount === 0) {
  console.log('\n🎉 All critical validations passed!');
} else {
  console.log(`\n🔧 ${failCount} pages need attention`);
}
