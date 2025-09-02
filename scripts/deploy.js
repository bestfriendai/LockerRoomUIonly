#!/usr/bin/env node

/**
 * Production Deployment Script
 * Automates the deployment process with safety checks
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

function runCommand(command, description) {
  console.log(`\n🔄 ${description}...`);
  try {
    const result = execSync(command, { encoding: 'utf8', stdio: 'inherit' });
    console.log(`✅ ${description} completed`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    return false;
  }
}

function checkPrerequisites() {
  console.log('🔍 Checking prerequisites...\n');
  
  const commands = [
    { cmd: 'node --version', name: 'Node.js' },
    { cmd: 'npm --version', name: 'npm' },
    { cmd: 'firebase --version', name: 'Firebase CLI' },
    { cmd: 'expo --version', name: 'Expo CLI' }
  ];

  let allPresent = true;
  commands.forEach(({ cmd, name }) => {
    try {
      const version = execSync(cmd, { encoding: 'utf8' }).trim();
      console.log(`✅ ${name}: ${version}`);
    } catch (error) {
      console.log(`❌ ${name}: Not installed`);
      allPresent = false;
    }
  });

  return allPresent;
}

function runTests() {
  console.log('\n🧪 Running tests...\n');
  
  const tests = [
    { cmd: 'npm run lint', name: 'Linting' },
    { cmd: 'npm run type-check', name: 'Type checking' },
    { cmd: 'node scripts/test-security.js', name: 'Security tests' }
  ];

  let allPassed = true;
  tests.forEach(({ cmd, name }) => {
    if (!runCommand(cmd, name)) {
      allPassed = false;
    }
  });

  return allPassed;
}

function checkEnvironment() {
  console.log('\n🔧 Checking environment configuration...\n');
  
  const envFile = path.join(process.cwd(), '.env.production');
  if (!fs.existsSync(envFile)) {
    console.log('❌ .env.production file not found');
    console.log('   Create .env.production with production environment variables');
    return false;
  }

  const envContent = fs.readFileSync(envFile, 'utf8');
  const requiredVars = [
    'EXPO_PUBLIC_FIREBASE_API_KEY',
    'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
    'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'
  ];

  let allPresent = true;
  requiredVars.forEach(varName => {
    if (!envContent.includes(varName)) {
      console.log(`❌ Missing environment variable: ${varName}`);
      allPresent = false;
    }
  });

  if (allPresent) {
    console.log('✅ Environment configuration is valid');
  }

  return allPresent;
}

function deployFirebase() {
  console.log('\n🔥 Deploying Firebase...\n');
  
  const deployments = [
    { cmd: 'firebase deploy --only firestore:rules', name: 'Firestore security rules' },
    { cmd: 'firebase deploy --only firestore:indexes', name: 'Firestore indexes' }
  ];

  let allSucceeded = true;
  deployments.forEach(({ cmd, name }) => {
    if (!runCommand(cmd, `Deploying ${name}`)) {
      allSucceeded = false;
    }
  });

  return allSucceeded;
}

function buildWeb() {
  console.log('\n🌐 Building web application...\n');
  
  return runCommand('npm run build:web:prod', 'Building web app for production');
}

function deployWeb() {
  console.log('\n🚀 Deploying web application...\n');
  
  return runCommand('firebase deploy --only hosting', 'Deploying to Firebase Hosting');
}

async function buildMobile(platform) {
  console.log(`\n📱 Building ${platform} app...\n`);
  
  const buildMobile = await askQuestion(`Build ${platform} app? (y/N): `);
  if (buildMobile.toLowerCase() !== 'y') {
    console.log(`⏭️  Skipping ${platform} build`);
    return true;
  }

  return runCommand(`eas build --platform ${platform} --profile production`, `Building ${platform} app`);
}

async function submitMobile(platform) {
  const submit = await askQuestion(`Submit ${platform} app to store? (y/N): `);
  if (submit.toLowerCase() !== 'y') {
    console.log(`⏭️  Skipping ${platform} submission`);
    return true;
  }

  return runCommand(`eas submit --platform ${platform}`, `Submitting ${platform} app`);
}

async function main() {
  console.log('🚀 LockerRoom Talk - Production Deployment\n');
  console.log('This script will deploy the app to production environments.\n');

  // Confirm deployment
  const confirm = await askQuestion('Are you sure you want to deploy to production? (y/N): ');
  if (confirm.toLowerCase() !== 'y') {
    console.log('Deployment cancelled.');
    rl.close();
    return;
  }

  // Check prerequisites
  if (!checkPrerequisites()) {
    console.log('\n❌ Prerequisites not met. Please install missing tools.');
    rl.close();
    return;
  }

  // Check environment
  if (!checkEnvironment()) {
    console.log('\n❌ Environment configuration invalid. Please fix and try again.');
    rl.close();
    return;
  }

  // Run tests
  if (!runTests()) {
    console.log('\n❌ Tests failed. Please fix issues and try again.');
    rl.close();
    return;
  }

  // Deploy Firebase
  if (!deployFirebase()) {
    console.log('\n❌ Firebase deployment failed. Please check and try again.');
    rl.close();
    return;
  }

  // Build and deploy web
  const deployWebApp = await askQuestion('Deploy web application? (Y/n): ');
  if (deployWebApp.toLowerCase() !== 'n') {
    if (buildWeb() && deployWeb()) {
      console.log('✅ Web application deployed successfully');
    } else {
      console.log('❌ Web deployment failed');
    }
  }

  // Build mobile apps
  const buildMobileApps = await askQuestion('Build mobile applications? (y/N): ');
  if (buildMobileApps.toLowerCase() === 'y') {
    // iOS
    if (await buildMobile('ios')) {
      await submitMobile('ios');
    }

    // Android
    if (await buildMobile('android')) {
      await submitMobile('android');
    }
  }

  console.log('\n🎉 Deployment process completed!');
  console.log('\n📊 Next steps:');
  console.log('   • Monitor Firebase console for usage');
  console.log('   • Check app store review status');
  console.log('   • Monitor error tracking and analytics');
  console.log('   • Update documentation if needed');

  rl.close();
}

if (require.main === module) {
  main().catch(error => {
    console.error('Deployment failed:', error);
    process.exit(1);
  });
}

module.exports = { main };
