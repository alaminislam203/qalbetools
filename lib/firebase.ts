import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCqEfzOzDGe4lSLUxqe2KL6t4hFKHOHBdk",
  authDomain: "filehubtop.firebaseapp.com",
  databaseURL: "https://filehubtop-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "filehubtop",
  storageBucket: "filehubtop.firebasestorage.app",
  messagingSenderId: "284898778501",
  appId: "1:284898778501:web:6b8f542f4bb49a4248f8ec",
  measurementId: "G-J4SY1Q3555"
};

// Initialize Firebase (Singleton pattern for Next.js)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Services
const db = getDatabase(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Initialize Analytics (Client-side only)
const analytics = typeof window !== "undefined" ? isSupported().then(yes => yes ? getAnalytics(app) : null) : null;

export { app, db, auth, googleProvider, analytics };
