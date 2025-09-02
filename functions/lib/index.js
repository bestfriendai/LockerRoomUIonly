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
exports.healthCheck = exports.getUserProfile = exports.updateUserProfile = exports.onUserDelete = exports.onUserCreate = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
// Initialize Firebase Admin SDK
admin.initializeApp();
// Import function modules
const auth_1 = require("./auth");
Object.defineProperty(exports, "onUserCreate", { enumerable: true, get: function () { return auth_1.onUserCreate; } });
Object.defineProperty(exports, "onUserDelete", { enumerable: true, get: function () { return auth_1.onUserDelete; } });
Object.defineProperty(exports, "updateUserProfile", { enumerable: true, get: function () { return auth_1.updateUserProfile; } });
Object.defineProperty(exports, "getUserProfile", { enumerable: true, get: function () { return auth_1.getUserProfile; } });
// Health check function
exports.healthCheck = functions.https.onRequest((req, res) => {
    res.status(200).json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
    });
});
//# sourceMappingURL=index.js.map