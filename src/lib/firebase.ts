import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  Firestore,
  serverTimestamp
} from 'firebase/firestore';

export interface FirebaseConfig {
  apiKey: string;
  authDomain?: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
}

let firebaseAppInstance: FirebaseApp | null = null;
let firestoreInstance: Firestore | null = null;

export function getFirebaseClient(config: FirebaseConfig): { app: FirebaseApp; db: Firestore } {
  if (getApps().length > 0) {
    const existing = getApp();
    const db = getFirestore(existing);
    return { app: existing, db };
  }

  firebaseAppInstance = initializeApp({
    apiKey: config.apiKey,
    authDomain: config.authDomain || `${config.projectId}.firebaseapp.com`,
    projectId: config.projectId,
    storageBucket: config.storageBucket || `${config.projectId}.appspot.com`,
    messagingSenderId: config.messagingSenderId,
    appId: config.appId,
  });

  firestoreInstance = getFirestore(firebaseAppInstance);
  return { app: firebaseAppInstance, db: firestoreInstance };
}

export async function testGoogleCloudConnection(config: FirebaseConfig): Promise<{ success: boolean; message: string }> {
  try {
    const { db } = getFirebaseClient(config);
    const testDocRef = doc(db, 'nexus_system_health', 'connection_test');

    await setDoc(testDocRef, {
      status: 'connected',
      client: 'NexusOS Pro',
      lastPing: new Date().toISOString(),
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      message: 'Successfully connected to Google Cloud Firestore!',
    };
  } catch (error: any) {
    console.error('Firebase test error:', error);
    return {
      success: false,
      message: error?.message || 'Could not connect to Firebase Firestore. Please verify your Project ID and API Key.',
    };
  }
}

export async function syncStateToFirestore(
  config: FirebaseConfig,
  userId: string,
  state: any
): Promise<boolean> {
  try {
    const { db } = getFirebaseClient(config);
    const userDocRef = doc(db, 'nexus_users', userId || 'default_user');

    await setDoc(userDocRef, {
      ...state,
      lastSyncedAt: new Date().toISOString(),
      updatedAt: serverTimestamp(),
    }, { merge: true });

    return true;
  } catch (err) {
    console.error('Error syncing to Firestore:', err);
    return false;
  }
}

export async function fetchStateFromFirestore(
  config: FirebaseConfig,
  userId: string
): Promise<any | null> {
  try {
    const { db } = getFirebaseClient(config);
    const userDocRef = doc(db, 'nexus_users', userId || 'default_user');
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (err) {
    console.error('Error fetching from Firestore:', err);
    return null;
  }
}
