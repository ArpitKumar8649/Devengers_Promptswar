"use client";

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

/**
 * Firebase is OPTIONAL. If the NEXT_PUBLIC_FIREBASE_* env vars are not set,
 * everything here returns null and the app runs fully without auth.
 */
const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(config.apiKey && config.projectId && config.appId);

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

export function getFirebaseAuth(): Auth | null {
  if (!isFirebaseConfigured || typeof window === "undefined") return null;
  try {
    if (!_app) _app = getApps().length ? getApp() : initializeApp(config);
    if (!_auth) _auth = getAuth(_app);
    return _auth;
  } catch (err) {
    console.error("Firebase auth init failed:", (err as Error).message);
    return null;
  }
}

export function getDb(): Firestore | null {
  if (!isFirebaseConfigured || typeof window === "undefined") return null;
  try {
    if (!_app) _app = getApps().length ? getApp() : initializeApp(config);
    if (!_db) _db = getFirestore(_app);
    return _db;
  } catch (err) {
    console.error("Firestore init failed:", (err as Error).message);
    return null;
  }
}
