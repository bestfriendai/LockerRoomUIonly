# LockerRoom Talk: Backend Structure Document

This document lays out how LockerRoom Talk’s backend is organized, hosted, and secured. It’s written in everyday language so that anyone—technical or not—can understand how data flows, where it lives, and how the system stays reliable and safe.

## 1. Backend Architecture

### Overall Design

*   We use a serverless, cloud-based approach with **Firebase** as our primary backend. There is no custom server code—everything runs on Google’s managed services.
*   The mobile app (built in React Native) talks directly to Firebase services through their client SDKs.
*   We follow a provider pattern on the client (e.g., AuthProvider, ChatProvider, NotificationProvider) to keep authentication, real-time messaging, and notifications neatly separated and easy to maintain.

### Scalability, Maintainability, and Performance

*   **Scalability:** Firebase auto-scales to handle sudden spikes—new users, lots of chat traffic, or review reads don’t require manual server provisioning.
*   **Maintainability:** No server infrastructure to update or patch. All rules and logic live in Firebase (security rules, indexes), and can be changed through configuration files.
*   **Performance:** Data is replicated across multiple regions. Real-time updates use WebSockets under the hood, minimizing latency. Offline caching on the device keeps the app responsive even when the network is slow or intermittent.

## 2. Database Management

### Technologies Used

*   **Cloud Firestore (NoSQL):** Stores structured data like user profiles, reviews, chat rooms, messages, and notifications.
*   **Firebase Storage:** Holds user-uploaded media (profile pictures, review images).
*   **Firebase Authentication:** Manages sign-up, sign-in, password resets, and session tokens.

### Data Storage & Access

*   **Collections & Documents:** Firestore organizes data into collections (e.g., `users`, `reviews`, `chats`, `messages`, `notifications`), each containing documents with key/value fields.
*   **Real-Time Sync:** The client SDK listens for changes on specific documents or queries and updates the UI instantly.
*   **Offline Persistence:** Firestore caches recent reads and writes locally. When the network returns, local changes sync back up automatically.
*   **Indexing:** We define composite indexes for queries that filter or order by multiple fields (e.g., `reviews` by category + rating). Index configurations live alongside security rules.

## 3. Database Schema (NoSQL)

Below is a high-level, human-readable view of how our main collections and documents are structured.

• **Collection: users**\
– Document ID: `userId` (auto-generated)\
– Fields: • email (string)\
• displayName (string, anonymous handle)\
• age (number)\
• bio (string)\
• location (geopoint or null)\
• privacySettings (map of booleans)\
• createdAt (timestamp)\
• updatedAt (timestamp)

• **Collection: reviews**\
– Document ID: `reviewId`\
– Fields: • authorId (string, userId of creator)\
• title (string)\
• content (string)\
• rating (number, e.g., 1–5)\
• category (string)\
• target (string, e.g., a person or service name)\
• imageURLs (array of strings)\
• likeCount (number)\
• createdAt, updatedAt (timestamps)

• **Collection: chats**\
– Document ID: `chatId`\
– Fields: • participants (array of userIds)\
• isGroup (boolean)\
• title (string, for group rooms)\
• createdAt, updatedAt (timestamps)

• **Collection: messages**\
– Document ID: `messageId`\
– Fields: • chatId (string)\
• senderId (string, userId)\
• content (string)\
• type (string, e.g., "text" or "image")\
• imageURL (string, optional)\
• timestamp (timestamp)

• **Collection: notifications**\
– Document ID: `notificationId`\
– Fields: • userId (string, recipient)\
• type (string, e.g., "new_message", "review_liked")\
• referenceId (string, e.g., messageId or reviewId)\
• isRead (boolean)\
• createdAt (timestamp)

## 4. API Design and Endpoints

We rely on Firebase’s client SDKs rather than building custom REST or GraphQL servers. Under the hood, Firebase exposes RESTful endpoints, but most communication is handled by the SDK.

Authentication Endpoints (via Firebase Auth):

*   **Sign-Up:** Creates a new user account and issues a session token.
*   **Sign-In:** Verifies credentials and returns an ID token and refresh token.
*   **Password Reset:** Sends a password reset email link.

Firestore Endpoints (via client SDK):

*   **Read/Write Documents:** CRUD operations on collections (`users`, `reviews`, `chats`, `messages`, `notifications`).
*   **Real-Time Listeners:** Subscribe to document/collection changes for live updates.

Storage Endpoints (via client SDK):

*   **Upload Files:** Securely upload images to `gs://` buckets.
*   **Download URLs:** Generate time-limited URLs for client downloads.

All calls travel over HTTPS, and Firebase SDKs manage token renewals automatically.

## 5. Hosting Solutions

### Cloud Provider

*   **Google Cloud Platform (Firebase):** We use Firebase’s managed services—there are no virtual machines or Kubernetes clusters to configure.

### Benefits

*   **Reliability:** Google’s infrastructure guarantees >99.9% uptime with automatic failover across regions.
*   **Scalability:** Services autoscale by default—no manual intervention is needed to handle growth.
*   **Cost-Effectiveness:** Pay-as-you-go billing means we only pay for actual usage (reads, writes, storage), with a generous free tier for early users.

## 6. Infrastructure Components

• **Load Balancers & Global Replication**\
Firebase routes requests through Google’s global load-balancing network, ensuring fast response times wherever users are.

• **Content Delivery Network (CDN)**\
Firebase Storage automatically serves media assets via Google’s CDN, speeding up image loads on mobile devices worldwide.

• **Caching**\
– **Client-Side Caching:** Firestore SDK caches data locally for offline use.\
– **Server-Side Caching:** Internal Google infrastructure caches hot data at edge locations.

• **Indexing**\
Composite and single-field indexes (configured in `firestore.indexes.json`) speed up queries on sorted or filtered data.

• **Retry & Backoff**\
The Firestore connection manager handles transient network errors with exponential backoff before retrying.

## 7. Security Measures

• **Authentication & Authorization**\
All requests require a valid Firebase ID token. We use Firebase security rules to restrict data reads and writes:

*   Users can only read/write their own `users/{userId}` document.
*   Only the review’s author can update or delete `reviews/{reviewId}`.
*   Chat participants can read/write messages in their chat room.

• **Data Encryption**

*   **In transit:** All traffic is encrypted over HTTPS/TLS.
*   **At rest:** Google encrypts Firestore and Storage data by default.

• **Input Sanitization & Validation**\
Client utilities strip harmful characters from user input. Firestore rules enforce data types and required fields.

• **Least Privilege**\
Security rules grant the minimal permissions needed for each operation, reducing attack surface.

## 8. Monitoring and Maintenance

• **Firebase Console**

*   **Usage Metrics:** Track reads, writes, storage used, and auth sign-ins.
*   **Error Logs:** Monitor failed requests and security-rule rejections.

• **Alerts & Dashboards**

*   We can set up Google Cloud Monitoring alerts (e.g., high error rate, quota exhaustion).
*   Custom dashboards show real-time traffic and latency.

• **Rule and Index Audits**

*   We review security rules and indexes on every release to keep data access correct and queries fast.

• **Dependency Updates**

*   Firebase SDK versions are regularly updated to include security patches and performance improvements.

## 9. Conclusion and Overall Backend Summary

LockerRoom Talk’s backend is a lean, serverless setup powered entirely by Firebase. We’ve chosen this approach to:

*   Eliminate server maintenance and keep operational costs low.
*   Leverage built-in real-time sync, offline caching, and global distribution for a smooth user experience.
*   Enforce strict security rules and encryption by default, protecting privacy and anonymity.
*   Scale effortlessly as the community grows, without re-architecting core systems.

This structure aligns perfectly with our goal of delivering a secure, performant, and reliable dating-review platform, all while allowing the development team to focus on features and user experience rather than infrastructure overhead.
