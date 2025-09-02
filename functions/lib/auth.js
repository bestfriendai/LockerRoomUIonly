"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserProfile = exports.updateUserProfile = exports.onUserDelete = exports.onUserCreate = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
// Trigger when a new user is created
exports.onUserCreate = functions.auth.user().onCreate(async (user) => {
    try {
        const userDoc = {
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            displayName: user.displayName || "",
            photoURL: user.photoURL || "",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            isOnline: false,
            lastActive: admin.firestore.FieldValue.serverTimestamp(),
            role: "user",
            status: "active",
            preferences: {
                notifications: {
                    email: true,
                    push: true,
                    inApp: true,
                },
                privacy: {
                    profileVisible: true,
                    showOnlineStatus: true,
                },
            },
        };
        await db.collection("users").doc(user.uid).set(userDoc);
        // Create user stats document
        await db.collection("userStats").doc(user.uid).set({
            reviewsCount: 0,
            commentsCount: 0,
            likesReceived: 0,
            profileViews: 0,
            joinedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        functions.logger.info(`User profile created for ${user.uid}`);
    }
    catch (error) {
        functions.logger.error("Error creating user profile:", error);
    }
});
// Trigger when a user is deleted
exports.onUserDelete = functions.auth.user().onDelete(async (user) => {
    try {
        const batch = db.batch();
        // Delete user document
        batch.delete(db.collection("users").doc(user.uid));
        // Delete user stats
        batch.delete(db.collection("userStats").doc(user.uid));
        // Delete user's private data
        const privateDataRef = db.collection("users").doc(user.uid).collection("private");
        const privateDataSnapshot = await privateDataRef.get();
        privateDataSnapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        // Anonymize user's reviews (don't delete to preserve content)
        const reviewsSnapshot = await db.collection("reviews")
            .where("authorId", "==", user.uid)
            .get();
        reviewsSnapshot.docs.forEach((doc) => {
            batch.update(doc.ref, {
                authorId: "deleted-user",
                authorName: "Deleted User",
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        });
        await batch.commit();
        functions.logger.info(`User data cleaned up for ${user.uid}`);
    }
    catch (error) {
        functions.logger.error("Error cleaning up user data:", error);
    }
});
// Update user profile
exports.updateUserProfile = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
    }
    const { uid } = context.auth;
    const allowedFields = [
        "displayName",
        "bio",
        "location",
        "interests",
        "preferences",
        "anonymousUsername",
    ];
    try {
        const updateData = {
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        // Only allow updating specific fields
        Object.keys(data).forEach((key) => {
            if (allowedFields.includes(key)) {
                updateData[key] = data[key];
            }
        });
        await db.collection("users").doc(uid).update(updateData);
        return { success: true, message: "Profile updated successfully" };
    }
    catch (error) {
        functions.logger.error("Error updating user profile:", error);
        throw new functions.https.HttpsError("internal", "Failed to update profile");
    }
});
// Get user profile
exports.getUserProfile = functions.https.onCall(async (data, context) => {
    var _a, _b, _c, _d;
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
    }
    const { userId } = data;
    const requestingUserId = context.auth.uid;
    try {
        const userDoc = await db.collection("users").doc(userId).get();
        if (!userDoc.exists) {
            throw new functions.https.HttpsError("not-found", "User not found");
        }
        const userData = userDoc.data();
        // Return different data based on privacy settings and relationship
        const isOwnProfile = userId === requestingUserId;
        const profileData = {
            uid: userData === null || userData === void 0 ? void 0 : userData.uid,
            displayName: userData === null || userData === void 0 ? void 0 : userData.displayName,
            bio: userData === null || userData === void 0 ? void 0 : userData.bio,
            location: userData === null || userData === void 0 ? void 0 : userData.location,
            interests: userData === null || userData === void 0 ? void 0 : userData.interests,
            createdAt: userData === null || userData === void 0 ? void 0 : userData.createdAt,
        };
        if (isOwnProfile) {
            // Return full profile for own profile
            profileData.email = userData === null || userData === void 0 ? void 0 : userData.email;
            profileData.preferences = userData === null || userData === void 0 ? void 0 : userData.preferences;
            profileData.emailVerified = userData === null || userData === void 0 ? void 0 : userData.emailVerified;
        }
        else {
            // Return limited profile for others
            if (((_b = (_a = userData === null || userData === void 0 ? void 0 : userData.preferences) === null || _a === void 0 ? void 0 : _a.privacy) === null || _b === void 0 ? void 0 : _b.profileVisible) === false) {
                throw new functions.https.HttpsError("permission-denied", "Profile is private");
            }
            if ((_d = (_c = userData === null || userData === void 0 ? void 0 : userData.preferences) === null || _c === void 0 ? void 0 : _c.privacy) === null || _d === void 0 ? void 0 : _d.showOnlineStatus) {
                profileData.isOnline = userData === null || userData === void 0 ? void 0 : userData.isOnline;
                profileData.lastActive = userData === null || userData === void 0 ? void 0 : userData.lastActive;
            }
        }
        // Get user stats
        const statsDoc = await db.collection("userStats").doc(userId).get();
        if (statsDoc.exists) {
            profileData.stats = statsDoc.data();
        }
        return profileData;
    }
    catch (error) {
        functions.logger.error("Error getting user profile:", error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "Failed to get profile");
    }
});
//# sourceMappingURL=auth.js.map