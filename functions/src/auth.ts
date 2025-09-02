import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

// Trigger when a new user is created
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
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
  } catch (error) {
    functions.logger.error("Error creating user profile:", error);
  }
});

// Trigger when a user is deleted
export const onUserDelete = functions.auth.user().onDelete(async (user) => {
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
  } catch (error) {
    functions.logger.error("Error cleaning up user data:", error);
  }
});

// Update user profile
export const updateUserProfile = functions.https.onCall(async (data, context) => {
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
    const updateData: any = {
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
  } catch (error) {
    functions.logger.error("Error updating user profile:", error);
    throw new functions.https.HttpsError("internal", "Failed to update profile");
  }
});

// Get user profile
export const getUserProfile = functions.https.onCall(async (data, context) => {
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
    const profileData: any = {
      uid: userData?.uid,
      displayName: userData?.displayName,
      bio: userData?.bio,
      location: userData?.location,
      interests: userData?.interests,
      createdAt: userData?.createdAt,
    };

    if (isOwnProfile) {
      // Return full profile for own profile
      profileData.email = userData?.email;
      profileData.preferences = userData?.preferences;
      profileData.emailVerified = userData?.emailVerified;
    } else {
      // Return limited profile for others
      if (userData?.preferences?.privacy?.profileVisible === false) {
        throw new functions.https.HttpsError("permission-denied", "Profile is private");
      }

      if (userData?.preferences?.privacy?.showOnlineStatus) {
        profileData.isOnline = userData?.isOnline;
        profileData.lastActive = userData?.lastActive;
      }
    }

    // Get user stats
    const statsDoc = await db.collection("userStats").doc(userId).get();
    if (statsDoc.exists) {
      profileData.stats = statsDoc.data();
    }

    return profileData;
  } catch (error) {
    functions.logger.error("Error getting user profile:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError("internal", "Failed to get profile");
  }
});
