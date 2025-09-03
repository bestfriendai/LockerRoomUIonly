#!/usr/bin/env node

/**
 * Firebase Validation Script
 * Comprehensive validation of all Firebase services and configurations
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔥 Firebase Validation Script\n');

const validationResults = [];

function addResult(category, test, passed, message, fix = '') {
  validationResults.push({ category, test, passed, message, fix });
  const status = passed ? '✅' : '❌';
  console.log(`   ${status} ${test}: ${message}`);
  if (!passed && fix) {
    console.log(`      Fix: ${fix}`);
  }
}

// Test 1: Firebase CLI and Authentication
function testFirebaseCLI() {
  console.log('📋 Firebase CLI & Authentication');
  
  try {
    const version = execSync('firebase --version', { encoding: 'utf8' }).trim();
    addResult('CLI', 'Firebase CLI installed', true, `Version ${version}`);
  } catch (error) {
    addResult('CLI', 'Firebase CLI installed', false, 'Not installed', 'Run: npm install -g firebase-tools');
    return false;
  }

  try {
    const projects = execSync('firebase projects:list', { encoding: 'utf8' });
    const hasCurrentProject = projects.includes('(current)');
    addResult('CLI', 'Firebase project selected', hasCurrentProject, 
      hasCurrentProject ? 'Project configured' : 'No current project', 
      'Run: firebase use --add');
  } catch (error) {
    addResult('CLI', 'Firebase authenticated', false, 'Not authenticated', 'Run: firebase login');
    return false;
  }

  return true;
}

// Test 2: Firebase Configuration Files
function testFirebaseConfig() {
  console.log('\n📋 Firebase Configuration Files');
  
  // Check firebase.json
  const firebaseJsonExists = fs.existsSync('firebase.json');
  addResult('Config', 'firebase.json exists', firebaseJsonExists, 
    firebaseJsonExists ? 'Configuration file found' : 'Missing configuration file',
    'Run: firebase init');

  if (firebaseJsonExists) {
    try {
      const config = JSON.parse(fs.readFileSync('firebase.json', 'utf8'));
      
      // Check services
      const services = ['firestore', 'hosting', 'storage'];
      services.forEach(service => {
        const hasService = Object.prototype.hasOwnProperty.call(config, service);
        addResult('Config', `${service} configured`, hasService,
          hasService ? `${service} configuration found` : `${service} not configured`,
          `Add ${service} configuration to firebase.json`);
      });

      // Check emulators
      const hasEmulators = Object.prototype.hasOwnProperty.call(config, 'emulators');
      addResult('Config', 'Emulators configured', hasEmulators,
        hasEmulators ? 'Emulator configuration found' : 'Emulators not configured',
        'Add emulators configuration for local development');

    } catch (error) {
      addResult('Config', 'firebase.json valid', false, 'Invalid JSON format', 'Fix JSON syntax errors');
    }
  }

  // Check .firebaserc
  const firebasercExists = fs.existsSync('.firebaserc');
  addResult('Config', '.firebaserc exists', firebasercExists,
    firebasercExists ? 'Project configuration found' : 'Missing project configuration',
    'Run: firebase use --add');
}

// Test 3: Firestore Rules and Indexes
function testFirestore() {
  console.log('\n📋 Firestore Configuration');
  
  // Check rules file
  const rulesExist = fs.existsSync('firestore.rules');
  addResult('Firestore', 'Security rules exist', rulesExist,
    rulesExist ? 'Rules file found' : 'Missing security rules',
    'Create firestore.rules file');

  if (rulesExist) {
    try {
      const result = execSync('firebase deploy --only firestore:rules --dry-run', { 
        encoding: 'utf8', 
        stdio: 'pipe' 
      });
      const rulesValid = result.includes('compiled successfully');
      addResult('Firestore', 'Security rules valid', rulesValid,
        rulesValid ? 'Rules compile successfully' : 'Rules have syntax errors',
        'Fix syntax errors in firestore.rules');
    } catch (error) {
      addResult('Firestore', 'Security rules valid', false, 'Failed to validate rules',
        'Check firestore.rules syntax');
    }
  }

  // Check indexes
  const indexesExist = fs.existsSync('firestore.indexes.json');
  addResult('Firestore', 'Indexes configured', indexesExist,
    indexesExist ? 'Indexes file found' : 'Missing indexes configuration',
    'Create firestore.indexes.json file');

  if (indexesExist) {
    try {
      const indexes = JSON.parse(fs.readFileSync('firestore.indexes.json', 'utf8'));
      const hasIndexes = indexes.indexes && indexes.indexes.length > 0;
      addResult('Firestore', 'Indexes defined', hasIndexes,
        hasIndexes ? `${indexes.indexes.length} indexes defined` : 'No indexes defined',
        'Define necessary composite indexes');
    } catch (error) {
      addResult('Firestore', 'Indexes file valid', false, 'Invalid JSON format',
        'Fix JSON syntax in firestore.indexes.json');
    }
  }
}

// Test 4: Storage Rules
function testStorage() {
  console.log('\n📋 Firebase Storage');
  
  const storageRulesExist = fs.existsSync('storage.rules');
  addResult('Storage', 'Storage rules exist', storageRulesExist,
    storageRulesExist ? 'Storage rules found' : 'Missing storage rules',
    'Create storage.rules file');

  if (storageRulesExist) {
    try {
      const rules = fs.readFileSync('storage.rules', 'utf8');
      const hasRulesVersion = rules.includes("rules_version = '2'");
      addResult('Storage', 'Storage rules version', hasRulesVersion,
        hasRulesVersion ? 'Using rules version 2' : 'Missing or incorrect rules version',
        "Add rules_version = '2' to storage.rules");
    } catch (error) {
      addResult('Storage', 'Storage rules readable', false, 'Cannot read storage rules',
        'Check storage.rules file permissions');
    }
  }
}

// Test 5: Hosting Configuration
function testHosting() {
  console.log('\n📋 Firebase Hosting');
  
  // Check if dist directory exists (build output)
  const distExists = fs.existsSync('dist');
  addResult('Hosting', 'Build output exists', distExists,
    distExists ? 'dist directory found' : 'Missing build output',
    'Run: npm run build:web');

  if (distExists) {
    const indexExists = fs.existsSync('dist/index.html');
    addResult('Hosting', 'Index file exists', indexExists,
      indexExists ? 'index.html found in dist' : 'Missing index.html',
      'Ensure build process creates index.html');
  }

  // Test hosting deployment (dry run)
  try {
    const result = execSync('firebase deploy --only hosting --dry-run', { 
      encoding: 'utf8', 
      stdio: 'pipe' 
    });
    const deployReady = result.includes('Dry run complete');
    addResult('Hosting', 'Hosting deployment ready', deployReady,
      deployReady ? 'Ready for deployment' : 'Deployment issues found',
      'Check hosting configuration and build output');
  } catch (error) {
    addResult('Hosting', 'Hosting deployment ready', false, 'Deployment validation failed',
      'Check firebase.json hosting configuration');
  }
}

// Test 6: Functions (if configured)
function testFunctions() {
  console.log('\n📋 Firebase Functions');
  
  const functionsExist = fs.existsSync('functions');
  addResult('Functions', 'Functions directory exists', functionsExist,
    functionsExist ? 'Functions directory found' : 'No functions configured',
    'Run: firebase init functions');

  if (functionsExist) {
    const packageJsonExists = fs.existsSync('functions/package.json');
    addResult('Functions', 'Functions package.json exists', packageJsonExists,
      packageJsonExists ? 'Package configuration found' : 'Missing package.json',
      'Initialize functions properly');

    if (packageJsonExists) {
      try {
        const result = execSync('cd functions && npm run build', { 
          encoding: 'utf8', 
          stdio: 'pipe' 
        });
        addResult('Functions', 'Functions build successfully', true, 'TypeScript compilation successful');
      } catch (error) {
        addResult('Functions', 'Functions build successfully', false, 'Build failed',
          'Fix TypeScript errors in functions');
      }
    }
  }
}

// Test 7: Environment Configuration
function testEnvironment() {
  console.log('\n📋 Environment Configuration');
  
  // Check local environment
  const envLocalExists = fs.existsSync('.env.local');
  addResult('Environment', 'Local environment configured', envLocalExists,
    envLocalExists ? '.env.local found' : 'Missing local environment',
    'Create .env.local with Firebase configuration');

  // Check development environment
  const envDevExists = fs.existsSync('.env.development');
  addResult('Environment', 'Development environment configured', envDevExists,
    envDevExists ? '.env.development found' : 'Missing development environment',
    'Create .env.development for emulator configuration');

  // Check production template
  const envProdTemplateExists = fs.existsSync('.env.production.template');
  addResult('Environment', 'Production template exists', envProdTemplateExists,
    envProdTemplateExists ? 'Production template found' : 'Missing production template',
    'Create .env.production.template');
}

// Test 8: App Configuration
function testAppConfig() {
  console.log('\n📋 App Configuration');
  
  // Check app.json
  const appJsonExists = fs.existsSync('app.json');
  addResult('App', 'app.json exists', appJsonExists,
    appJsonExists ? 'App configuration found' : 'Missing app configuration',
    'Create app.json with Expo configuration');

  // Check EAS configuration
  const easJsonExists = fs.existsSync('eas.json');
  addResult('App', 'EAS configuration exists', easJsonExists,
    easJsonExists ? 'EAS configuration found' : 'Missing EAS configuration',
    'Run: eas build:configure');

  // Check package.json
  const packageJsonExists = fs.existsSync('package.json');
  if (packageJsonExists) {
    try {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const hasName = pkg.name && pkg.name.length > 0;
      const hasVersion = pkg.version && pkg.version !== '1.0.0';
      
      addResult('App', 'Package name configured', hasName,
        hasName ? `Package name: ${pkg.name}` : 'Missing package name',
        'Set package name in package.json');
      
      addResult('App', 'Version updated', hasVersion,
        hasVersion ? `Version: ${pkg.version}` : 'Using default version',
        'Update version in package.json');
    } catch (error) {
      addResult('App', 'Package.json valid', false, 'Invalid JSON format',
        'Fix JSON syntax in package.json');
    }
  }
}

// Run all tests
function runAllTests() {
  const testSuites = [
    testFirebaseCLI,
    testFirebaseConfig,
    testFirestore,
    testStorage,
    testHosting,
    testFunctions,
    testEnvironment,
    testAppConfig,
  ];

  testSuites.forEach(testSuite => {
    try {
      testSuite();
    } catch (error) {
      console.error(`Error running test suite: ${error.message}`);
    }
  });

  // Summary
  const totalTests = validationResults.length;
  const passedTests = validationResults.filter(r => r.passed).length;
  const failedTests = totalTests - passedTests;

  console.log(`\n📊 Firebase Validation Results: ${passedTests}/${totalTests} tests passed`);

  if (failedTests === 0) {
    console.log('🎉 All Firebase services are properly configured!');
    console.log('🚀 Ready for deployment to production.');
  } else {
    console.log(`\n❌ ${failedTests} issues found. Please address the following:`);
    
    const failedResults = validationResults.filter(r => !r.passed);
    failedResults.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.category} - ${result.test}`);
      console.log(`   Issue: ${result.message}`);
      if (result.fix) {
        console.log(`   Fix: ${result.fix}`);
      }
    });
  }

  return failedTests === 0;
}

if (require.main === module) {
  const success = runAllTests();
  process.exit(success ? 0 : 1);
}

module.exports = { runAllTests };
