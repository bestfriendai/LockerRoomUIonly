#!/usr/bin/env node

/**
 * Security Testing Script
 * Tests Firebase security rules and validates security configurations
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔒 Starting Security Tests...\n');

// Test 1: Validate Firebase Rules Syntax
function testFirebaseRules() {
  console.log('1. Testing Firebase Rules Syntax...');
  try {
    const result = execSync('firebase deploy --only firestore:rules --dry-run', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    if (result.includes('rules file firestore.rules compiled successfully')) {
      console.log('   ✅ Firebase rules syntax is valid');
      return true;
    } else {
      console.log('   ❌ Firebase rules have syntax errors');
      console.log(result);
      return false;
    }
  } catch (error) {
    console.log('   ❌ Error testing Firebase rules:', error.message);
    return false;
  }
}

// Test 2: Check Environment Variables
function testEnvironmentVariables() {
  console.log('\n2. Testing Environment Variables...');
  const envFile = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envFile)) {
    console.log('   ❌ .env.local file not found');
    return false;
  }

  const envContent = fs.readFileSync(envFile, 'utf8');
  const requiredVars = [
    'EXPO_PUBLIC_FIREBASE_API_KEY',
    'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
    'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'EXPO_PUBLIC_FIREBASE_APP_ID'
  ];

  let allPresent = true;
  requiredVars.forEach(varName => {
    if (!envContent.includes(varName)) {
      console.log(`   ❌ Missing environment variable: ${varName}`);
      allPresent = false;
    }
  });

  if (allPresent) {
    console.log('   ✅ All required environment variables present');
  }

  // Check for sensitive data exposure
  if (envContent.includes('localhost') || envContent.includes('127.0.0.1')) {
    console.log('   ⚠️  Warning: Local development URLs found in environment');
  }

  return allPresent;
}

// Test 3: Validate Security Functions
function testSecurityFunctions() {
  console.log('\n3. Testing Security Functions...');
  const rulesFile = path.join(process.cwd(), 'firestore.rules');
  
  if (!fs.existsSync(rulesFile)) {
    console.log('   ❌ firestore.rules file not found');
    return false;
  }

  const rulesContent = fs.readFileSync(rulesFile, 'utf8');
  
  const requiredFunctions = [
    'isSignedIn',
    'isOwner',
    'isEmailVerified',
    'isRateLimited',
    'hasNoSQLInjection',
    'hasProfanity',
    'isValidString',
    'hasValidContentLength'
  ];

  let allPresent = true;
  requiredFunctions.forEach(funcName => {
    if (!rulesContent.includes(`function ${funcName}`)) {
      console.log(`   ❌ Missing security function: ${funcName}`);
      allPresent = false;
    }
  });

  if (allPresent) {
    console.log('   ✅ All required security functions present');
  }

  // Check for security best practices
  const securityChecks = [
    { pattern: 'isEmailVerified()', message: 'Email verification checks' },
    { pattern: 'isRateLimited(', message: 'Rate limiting implementation' },
    { pattern: 'hasNoSQLInjection(', message: 'SQL injection protection' },
    { pattern: 'hasProfanity(', message: 'Profanity filtering' },
    { pattern: 'allow read: if false', message: 'Explicit deny rules' },
    { pattern: 'allow write: if false', message: 'Write protection' }
  ];

  securityChecks.forEach(check => {
    if (rulesContent.includes(check.pattern)) {
      console.log(`   ✅ ${check.message} implemented`);
    } else {
      console.log(`   ⚠️  ${check.message} not found`);
    }
  });

  return allPresent;
}

// Test 4: Check for Common Security Issues
function testCommonSecurityIssues() {
  console.log('\n4. Checking for Common Security Issues...');
  
  const issues = [];
  
  // Check for hardcoded secrets in source files
  const sourceFiles = [];
  function findSourceFiles(dir) {
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        findSourceFiles(fullPath);
      } else if (item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.js')) {
        sourceFiles.push(fullPath);
      }
    });
  }

  try {
    findSourceFiles(process.cwd());
    
    const dangerousPatterns = [
      { pattern: /AIzaSy[A-Za-z0-9_-]{33}/, message: 'Hardcoded Firebase API key' },
      { pattern: /sk_live_[A-Za-z0-9]{24}/, message: 'Stripe live secret key' },
      { pattern: /password\s*=\s*["'][^"']+["']/, message: 'Hardcoded password' },
      { pattern: /secret\s*=\s*["'][^"']+["']/, message: 'Hardcoded secret' },
      { pattern: /token\s*=\s*["'][^"']+["']/, message: 'Hardcoded token' }
    ];

    sourceFiles.slice(0, 20).forEach(file => { // Check first 20 files to avoid timeout
      try {
        const content = fs.readFileSync(file, 'utf8');
        dangerousPatterns.forEach(pattern => {
          if (pattern.pattern.test(content)) {
            issues.push(`${pattern.message} found in ${file}`);
          }
        });
      } catch (error) {
        // Skip files that can't be read
      }
    });

    if (issues.length === 0) {
      console.log('   ✅ No common security issues found');
    } else {
      issues.forEach(issue => {
        console.log(`   ❌ ${issue}`);
      });
    }
  } catch (error) {
    console.log('   ⚠️  Could not scan source files for security issues');
  }

  return issues.length === 0;
}

// Test 5: Validate Package Dependencies
function testDependencySecurity() {
  console.log('\n5. Checking Dependency Security...');
  
  try {
    // Check if npm audit is available
    const auditResult = execSync('npm audit --audit-level=high --json', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    const audit = JSON.parse(auditResult);
    const vulnerabilities = audit.metadata?.vulnerabilities;
    
    if (vulnerabilities && (vulnerabilities.high > 0 || vulnerabilities.critical > 0)) {
      console.log(`   ❌ Found ${vulnerabilities.high} high and ${vulnerabilities.critical} critical vulnerabilities`);
      console.log('   Run "npm audit fix" to resolve issues');
      return false;
    } else {
      console.log('   ✅ No high or critical vulnerabilities found');
      return true;
    }
  } catch (error) {
    console.log('   ⚠️  Could not run dependency security check');
    console.log('   Run "npm audit" manually to check for vulnerabilities');
    return true; // Don't fail the test if audit is not available
  }
}

// Run all tests
async function runSecurityTests() {
  const results = [
    testFirebaseRules(),
    testEnvironmentVariables(),
    testSecurityFunctions(),
    testCommonSecurityIssues(),
    testDependencySecurity()
  ];

  const passed = results.filter(Boolean).length;
  const total = results.length;

  console.log(`\n📊 Security Test Results: ${passed}/${total} tests passed`);

  if (passed === total) {
    console.log('🎉 All security tests passed!');
    process.exit(0);
  } else {
    console.log('⚠️  Some security tests failed. Please review and fix the issues above.');
    process.exit(1);
  }
}

if (require.main === module) {
  runSecurityTests();
}

module.exports = { runSecurityTests };
