# Production Deployment Guide

## Overview

This guide covers the complete deployment process for the LockerRoom Talk app to production environments.

## Prerequisites

### Development Environment
- Node.js 18+ installed
- Expo CLI installed globally: `npm install -g @expo/cli`
- Firebase CLI installed globally: `npm install -g firebase-tools`
- EAS CLI installed globally: `npm install -g @expo/eas-cli`

### Accounts Required
- Expo account (for EAS Build and Submit)
- Firebase project (for backend services)
- Apple Developer account (for iOS deployment)
- Google Play Console account (for Android deployment)

## Environment Setup

### 1. Environment Variables

Create production environment files:

```bash
# .env.production
EXPO_PUBLIC_FIREBASE_API_KEY=your_production_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_production_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_production_app_id
EXPO_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
NODE_ENV=production
```

### 2. Firebase Configuration

#### Initialize Firebase Project
```bash
# Login to Firebase
firebase login

# Set production project
firebase use your-production-project-id

# Deploy security rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes

# Deploy Cloud Functions (if any)
firebase deploy --only functions
```

#### Configure Firebase Authentication
1. Enable Email/Password authentication
2. Configure OAuth providers (Google, Apple, etc.)
3. Set up email templates
4. Configure authorized domains

#### Set up Firestore Database
1. Create database in production mode
2. Deploy security rules: `firebase deploy --only firestore:rules`
3. Create composite indexes: `firebase deploy --only firestore:indexes`

## Mobile App Deployment

### iOS Deployment

#### 1. Configure EAS Build
```bash
# Initialize EAS
eas build:configure

# Configure iOS credentials
eas credentials:configure -p ios
```

#### 2. Build for Production
```bash
# Build iOS app for App Store
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

#### 3. App Store Configuration
- Set up App Store Connect listing
- Configure app metadata and screenshots
- Set up TestFlight for beta testing
- Submit for App Store review

### Android Deployment

#### 1. Configure Android Build
```bash
# Configure Android credentials
eas credentials:configure -p android
```

#### 2. Build for Production
```bash
# Build Android app for Play Store
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

#### 3. Play Store Configuration
- Set up Play Console listing
- Configure app metadata and screenshots
- Set up internal testing track
- Submit for Play Store review

## Web Deployment

### 1. Build Web App
```bash
# Build for web production
npm run build:web:prod

# Test production build locally
npx serve dist
```

### 2. Deploy to Hosting Service

#### Option A: Firebase Hosting
```bash
# Configure Firebase hosting
firebase init hosting

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

#### Option B: Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel --prod
```

#### Option C: Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

## CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      - run: node scripts/test-security.js

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      # Deploy Firebase
      - run: npm install -g firebase-tools
      - run: firebase deploy --token ${{ secrets.FIREBASE_TOKEN }}
      
      # Build and deploy web
      - run: npm ci
      - run: npm run build:web:prod
      - run: firebase deploy --only hosting --token ${{ secrets.FIREBASE_TOKEN }}
      
      # Build mobile apps (if configured)
      - run: npm install -g @expo/eas-cli
      - run: eas build --platform all --non-interactive
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
```

## Production Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Security tests passing
- [ ] Environment variables configured
- [ ] Firebase project set up
- [ ] App Store/Play Store listings created
- [ ] Domain configured (for web)

### Security
- [ ] Firebase security rules deployed
- [ ] App Check configured
- [ ] HTTPS enforced
- [ ] Content Security Policy configured
- [ ] Rate limiting enabled

### Performance
- [ ] Bundle size optimized
- [ ] Images optimized
- [ ] Caching configured
- [ ] CDN set up (if applicable)

### Monitoring
- [ ] Firebase Analytics configured
- [ ] Crashlytics enabled
- [ ] Performance monitoring enabled
- [ ] Error tracking set up

### Legal & Compliance
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] GDPR compliance measures
- [ ] App store compliance

## Post-Deployment

### Monitoring
1. Monitor app performance and crashes
2. Check Firebase usage and billing
3. Monitor user feedback and reviews
4. Track key metrics and analytics

### Maintenance
1. Regular security updates
2. Dependency updates
3. Performance optimization
4. Feature updates based on user feedback

## Rollback Procedure

### Mobile Apps
1. Remove app from stores if critical issue
2. Push hotfix update
3. Use staged rollout to limit impact

### Web App
1. Revert to previous deployment
2. Fix issue and redeploy
3. Monitor for resolution

### Firebase
1. Revert security rules if needed
2. Restore database from backup
3. Check Cloud Functions logs

## Troubleshooting

### Common Issues

#### Build Failures
- Check environment variables
- Verify dependencies are up to date
- Check for TypeScript errors
- Verify Firebase configuration

#### Deployment Failures
- Check Firebase project permissions
- Verify hosting configuration
- Check domain DNS settings
- Verify SSL certificates

#### App Store Rejections
- Review App Store guidelines
- Check for missing metadata
- Verify app functionality
- Address privacy concerns

## Support and Resources

### Documentation
- [Expo Documentation](https://docs.expo.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)

### Community
- [Expo Discord](https://discord.gg/expo)
- [React Native Community](https://reactnative.dev/community/overview)
- [Firebase Community](https://firebase.google.com/community)

### Emergency Contacts
- Development Team: dev@lockerroomtalk.app
- Security Issues: security@lockerroomtalk.app
- Support: support@lockerroomtalk.app
