import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getDatabase, ref, set, get, child, onValue, update, remove, runTransaction } from "firebase/database";

export const firebaseConfig = {
  apiKey: "AIzaSyBiigh0j7Z4rD1sZUDHMlj3kBkQgRNdZs8",
  authDomain: "doozy-fce9f.firebaseapp.com",
  databaseURL: "https://doozy-fce9f-default-rtdb.firebaseio.com",
  projectId: "doozy-fce9f",
  storageBucket: "doozy-fce9f.firebasestorage.app",
  messagingSenderId: "714287037350",
  appId: "1:714287037350:web:fc4f6f21ac62de1efbed67",
  measurementId: "G-PBPTY8J544"
};

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getDatabase(app);
export const database = db;

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  ref,
  set,
  get,
  child,
  onValue,
  update,
  remove,
  runTransaction
};
export default app;
