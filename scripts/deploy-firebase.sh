#!/bin/bash

# Firebase Deployment Script
# This script deploys Firestore rules, indexes, and functions

echo "🚀 Starting Firebase Deployment Process..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null
then
    echo "❌ Firebase CLI is not installed. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if we're in the correct directory
if [ ! -f "firebase.json" ]; then
    echo "❌ firebase.json not found. Please run this script from the project root directory."
    exit 1
fi

# Login to Firebase (if not already logged in)
echo "🔐 Checking Firebase authentication..."
firebase login --interactive

# Deploy Firestore rules
echo "📄 Deploying Firestore security rules..."
firebase deploy --only firestore:rules

# Deploy Firestore indexes
echo "🔢 Deploying Firestore indexes..."
firebase deploy --only firestore:indexes

# Deploy Firebase functions (if they exist)
if [ -d "functions" ]; then
    echo "⚙️  Deploying Firebase functions..."
    firebase deploy --only functions
fi

# Deploy hosting (if configured)
if [ -d "web-build" ] || [ -d "dist" ]; then
    echo "🌐 Deploying web hosting..."
    firebase deploy --only hosting
fi

echo "✅ Firebase deployment completed successfully!"

# Show project info
echo "📋 Project Information:"
firebase projects:list | grep "locker-room-talk-app"

echo "🎉 Deployment process finished!"