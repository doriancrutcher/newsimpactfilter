import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs
} from 'firebase/firestore';

// Your Firebase configuration from .env file
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || 'demo-app-id',
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || 'demo-measurement-id'
};

// Initialize Firebase
let app: any;
let auth: any;
let db: any;

// Check if we're in development mode and Firebase is not configured
const hasFirebaseConfig = process.env.REACT_APP_FIREBASE_API_KEY && 
                         process.env.REACT_APP_FIREBASE_API_KEY !== 'demo-api-key';

if (hasFirebaseConfig) {
  // Use real Firebase
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  // Mock Firebase for development
  console.warn('Firebase not configured. Using mock authentication for development.');
  
  // Create mock auth and db objects
  auth = {
    currentUser: null,
    onAuthStateChanged: (callback: (user: any) => void) => {
      // Simulate auth state change
      setTimeout(() => callback(null), 100);
      return () => {};
    }
  } as any;
  
  db = {
    collection: () => ({
      doc: () => ({
        get: async () => ({ exists: false, data: () => null }),
        set: async () => {},
        update: async () => {}
      })
    })
  } as any;
}

export { auth, db };

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// User profile interface
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  impactPreferences?: {
    categories: string[];
    urgencyThreshold: 'low' | 'medium' | 'high';
    notifications: boolean;
  };
  createdAt: Date;
  lastLogin: Date;
  analysisCount?: number;
  lastAnalysisDate?: string; // YYYY-MM-DD
  hasCompletedOnboarding?: boolean;
}

// Check if we're using mock Firebase
const isMockMode = !hasFirebaseConfig;

// Google Sign-In function
export const signInWithGoogle = async (): Promise<User> => {
  if (isMockMode) {
    // Mock user for development
    const mockUser = {
      uid: 'mock-user-id',
      email: 'demo@example.com',
      displayName: 'Demo User',
      photoURL: null
    } as User;
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return mockUser;
  }
  
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user profile exists in Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      // Create new user profile for first-time Google sign-in
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName || undefined,
        photoURL: user.photoURL || undefined,
        impactPreferences: {
          categories: [
            'Taxes & Income', 'Healthcare & Insurance', 'Social Security & Retirement', 'Education & Student Loans', 
            'Immigration', 'Employment & Jobs', 'Housing & Real Estate', 'Environment & Energy', 
            'Transportation & Gas', 'Consumer Protection', 'Small Business'
          ],
          urgencyThreshold: 'medium',
          notifications: true
        },
        createdAt: new Date(),
        lastLogin: new Date(),
        analysisCount: 0,
        lastAnalysisDate: '1970-01-01',
        hasCompletedOnboarding: false
      };
      
      await setDoc(doc(db, 'users', user.uid), userProfile);
    } else {
      // Update last login time for existing user
      await updateDoc(doc(db, 'users', user.uid), {
        lastLogin: new Date(),
        displayName: user.displayName || userDoc.data().displayName,
        photoURL: user.photoURL || userDoc.data().photoURL
      });
    }
    
    return user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Authentication functions
export const signUp = async (email: string, password: string, displayName?: string): Promise<User> => {
  if (isMockMode) {
    const mockUser = {
      uid: 'mock-user-id',
      email: email,
      displayName: displayName || 'Demo User',
      photoURL: null
    } as User;
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockUser;
  }
  
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update display name if provided
    if (displayName) {
      await updateProfile(user, { displayName });
    }
    
    // Create user profile in Firestore
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      displayName: displayName || user.displayName || undefined,
      impactPreferences: {
        categories: [
          'Taxes & Income', 'Healthcare & Insurance', 'Social Security & Retirement', 'Education & Student Loans', 
          'Immigration', 'Employment & Jobs', 'Housing & Real Estate', 'Environment & Energy', 
          'Transportation & Gas', 'Consumer Protection', 'Small Business'
        ],
        urgencyThreshold: 'medium',
        notifications: true
      },
      createdAt: new Date(),
      lastLogin: new Date(),
      analysisCount: 0,
      lastAnalysisDate: '1970-01-01',
      hasCompletedOnboarding: false
    };
    
    await setDoc(doc(db, 'users', user.uid), userProfile);
    
    return user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const signIn = async (email: string, password: string): Promise<User> => {
  if (isMockMode) {
    const mockUser = {
      uid: 'mock-user-id',
      email: email,
      displayName: 'Demo User',
      photoURL: null
    } as User;
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockUser;
  }
  
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update last login time
    await updateDoc(doc(db, 'users', user.uid), {
      lastLogin: new Date()
    });
    
    return user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const signOutUser = async (): Promise<void> => {
  if (isMockMode) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return;
  }
  
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// User profile functions
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  if (isMockMode) {
    // Return mock profile
    return {
      uid: uid,
      email: 'demo@example.com',
      displayName: 'Demo User',
      photoURL: undefined,
      impactPreferences: {
        categories: [
          'Taxes & Income', 'Healthcare & Insurance', 'Social Security & Retirement', 'Education & Student Loans', 
          'Immigration', 'Employment & Jobs', 'Housing & Real Estate', 'Environment & Energy', 
          'Transportation & Gas', 'Consumer Protection', 'Small Business'
        ],
        urgencyThreshold: 'medium',
        notifications: true
      },
      createdAt: new Date(),
      lastLogin: new Date(),
      analysisCount: 0,
      lastAnalysisDate: new Date().toISOString().split('T')[0],
      hasCompletedOnboarding: false
    };
  }
  
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>): Promise<void> => {
  if (isMockMode) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return;
  }
  
  try {
    await updateDoc(doc(db, 'users', uid), updates);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const updateImpactPreferences = async (
  uid: string, 
  preferences: UserProfile['impactPreferences']
): Promise<void> => {
  if (isMockMode) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return;
  }
  
  try {
    await updateDoc(doc(db, 'users', uid), {
      impactPreferences: preferences
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Auth state listener
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  if (isMockMode) {
    // Simulate auth state change
    setTimeout(() => callback(null), 100);
    return () => {};
  }
  
  return onAuthStateChanged(auth, callback);
};

// Save user's news preferences/history
export const saveNewsPreference = async (
  uid: string, 
  articleId: string, 
  preference: 'read' | 'bookmarked' | 'dismissed'
): Promise<void> => {
  try {
    await addDoc(collection(db, 'userNewsPreferences'), {
      uid,
      articleId,
      preference,
      timestamp: new Date()
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getUserNewsPreferences = async (uid: string): Promise<any[]> => {
  try {
    const q = query(collection(db, 'userNewsPreferences'), where('uid', '==', uid));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data());
  } catch (error: any) {
    throw new Error(error.message);
  }
}; 