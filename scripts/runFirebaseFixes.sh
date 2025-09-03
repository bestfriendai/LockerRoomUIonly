#!/bin/bash

# Firebase Fixes Runner Script
# This script runs all the necessary fixes for Firebase connection issues

echo "🔥 Starting Firebase Fixes..."
echo "================================"

# Check if we're in the right directory
if [ ! -f "firebase.json" ]; then
    echo "❌ Error: firebase.json not found. Please run this script from the project root."
    exit 1
fi

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Error: Firebase CLI is not installed."
    echo "Please install it with: npm install -g firebase-tools"
    exit 1
fi

# Check if logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo "❌ Error: Not logged in to Firebase."
    echo "Please run: firebase login"
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Step 1: Deploy updated Firestore rules
echo "📋 Step 1: Deploying updated Firestore security rules..."
if firebase deploy --only firestore:rules; then
    echo "✅ Firestore rules deployed successfully"
else
    echo "❌ Failed to deploy Firestore rules"
    exit 1
fi
echo ""

# Step 2: Deploy Firestore indexes if they exist
echo "📋 Step 2: Deploying Firestore indexes..."
if [ -f "firestore.indexes.json" ]; then
    if firebase deploy --only firestore:indexes; then
        echo "✅ Firestore indexes deployed successfully"
    else
        echo "⚠️  Warning: Failed to deploy Firestore indexes (continuing anyway)"
    fi
else
    echo "ℹ️  No firestore.indexes.json found, skipping"
fi
echo ""

# Step 3: Check if Node.js dependencies are installed
echo "📋 Step 3: Checking Node.js dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies..."
    npm install
fi
echo "✅ Dependencies ready"
echo ""

# Step 4: Load environment variables
echo "📋 Step 4: Loading environment variables..."
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "✅ Environment variables loaded from .env"
elif [ -f ".env.local" ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
    echo "✅ Environment variables loaded from .env.local"
else
    echo "⚠️  Warning: No .env file found. Make sure Firebase config is set in environment."
fi
echo ""

# Step 5: Run the Firebase fixes script
echo "📋 Step 5: Running Firebase fixes and adding review data..."
if node scripts/fixFirebaseIssues.js; then
    echo "✅ Firebase fixes completed successfully"
else
    echo "❌ Firebase fixes failed"
    exit 1
fi
echo ""

# Step 6: Verify the fixes
echo "📋 Step 6: Verifying Firebase connection..."
if node -e "
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

getDocs(collection(db, 'reviews')).then(snapshot => {
  console.log(\`✅ Successfully connected to Firestore. Found \${snapshot.size} reviews.\`);
  process.exit(0);
}).catch(error => {
  console.error('❌ Failed to connect to Firestore:', error.message);
  process.exit(1);
});
"; then
    echo "✅ Firebase connection verified"
else
    echo "❌ Firebase connection verification failed"
    exit 1
fi
echo ""

echo "🎉 All Firebase fixes completed successfully!"
echo "================================"
echo ""
echo "What was fixed:"
echo "✅ Updated Firestore security rules to allow proper access"
echo "✅ Added realistic bad date reviews with images"
echo "✅ Created reviews for major US cities"
echo "✅ Fixed permission issues that were causing polling fallback"
echo ""
echo "Next steps:"
echo "1. Restart your React Native app"
echo "2. The app should now load reviews without polling fallback errors"
echo "3. You should see realistic review data in the app"
echo ""
echo "If you still see issues, check the app logs and ensure your .env file has the correct Firebase configuration."
