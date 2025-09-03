#!/usr/bin/env node

/**
 * Script to test Firestore access and temporarily deploy testing rules if needed
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Firestore Access Testing Script');
console.log('=====================================\n');

// Check if Firebase CLI is installed
try {
  execSync('firebase --version', { stdio: 'pipe' });
  console.log('✅ Firebase CLI is installed');
} catch (error) {
  console.log('❌ Firebase CLI is not installed');
  console.log('💡 Install it with: npm install -g firebase-tools');
  process.exit(1);
}

// Check if user is logged in
try {
  const result = execSync('firebase projects:list', { stdio: 'pipe', encoding: 'utf8' });
  console.log('✅ Firebase CLI is authenticated');
} catch (error) {
  console.log('❌ Firebase CLI is not authenticated');
  console.log('💡 Login with: firebase login');
  process.exit(1);
}

async function testFirestoreAccess() {
  console.log('\n🔍 Testing current Firestore access...');
  
  try {
    // Try to run the checkReviews script
    const result = execSync('node scripts/checkReviews.js', { 
      stdio: 'pipe', 
      encoding: 'utf8',
      timeout: 10000 
    });
    console.log('✅ Firestore access successful!');
    console.log(result);
    return true;
  } catch (error) {
    console.log('❌ Firestore access failed');
    console.log('Error:', error.message);
    
    if (error.message.includes('permission-denied') || error.message.includes('Missing or insufficient permissions')) {
      console.log('\n💡 This appears to be a permissions issue.');
      console.log('   Your Firestore security rules require authentication to read reviews.');
      return false;
    }
    
    throw error;
  }
}

async function deployTestingRules() {
  console.log('\n🚀 Deploying temporary testing rules...');
  
  // Backup current rules
  if (fs.existsSync('firestore.rules')) {
    fs.copyFileSync('firestore.rules', 'firestore.rules.backup');
    console.log('📋 Backed up current rules to firestore.rules.backup');
  }
  
  // Copy testing rules
  if (fs.existsSync('firestore.rules.testing')) {
    fs.copyFileSync('firestore.rules.testing', 'firestore.rules');
    console.log('📋 Copied testing rules to firestore.rules');
  } else {
    console.log('❌ Testing rules file not found: firestore.rules.testing');
    return false;
  }
  
  try {
    // Deploy the testing rules
    execSync('firebase deploy --only firestore:rules', { stdio: 'inherit' });
    console.log('✅ Testing rules deployed successfully');
    return true;
  } catch (error) {
    console.log('❌ Failed to deploy testing rules');
    console.log('Error:', error.message);
    
    // Restore original rules
    if (fs.existsSync('firestore.rules.backup')) {
      fs.copyFileSync('firestore.rules.backup', 'firestore.rules');
      console.log('📋 Restored original rules');
    }
    
    return false;
  }
}

async function restoreOriginalRules() {
  console.log('\n🔄 Restoring original rules...');
  
  if (fs.existsSync('firestore.rules.backup')) {
    fs.copyFileSync('firestore.rules.backup', 'firestore.rules');
    console.log('📋 Restored original rules from backup');
    
    try {
      execSync('firebase deploy --only firestore:rules', { stdio: 'inherit' });
      console.log('✅ Original rules deployed successfully');
      
      // Clean up backup
      fs.unlinkSync('firestore.rules.backup');
      console.log('🗑️  Cleaned up backup file');
      
      return true;
    } catch (error) {
      console.log('❌ Failed to deploy original rules');
      console.log('Error:', error.message);
      return false;
    }
  } else {
    console.log('❌ No backup file found');
    return false;
  }
}

async function main() {
  const accessWorked = await testFirestoreAccess();
  
  if (!accessWorked) {
    console.log('\n🤔 Would you like to temporarily deploy testing rules that allow public read access?');
    console.log('⚠️  WARNING: This will make your Firestore data publicly readable!');
    console.log('   Only do this in development/testing environments.');
    console.log('\n💡 Alternative solutions:');
    console.log('   1. Create a test user account and modify the script to authenticate');
    console.log('   2. Temporarily modify your Firestore rules manually');
    console.log('   3. Use the Firebase console to view your data');
    
    // For now, just provide instructions
    console.log('\n📝 To manually test Firestore access:');
    console.log('   1. Go to Firebase Console > Firestore Database > Rules');
    console.log('   2. Temporarily change the reviews rule to: allow read: if true;');
    console.log('   3. Run: node scripts/checkReviews.js');
    console.log('   4. Restore your original rules');
  }
}

main().catch(console.error);
