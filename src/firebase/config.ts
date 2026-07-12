import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// आपकी असली Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyA7mBhVBjKVoDWn7Haaxj-7cJ81raumD5k",
  authDomain: "travelwithshubham-c9fa9.firebaseapp.com",
  projectId: "travelwithshubham-c9fa9",
  storageBucket: "travelwithshubham-c9fa9.firebasestorage.app",
  messagingSenderId: "390059239223",
  appId: "1:390059239223:web:676d41a95556de2ebadcb2",
  measurementId: "G-M49MFEYNZF"
};

const app = initializeApp(firebaseConfig);
const dbId = (firebaseConfig as any).firestoreDatabaseId;
export const db = dbId && dbId !== '(default)' ? getFirestore(app, dbId) : getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// गूगल प्रोवाइडर एक्सपोर्ट ताकि Login पेज इसका इस्तेमाल कर सके
export const googleProvider = new GoogleAuthProvider();

// Error handling required by the Firebase Integration Skill
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
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
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
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// withTimeout helper to prevent indefinite hangs during Firestore operations
export function withTimeout<T>(promise: Promise<T>, timeoutMs: number, fallbackValue: T): Promise<T> {
  return new Promise<T>((resolve) => {
    const timer = setTimeout(() => {
      console.warn(`[Firestore] Operation timed out after ${timeoutMs}ms. Returning fallback.`);
      resolve(fallbackValue);
    }, timeoutMs);
    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        console.warn(`[Firestore] Operation failed, returning fallback:`, err);
        resolve(fallbackValue);
      });
  });
}

// withWriteTimeout helper to prevent indefinite hangs during Firestore write operations
export function withWriteTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMsg: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      console.warn(`[Firestore] Write operation timed out after ${timeoutMs}ms.`);
      reject(new Error(errorMsg));
    }, timeoutMs);
    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

// CRITICAL CONSTRAINT: Test the connection to Firestore when the app initially boots
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase connection test completed successfully.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Please check your Firebase configuration: Client is offline.");
    } else {
      console.warn("Firestore connection check info:", error);
    }
  }
}

testConnection();
export default app;
      
