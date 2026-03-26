'use client';

import { useState, useEffect } from 'react';
import { auth, googleProvider, db } from '@/lib/firebase';
import { onAuthStateChanged, User, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user && db) {
        const userRef = doc(db, 'users', user.uid);
        const snapshot = await getDoc(userRef);
        if (snapshot.exists()) {
          setUserData(snapshot.data());
        } else {
          // Provision new user
          const initialData = {
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            tier: 'free',
            paymentStatus: 'none',
            createdAt: Date.now(),
            dailyLimit: 20
          };
          await setDoc(userRef, initialData);
          setUserData(initialData);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    if (!auth) return;
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Login Error:", err);
      // More descriptive error for common misconfigurations
      if (err.code === 'auth/unauthorized-domain') {
        alert("Domain Unauthorized: Add this domain to your Firebase Authorized Domains.");
      } else if (err.code === 'auth/configuration-not-found') {
        alert("Configuration missing: Have you enabled Google Sign-In in Firebase Console?");
      } else {
        alert("Login failed: " + err.message);
      }
    }
  };

  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
  };

  return { user, userData, loading, login, logout };
}
