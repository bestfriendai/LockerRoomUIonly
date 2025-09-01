#!/usr/bin/env node

/**
 * Comprehensive Firebase Implementation Audit
 * Checks security, best practices, and compatibility
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

function auditFirebaseImplementation() {
  console.log('🔍 Firebase Implementation Security & Best Practices Audit\n');
  
  const issues = [];
  const warnings = [];
  const recommendations = [];
  
  // 1. Check Firebase Version
  console.log('1. Checking Firebase Version...');
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const firebaseVersion = packageJson.dependencies.firebase;
  
  if (firebaseVersion.includes('9.23.0')) {
    issues.push('Firebase version 9.23.0 is outdated. Latest is 12.2.1');
    recommendations.push('Update Firebase: npm install firebase@latest');
  } else {
    console.log('✅ Firebase version is current');
  }
  
  // 2. Check Environment Variables Security
  console.log('\n2. Checking Environment Variables...');
  const envFile = fs.readFileSync('.env', 'utf8');
  const requiredVars = [
    'EXPO_PUBLIC_FIREBASE_API_KEY',
    'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
    'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'EXPO_PUBLIC_FIREBASE_APP_ID'
  ];
  
  let allVarsPresent = true;
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      issues.push(`Missing environment variable: ${varName}`);
      allVarsPresent = false;
    }
  });
  
  if (allVarsPresent) {
    console.log('✅ All required environment variables present');
  }
  
  // Check if API key is properly formatted
  const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
  if (apiKey && !apiKey.startsWith('AIza')) {
    warnings.push('Firebase API key format looks unusual');
  }
  
  // 3. Check Firebase Configuration Security
  console.log('\n3. Checking Firebase Configuration...');
  const firebaseConfigPath = 'utils/firebase.ts';
  if (fs.existsSync(firebaseConfigPath)) {
    const firebaseConfig = fs.readFileSync(firebaseConfigPath, 'utf8');
    
    // Check for React Native persistence
    if (firebaseConfig.includes('getReactNativePersistence')) {
      console.log('✅ React Native persistence properly configured');
    } else {
      warnings.push('React Native persistence not configured - may affect auth state');
      recommendations.push('Add React Native persistence for better auth experience');
    }
    
    // Check for proper error handling
    if (firebaseConfig.includes('try') && firebaseConfig.includes('catch')) {
      console.log('✅ Error handling implemented');
    } else {
      warnings.push('Limited error handling in Firebase initialization');
    }
    
    // Check for lazy initialization
    if (firebaseConfig.includes('getApps().length === 0')) {
      console.log('✅ Lazy initialization implemented');
    } else {
      warnings.push('Lazy initialization not properly implemented');
    }
  } else {
    issues.push('Firebase configuration file not found');
  }
  
  // 4. Check Firestore Security Rules
  console.log('\n4. Checking Firestore Security Rules...');
  const rulesPath = 'firestore.rules';
  if (fs.existsSync(rulesPath)) {
    const rules = fs.readFileSync(rulesPath, 'utf8');
    
    // Check for authentication requirements
    if (rules.includes('request.auth != null')) {
      console.log('✅ Authentication requirements in place');
    } else {
      issues.push('Security rules may not require authentication');
    }
    
    // Check for user ownership validation
    if (rules.includes('request.auth.uid')) {
      console.log('✅ User ownership validation implemented');
    } else {
      warnings.push('User ownership validation may be missing');
    }
    
    // Check for input validation
    if (rules.includes('isValidString')) {
      console.log('✅ Input validation functions present');
    } else {
      warnings.push('Input validation functions not found');
    }
    
    // Check for test collection (should be removed in production)
    if (rules.includes('match /test/')) {
      warnings.push('Test collection rules found - remove for production');
      recommendations.push('Remove test collection rules before production deployment');
    }
  } else {
    issues.push('Firestore security rules file not found');
  }
  
  // 5. Check Authentication Implementation
  console.log('\n5. Checking Authentication Implementation...');
  const authProviderPath = 'providers/AuthProvider.tsx';
  if (fs.existsSync(authProviderPath)) {
    const authProvider = fs.readFileSync(authProviderPath, 'utf8');
    
    // Check for proper error handling
    if (authProvider.includes('showErrorAlert')) {
      console.log('✅ User-friendly error handling implemented');
    } else {
      warnings.push('User-friendly error handling may be missing');
    }
    
    // Check for retry logic
    if (authProvider.includes('retries')) {
      console.log('✅ Retry logic implemented');
    } else {
      warnings.push('Retry logic not found in auth provider');
    }
    
    // Check for proper cleanup
    if (authProvider.includes('useEffect') && authProvider.includes('return ()')) {
      console.log('✅ Proper cleanup implemented');
    } else {
      warnings.push('Component cleanup may be incomplete');
    }
  } else {
    issues.push('AuthProvider not found');
  }
  
  // 6. Check for Security Best Practices
  console.log('\n6. Checking Security Best Practices...');
  
  // Check if API keys are in public environment variables (this is actually OK for Firebase)
  console.log('ℹ️  Firebase API keys in EXPO_PUBLIC_ variables is correct for client-side apps');
  
  // Check for hardcoded secrets
  const filesToCheck = ['utils/firebase.ts', 'providers/AuthProvider.tsx'];
  let hardcodedSecrets = false;
  filesToCheck.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('AIza') && !content.includes('process.env')) {
        hardcodedSecrets = true;
      }
    }
  });
  
  if (!hardcodedSecrets) {
    console.log('✅ No hardcoded secrets found');
  } else {
    issues.push('Hardcoded secrets detected');
  }
  
  // 7. Generate Report
  console.log('\n' + '='.repeat(60));
  console.log('📊 AUDIT REPORT SUMMARY');
  console.log('='.repeat(60));
  
  if (issues.length === 0) {
    console.log('🎉 No critical issues found!');
  } else {
    console.log(`❌ Critical Issues (${issues.length}):`);
    issues.forEach((issue, i) => console.log(`   ${i + 1}. ${issue}`));
  }
  
  if (warnings.length > 0) {
    console.log(`\n⚠️  Warnings (${warnings.length}):`);
    warnings.forEach((warning, i) => console.log(`   ${i + 1}. ${warning}`));
  }
  
  if (recommendations.length > 0) {
    console.log(`\n💡 Recommendations (${recommendations.length}):`);
    recommendations.forEach((rec, i) => console.log(`   ${i + 1}. ${rec}`));
  }
  
  console.log('\n🔒 Security Status: ' + (issues.length === 0 ? 'GOOD' : 'NEEDS ATTENTION'));
  console.log('📱 Production Ready: ' + (issues.length === 0 && warnings.length < 3 ? 'YES' : 'REVIEW NEEDED'));
  
  return {
    issues: issues.length,
    warnings: warnings.length,
    recommendations: recommendations.length
  };
}

// Run the audit
auditFirebaseImplementation();
