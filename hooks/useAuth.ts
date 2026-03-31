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
          const data = snapshot.data();
          // Ensure new fields exist for legacy users
          if (data.tier === 'pro' && !data.apiToken) {
              const newToken = crypto.randomUUID().replace(/-/g, '');
              await setDoc(userRef, { apiToken: newToken }, { merge: true });
              data.apiToken = newToken;
          }
          setUserData(data);
        } else {
          // Provision new user
          const initialData = {
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            tier: 'free',
            paymentStatus: 'none',
            createdAt: Date.now(),
            dailyLimit: 20,
            usage: {},
            totalTokens: 0
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

  const regenerateApiToken = async () => {
    if (!user || !db || userData?.tier !== 'pro') return;
    const newToken = crypto.randomUUID().replace(/-/g, '');
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, { apiToken: newToken }, { merge: true });
    setUserData({ ...userData, apiToken: newToken });
  };

  return { user, userData, loading, login, logout, regenerateApiToken };
}
