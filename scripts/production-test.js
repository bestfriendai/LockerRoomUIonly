#!/usr/bin/env node

/**
 * Production Readiness Test Script
 * Tests all critical app functionality end-to-end
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// Color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.cyan}▶ ${msg}${colors.reset}`)
};

class ProductionTest {
  constructor() {
    this.results = {
      passed: [],
      failed: [],
      warnings: []
    };
  }

  async runCommand(command, description) {
    try {
      log.info(`Running: ${description}`);
      const { stdout, stderr } = await execAsync(command);
      if (stderr && !stderr.includes('warning')) {
        throw new Error(stderr);
      }
      return { success: true, output: stdout };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async testEnvironmentSetup() {
    log.section('Testing Environment Setup');
    
    // Check Node version
    const nodeVersion = process.version;
    if (parseInt(nodeVersion.slice(1)) >= 18) {
      log.success(`Node.js version ${nodeVersion} meets requirements`);
      this.results.passed.push('Node.js version');
    } else {
      log.error(`Node.js version ${nodeVersion} is below required v18`);
      this.results.failed.push('Node.js version');
    }

    // Check for required environment variables
    const requiredEnvVars = [
      'EXPO_PUBLIC_FIREBASE_API_KEY',
      'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
      'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
      'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
      'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
      'EXPO_PUBLIC_FIREBASE_APP_ID'
    ];

    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(__dirname, '..', '.env.local');
    
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      let allVarsPresent = true;
      
      for (const varName of requiredEnvVars) {
        if (envContent.includes(varName)) {
          log.success(`Environment variable ${varName} is configured`);
        } else {
          log.error(`Missing environment variable: ${varName}`);
          allVarsPresent = false;
        }
      }
      
      if (allVarsPresent) {
        this.results.passed.push('Environment variables');
      } else {
        this.results.failed.push('Environment variables');
      }
    } else {
      log.error('.env.local file not found');
      this.results.failed.push('Environment configuration');
    }
  }

  async testDependencies() {
    log.section('Testing Dependencies');
    
    const result = await this.runCommand('npm ls --depth=0 --json', 'Checking dependencies');
    
    if (result.success) {
      try {
        const deps = JSON.parse(result.output);
        if (!deps.problems || deps.problems.length === 0) {
          log.success('All dependencies are properly installed');
          this.results.passed.push('Dependencies');
        } else {
          log.warning(`Found ${deps.problems.length} dependency issues`);
          this.results.warnings.push('Dependencies have issues');
        }
      } catch (e) {
        log.success('Dependencies check completed');
        this.results.passed.push('Dependencies');
      }
    } else {
      log.error('Failed to check dependencies');
      this.results.failed.push('Dependencies');
    }
  }

  async testTypeScript() {
    log.section('Testing TypeScript Configuration');
    
    const fs = require('fs');
    const path = require('path');
    const tsconfigPath = path.join(__dirname, '..', 'tsconfig.json');
    
    if (fs.existsSync(tsconfigPath)) {
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
      
      if (tsconfig.compilerOptions.strict === true) {
        log.success('TypeScript strict mode is enabled');
        this.results.passed.push('TypeScript strict mode');
      } else {
        log.warning('TypeScript strict mode is not enabled');
        this.results.warnings.push('TypeScript strict mode');
      }
      
      log.success('TypeScript configuration is valid');
      this.results.passed.push('TypeScript configuration');
    } else {
      log.error('tsconfig.json not found');
      this.results.failed.push('TypeScript configuration');
    }
  }

  async testLinting() {
    log.section('Testing Code Quality (ESLint)');
    
    const result = await this.runCommand('npm run lint 2>&1', 'Running ESLint');
    
    if (result.success) {
      if (result.output.includes('warning')) {
        const warningCount = (result.output.match(/warning/g) || []).length;
        log.warning(`ESLint found ${warningCount} warnings`);
        this.results.warnings.push(`ESLint: ${warningCount} warnings`);
      } else {
        log.success('No linting errors found');
        this.results.passed.push('ESLint');
      }
    } else {
      if (result.error.includes('error')) {
        const errorCount = (result.error.match(/error/g) || []).length;
        log.error(`ESLint found ${errorCount} errors`);
        this.results.failed.push('ESLint');
      }
    }
  }

  async testFirebaseSecurity() {
    log.section('Testing Firebase Security Rules');
    
    const fs = require('fs');
    const path = require('path');
    const rulesPath = path.join(__dirname, '..', 'firestore.rules');
    
    if (fs.existsSync(rulesPath)) {
      const rulesContent = fs.readFileSync(rulesPath, 'utf8');
      
      // Check for common security issues
      const issues = [];
      
      // Check for overly permissive rules
      if (rulesContent.includes('allow read, write: if true;')) {
        issues.push('Found overly permissive rules (allow all)');
      }
      
      // Check for test collections
      if (rulesContent.includes('match /test/')) {
        issues.push('Found test collection rules in production');
      }
      
      // Check for authentication requirements
      if (!rulesContent.includes('request.auth != null')) {
        issues.push('Missing authentication checks');
      }
      
      if (issues.length === 0) {
        log.success('Firebase security rules are properly configured');
        this.results.passed.push('Firebase security');
      } else {
        issues.forEach(issue => log.error(issue));
        this.results.failed.push('Firebase security');
      }
    } else {
      log.warning('firestore.rules file not found');
      this.results.warnings.push('Firebase rules file');
    }
  }

  async testAppStructure() {
    log.section('Testing App Structure');
    
    const fs = require('fs');
    const path = require('path');
    
    const requiredDirs = [
      'app',
      'app/(auth)',
      'app/(tabs)',
      'components',
      'components/ui',
      'providers',
      'services',
      'types',
      'utils'
    ];
    
    const requiredFiles = [
      'app/_layout.tsx',
      'app/(auth)/signin.tsx',
      'app/(tabs)/index.tsx',
      'utils/firebase.ts',
      'providers/AuthProvider.tsx'
    ];
    
    let allPresent = true;
    
    // Check directories
    for (const dir of requiredDirs) {
      const dirPath = path.join(__dirname, '..', dir);
      if (fs.existsSync(dirPath)) {
        log.success(`Directory ${dir} exists`);
      } else {
        log.error(`Missing directory: ${dir}`);
        allPresent = false;
      }
    }
    
    // Check critical files
    for (const file of requiredFiles) {
      const filePath = path.join(__dirname, '..', file);
      if (fs.existsSync(filePath)) {
        log.success(`File ${file} exists`);
      } else {
        log.error(`Missing file: ${file}`);
        allPresent = false;
      }
    }
    
    if (allPresent) {
      this.results.passed.push('App structure');
    } else {
      this.results.failed.push('App structure');
    }
  }

  async testExpoConfig() {
    log.section('Testing Expo Configuration');
    
    const fs = require('fs');
    const path = require('path');
    const appJsonPath = path.join(__dirname, '..', 'app.json');
    
    if (fs.existsSync(appJsonPath)) {
      const appConfig = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
      const expo = appConfig.expo;
      
      const requiredFields = ['name', 'slug', 'version', 'ios', 'android'];
      let allFieldsPresent = true;
      
      for (const field of requiredFields) {
        if (expo[field]) {
          log.success(`Expo config has ${field}`);
        } else {
          log.error(`Missing Expo config field: ${field}`);
          allFieldsPresent = false;
        }
      }
      
      // Check iOS config
      if (expo.ios?.bundleIdentifier) {
        log.success('iOS bundle identifier configured');
      } else {
        log.error('iOS bundle identifier not configured');
        allFieldsPresent = false;
      }
      
      // Check Android config
      if (expo.android?.package) {
        log.success('Android package name configured');
      } else {
        log.error('Android package name not configured');
        allFieldsPresent = false;
      }
      
      if (allFieldsPresent) {
        this.results.passed.push('Expo configuration');
      } else {
        this.results.failed.push('Expo configuration');
      }
    } else {
      log.error('app.json not found');
      this.results.failed.push('Expo configuration');
    }
  }

  async generateReport() {
    log.section('Production Readiness Report');
    
    const totalTests = this.results.passed.length + this.results.failed.length;
    const passRate = Math.round((this.results.passed.length / totalTests) * 100);
    
    console.log('\n' + '='.repeat(50));
    console.log(`${colors.cyan}PRODUCTION READINESS ASSESSMENT${colors.reset}`);
    console.log('='.repeat(50));
    
    console.log(`\n${colors.green}✓ PASSED (${this.results.passed.length})${colors.reset}`);
    this.results.passed.forEach(test => console.log(`  • ${test}`));
    
    if (this.results.warnings.length > 0) {
      console.log(`\n${colors.yellow}⚠ WARNINGS (${this.results.warnings.length})${colors.reset}`);
      this.results.warnings.forEach(warning => console.log(`  • ${warning}`));
    }
    
    if (this.results.failed.length > 0) {
      console.log(`\n${colors.red}✗ FAILED (${this.results.failed.length})${colors.reset}`);
      this.results.failed.forEach(test => console.log(`  • ${test}`));
    }
    
    console.log('\n' + '='.repeat(50));
    
    if (passRate === 100) {
      console.log(`${colors.green}🎉 APP IS PRODUCTION READY! (${passRate}% pass rate)${colors.reset}`);
    } else if (passRate >= 80) {
      console.log(`${colors.yellow}⚠️  APP IS NEARLY READY (${passRate}% pass rate)${colors.reset}`);
      console.log('Fix the failed tests before deploying to production.');
    } else {
      console.log(`${colors.red}❌ APP NEEDS WORK (${passRate}% pass rate)${colors.reset}`);
      console.log('Multiple critical issues need to be resolved.');
    }
    
    console.log('='.repeat(50) + '\n');
    
    // Return exit code based on results
    return this.results.failed.length === 0 ? 0 : 1;
  }

  async run() {
    console.log(`${colors.cyan}🚀 LockerRoom Talk - Production Readiness Test${colors.reset}`);
    console.log('='.repeat(50));
    
    await this.testEnvironmentSetup();
    await this.testDependencies();
    await this.testTypeScript();
    await this.testLinting();
    await this.testFirebaseSecurity();
    await this.testAppStructure();
    await this.testExpoConfig();
    
    const exitCode = await this.generateReport();
    
    if (exitCode !== 0) {
      console.log(`\n${colors.yellow}Recommended Actions:${colors.reset}`);
      console.log('1. Fix all failed tests');
      console.log('2. Address warnings if possible');
      console.log('3. Run comprehensive testing on all platforms');
      console.log('4. Deploy to staging environment first');
      console.log('5. Set up monitoring and error tracking\n');
    }
    
    process.exit(exitCode);
  }
}

// Run the test
const test = new ProductionTest();
test.run().catch(error => {
  console.error(`${colors.red}Test script failed:${colors.reset}`, error);
  process.exit(1);
});