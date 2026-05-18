import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { initializeFirestore, doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, onSnapshot, addDoc, orderBy, limit, getDocFromServer, Timestamp, runTransaction, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);

// Using initializeFirestore with custom settings to help with connectivity issues if standard gRPC fail
export const db = initializeFirestore(app, {}, firebaseConfig.firestoreDatabaseId);

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'system', 'health'));
    console.log("Firestore connection successful");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    } else {
      console.error("Firestore connectivity test failed:", error);
    }
  }
}
testConnection();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Auth helpers
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logOut = () => signOut(auth);

// Firestore error handling spec
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export { 
  doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, onSnapshot, addDoc, orderBy, limit, Timestamp, runTransaction, serverTimestamp, onAuthStateChanged, RecaptchaVerifier, signInWithPhoneNumber
};
