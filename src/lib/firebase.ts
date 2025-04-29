// Import Firebase modules
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  orderBy,
  limit
} from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBpgAQbogfh6LJBA-8aAKQEa3_xzYqMw5Q",
  authDomain: "invoiceaura-ff756.firebaseapp.com",
  projectId: "invoiceaura-ff756",
  storageBucket: "invoiceaura-ff756.firebasestorage.app",
  messagingSenderId: "741397826276",
  appId: "1:741397826276:web:9fe76619d8014c5b8a3af1",
  measurementId: "G-NGQ27ZZ00V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Google authentication function
export const signInWithGoogle = () => {
  return signInWithPopup(auth, googleProvider);
};

// Sign out function
export const signOut = () => {
  return firebaseSignOut(auth);
};

// Export auth instance and auth state listener
export { auth, onAuthStateChanged, db };
export { 
  collection, 
  addDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  deleteDoc, 
  doc,
  serverTimestamp,
  orderBy,
  limit
};
export default app; 