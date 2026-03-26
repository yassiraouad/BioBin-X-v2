import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit, addDoc, serverTimestamp, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut };
