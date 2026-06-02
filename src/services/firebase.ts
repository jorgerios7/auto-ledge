import { initializeApp, getApps, getApp } from 'firebase/app';
import { Auth, initializeAuth } from 'firebase/auth';
// @ts-ignore
import { getReactNativePersistence } from 'firebase/auth';
import { initializeFirestore, Firestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// REPLACE THESE CONFIG DETAILS WITH YOUR FIREBASE PROJECT CONFIG
// To configure, set your credentials here. If left empty, AutoLedge will run in local-only demo mode.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

let app;
let auth: Auth | null = null;
let db: Firestore | null = null;
let isFirebaseConfigured = false;

// Check if config keys are provided
if (firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.apiKey !== "SUA_API_KEY") {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    
    // Set up auth with AsyncStorage persistence for React Native
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
    
    db = initializeFirestore(app, {
      ignoreUndefinedProperties: true
    });
    isFirebaseConfigured = true;
    console.log('Firebase initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
  }
} else {
  console.log('Firebase configuration not found. AutoLedge running in offline/demo mode with Local Storage.');
}

// REPLACE THIS WITH YOUR WEB CLIENT ID FROM FIREBASE/GOOGLE CLOUD CONSOLE
// (Needed for Google Sign-In authentication flow)
const googleWebClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || ''; // Loaded from .env file

export { auth, db, isFirebaseConfigured, googleWebClientId };
export default app;
