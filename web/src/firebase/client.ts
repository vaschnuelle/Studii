import { initializeApp, type FirebaseApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';

/**
 * Reads Firebase web config from Vite environment variables.
 *
 * @returns Parsed Firebase client configuration
 */
function readFirebaseConfig() {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
    appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
  };
}

let appInstance: FirebaseApp | null = null;

/**
 * Returns the singleton Firebase app, initializing on first use.
 *
 * @returns Initialized Firebase app
 */
export function getFirebaseApp(): FirebaseApp {
  if (!appInstance) {
    appInstance = initializeApp(readFirebaseConfig());
  }
  return appInstance;
}

/**
 * Returns Auth, Firestore, and Functions clients with optional local emulator wiring.
 */
export function getFirebaseClients() {
  const app = getFirebaseApp();
  const auth = getAuth(app);
  const db = getFirestore(app);
  const functions = getFunctions(app);

  if (import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    connectFunctionsEmulator(functions, '127.0.0.1', 5001);
  }

  return { app, auth, db, functions };
}
