/**
 * Script to update Firestore security rules with enhanced moderation features
 */

const fs = require('fs');
const path = require('path');

// Read the current rules file
const rulesPath = path.join(__dirname, '..', 'firestore.rules');
let rulesContent = fs.readFileSync(rulesPath, 'utf8');

// Add enhanced moderation functions
const moderationFunctions = `
    // ====== Moderation Functions ======
    function isModerator() {
      return isSignedIn() && 
             request.auth.token.roles != null && 
             request.auth.token.roles.moderator == true;
    }
    
    function isAdmin() {
      return isSignedIn() && 
             request.auth.token.roles != null && 
             request.auth.token.roles.admin == true;
    }
    
    function canModerateContent() {
      return isModerator() || isAdmin();
    }
    
    function isValidModerationAction() {
      let validStatuses = ['approved', 'rejected', 'pending', 'flagged'];
      return request.resource.data.moderationStatus in validStatuses;
    }
    
    function hasValidModerationFields() {
      return request.resource.data.keys().hasAll(['moderationStatus', 'moderatedAt', 'moderatedBy']);
    }
`;

// Add moderation rules for reviews
const moderationReviewRules = `
    // ====== Moderated Reviews ======
    match /reviews/{reviewId} {
      // Public can read approved reviews
      allow read: if resource.data.moderationStatus == 'approved' || 
                    (isSignedIn() && resource.data.authorId == request.auth.uid);
      
      // Only authenticated, verified users can create reviews with rate limiting
      allow create: if isValidReview() && (hasAppCheck() || __DEV__);
      
      // Authors can update their own reviews, or moderators can update moderation status
      allow update: if isSignedIn() && 
        ((resource.data.authorId == request.auth.uid &&
          request.resource.data.authorId == resource.data.authorId && // Can't change author
          isValidString(request.resource.data.content, 10, 5000)) ||
         (canModerateContent() && 
          hasValidModerationFields() && 
          isValidModerationAction()) ||
         (request.resource.data.diff(resource.data).affectedKeys().hasOnly(['views'])));
      
      // Authors can delete their own reviews, moderators can delete any
      allow delete: if isSignedIn() && 
        (resource.data.authorId == request.auth.uid || canModerateContent());
    }
`;

// Add user reputation system
const reputationRules = `
    // ====== User Reputation ======
    match /users/{userId}/reputation/{reputationId} {
      // Users can read their own reputation
      allow read: if isOwner(userId);
      
      // Only system or moderators can create/update reputation
      allow create, update: if false; // Managed by Cloud Functions
      
      // No direct deletion
      allow delete: if false;
    }
`;

// Add rate limiting improvements
const rateLimitingRules = `
    // ====== Enhanced Rate Limiting ======
    match /rateLimits/{userId}/actions/{action} {
      // Users can read their own rate limit data
      allow read: if isOwner(userId);
      
      // System functions can write rate limit data
      allow write: if false; // Managed by Cloud Functions
    }
`;

// Insert the new functions and rules
if (!rulesContent.includes('Moderation Functions')) {
  // Find the helper functions section and add moderation functions after it
  rulesContent = rulesContent.replace(
    '// ====== Helper Functions ======',
    `// ====== Helper Functions ======${moderationFunctions}`
  );
  
  // Find the reviews rules and replace with moderated version
  rulesContent = rulesContent.replace(
    /match \/reviews\/{reviewId} {[\s\S]*?allow delete:[\s\S]*?}/,
    moderationReviewRules.trim()
  );
  
  // Add reputation rules before the final deny rule
  rulesContent = rulesContent.replace(
    '// ====== Deny All Other Access ======',
    `${reputationRules.trim()}\n\n    // ====== Deny All Other Access ======`
  );
  
  // Add rate limiting improvements
  rulesContent = rulesContent.replace(
    /match \/rateLimits\/{userId}\/actions\/{action} {[\s\S]*?allow read, write: if isOwner\(userId\);[\s\S]*?}/,
    `match /rateLimits/{userId}/actions/{action} {
      // Users can read their own rate limit data
      allow read: if isOwner(userId);
      
      // System functions can write rate limit data
      allow write: if false; // Managed by Cloud Functions
    }`
  );
  
  // Write the updated rules back to file
  fs.writeFileSync(rulesPath, rulesContent);
  console.log('✅ Firestore rules updated with moderation features');
} else {
  console.log('ℹ️  Firestore rules already contain moderation features');
}