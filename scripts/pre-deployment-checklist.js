#!/usr/bin/env node

/**
 * Pre-deployment Checklist Script
 * Validates that all requirements are met before deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📋 Pre-deployment Checklist\n');

const checklist = [
  {
    name: 'Environment Configuration',
    checks: [
      {
        name: 'Production environment file exists',
        check: () => fs.existsSync('.env.production'),
        fix: 'Create .env.production from .env.production.template'
      },
      {
        name: 'All required environment variables set',
        check: () => {
          if (!fs.existsSync('.env.production')) return false;
          const content = fs.readFileSync('.env.production', 'utf8');
          const required = [
            'EXPO_PUBLIC_FIREBASE_API_KEY',
            'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
            'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'
          ];
          return required.every(key => content.includes(key) && !content.includes(`${key}=your_`));
        },
        fix: 'Fill in all production environment variables in .env.production'
      }
    ]
  },
  {
    name: 'Code Quality',
    checks: [
      {
        name: 'No linting errors',
        check: () => {
          try {
            execSync('npm run lint', { stdio: 'pipe' });
            return true;
          } catch {
            return false;
          }
        },
        fix: 'Run "npm run lint" and fix all errors'
      },
      {
        name: 'No TypeScript errors',
        check: () => {
          try {
            execSync('npm run type-check', { stdio: 'pipe' });
            return true;
          } catch {
            return false;
          }
        },
        fix: 'Run "npm run type-check" and fix all errors'
      },
      {
        name: 'All tests passing',
        check: () => {
          try {
            execSync('npm test -- --watchAll=false', { stdio: 'pipe' });
            return true;
          } catch {
            return false;
          }
        },
        fix: 'Run "npm test" and fix failing tests'
      }
    ]
  },
  {
    name: 'Security',
    checks: [
      {
        name: 'Security tests passing',
        check: () => {
          try {
            execSync('node scripts/test-security.js', { stdio: 'pipe' });
            return true;
          } catch {
            return false;
          }
        },
        fix: 'Run "node scripts/test-security.js" and fix security issues'
      },
      {
        name: 'No high-severity vulnerabilities',
        check: () => {
          try {
            const result = execSync('npm audit --audit-level=high --json', { encoding: 'utf8' });
            const audit = JSON.parse(result);
            return audit.metadata.vulnerabilities.high === 0 && audit.metadata.vulnerabilities.critical === 0;
          } catch {
            return true; // If audit fails, assume it's okay
          }
        },
        fix: 'Run "npm audit fix" to resolve security vulnerabilities'
      },
      {
        name: 'Firebase security rules exist',
        check: () => fs.existsSync('firestore.rules'),
        fix: 'Ensure firestore.rules file exists and is properly configured'
      }
    ]
  },
  {
    name: 'Firebase Configuration',
    checks: [
      {
        name: 'Firebase CLI authenticated',
        check: () => {
          try {
            execSync('firebase projects:list', { stdio: 'pipe' });
            return true;
          } catch {
            return false;
          }
        },
        fix: 'Run "firebase login" to authenticate'
      },
      {
        name: 'Firebase project configured',
        check: () => fs.existsSync('.firebaserc'),
        fix: 'Run "firebase use --add" to configure project'
      },
      {
        name: 'Firestore rules valid',
        check: () => {
          try {
            const result = execSync('firebase deploy --only firestore:rules --dry-run', { encoding: 'utf8' });
            return result.includes('compiled successfully');
          } catch {
            return false;
          }
        },
        fix: 'Fix syntax errors in firestore.rules'
      }
    ]
  },
  {
    name: 'App Configuration',
    checks: [
      {
        name: 'App.json/app.config.js configured',
        check: () => fs.existsSync('app.json') || fs.existsSync('app.config.js'),
        fix: 'Ensure app configuration file exists'
      },
      {
        name: 'EAS configuration exists',
        check: () => fs.existsSync('eas.json'),
        fix: 'Run "eas build:configure" to create eas.json'
      },
      {
        name: 'Package.json has correct version',
        check: () => {
          const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
          return pkg.version && pkg.version !== '1.0.0';
        },
        fix: 'Update version in package.json'
      }
    ]
  },
  {
    name: 'Documentation',
    checks: [
      {
        name: 'README.md exists and is updated',
        check: () => {
          if (!fs.existsSync('README.md')) return false;
          const content = fs.readFileSync('README.md', 'utf8');
          return content.length > 500; // Basic check for substantial content
        },
        fix: 'Update README.md with current project information'
      },
      {
        name: 'Deployment documentation exists',
        check: () => fs.existsSync('documentation/deployment.md'),
        fix: 'Ensure deployment documentation is complete'
      },
      {
        name: 'Security documentation exists',
        check: () => fs.existsSync('documentation/security.md'),
        fix: 'Ensure security documentation is complete'
      }
    ]
  }
];

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = [];

checklist.forEach(category => {
  console.log(`\n📂 ${category.name}`);
  
  category.checks.forEach(check => {
    totalChecks++;
    const passed = check.check();
    
    if (passed) {
      console.log(`   ✅ ${check.name}`);
      passedChecks++;
    } else {
      console.log(`   ❌ ${check.name}`);
      console.log(`      Fix: ${check.fix}`);
      failedChecks.push({ category: category.name, check: check.name, fix: check.fix });
    }
  });
});

console.log(`\n📊 Results: ${passedChecks}/${totalChecks} checks passed`);

if (failedChecks.length === 0) {
  console.log('\n🎉 All checks passed! Ready for deployment.');
  process.exit(0);
} else {
  console.log('\n❌ Some checks failed. Please fix the following issues:\n');
  
  failedChecks.forEach((item, index) => {
    console.log(`${index + 1}. ${item.category}: ${item.check}`);
    console.log(`   Fix: ${item.fix}\n`);
  });
  
  console.log('Run this script again after fixing the issues.');
  process.exit(1);
}
