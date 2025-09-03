#!/bin/bash

# Deploy Firestore Rules and Indexes for Chat Functionality Fix
# This script deploys the updated security rules and indexes to fix the chat functionality

set -e

echo "🔧 Deploying Firestore fixes for LockerRoom Talk chat functionality..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase. Please run: firebase login"
    exit 1
fi

# Get current project
PROJECT=$(firebase use --json | jq -r '.result.current // .result')
if [ "$PROJECT" = "null" ] || [ -z "$PROJECT" ]; then
    echo "❌ No Firebase project selected. Please run: firebase use <project-id>"
    exit 1
fi

echo "📱 Using Firebase project: $PROJECT"

# Confirm deployment
echo ""
echo "⚠️  This will deploy the following changes to production:"
echo "   • Updated Firestore security rules for chat functionality"
echo "   • New Firestore indexes for message queries"
echo "   • Fixed chat room participant access controls"
echo ""
read -p "Are you sure you want to continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled."
    exit 1
fi

echo ""
echo "🚀 Starting deployment..."

# Deploy Firestore rules
echo "📝 Deploying Firestore security rules..."
if firebase deploy --only firestore:rules --project="$PROJECT"; then
    echo "✅ Firestore rules deployed successfully"
else
    echo "❌ Failed to deploy Firestore rules"
    exit 1
fi

# Deploy Firestore indexes
echo "📊 Deploying Firestore indexes..."
if firebase deploy --only firestore:indexes --project="$PROJECT"; then
    echo "✅ Firestore indexes deployment started"
    echo "ℹ️  Note: Index creation may take several minutes to complete in the Firebase Console"
else
    echo "❌ Failed to deploy Firestore indexes"
    exit 1
fi

echo ""
echo "🎉 Firestore fixes deployed successfully!"
echo ""
echo "📋 What was fixed:"
echo "   • Chat rooms can now be read by participants (array-contains queries work)"
echo "   • Users can join chat rooms by adding themselves to participants"
echo "   • Message read/write permissions fixed for subcollections"
echo "   • Proper timestamp handling for both 'timestamp' and 'createdAt'"
echo "   • Added indexes for message read status queries"
echo ""
echo "🧪 Next steps:"
echo "   1. Wait for indexes to build (check Firebase Console)"
echo "   2. Test chat functionality in the app"
echo "   3. Monitor logs for any remaining issues"
echo ""

# Show current indexes building status
echo "📊 Current indexes status:"
firebase firestore:indexes --project="$PROJECT" 2>/dev/null || echo "   (Run 'firebase firestore:indexes' to check status)"

echo "✨ Deployment complete!"