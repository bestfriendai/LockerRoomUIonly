import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK
admin.initializeApp();

// Import function modules
import {
  onUserCreate,
  onUserDelete,
  updateUserProfile,
  getUserProfile,
} from "./auth";

// Export auth functions
export {
  onUserCreate,
  onUserDelete,
  updateUserProfile,
  getUserProfile,
};

// Health check function
export const healthCheck = functions.https.onRequest((req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});
