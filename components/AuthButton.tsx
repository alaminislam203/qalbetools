'use client';

import { useState, useEffect } from 'react';
import { auth, googleProvider, db } from '@/lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { ref, get, set, update } from 'firebase/database';

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);

      if (user) {
        // Sync user to database on login
        const userRef = ref(db, `users/${user.uid}`);
        const snapshot = await get(userRef);
        
        if (!snapshot.exists()) {
          // Initialize new user metadata
          await set(userRef, {
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            tier: 'free',
            createdAt: Date.now(),
            dailyLimit: 20
          });
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowDropdown(false);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (loading) return (
    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
  );

  if (!user) {
    return (
      <button
        onClick={handleLogin}
        className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 group"
      >
        Sign In
        <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-3 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
      >
        {user.photoURL ? (
          <img src={user.photoURL} alt={user.displayName || 'User'} className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
            {user.displayName?.charAt(0) || 'U'}
          </div>
        )}
        <span className="hidden sm:block text-sm font-bold pr-2">{user.displayName?.split(' ')[0]}</span>
      </button>

      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Signed in as</p>
              <p className="font-bold truncate text-slate-800 dark:text-white">{user.email}</p>
            </div>
            
            <div className="p-2 text-sm">
              <button 
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-3 font-medium"
                onClick={() => setShowDropdown(false)}
              >
                My Dashboard
              </button>
              <button 
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-3 font-medium"
                onClick={() => setShowDropdown(false)}
              >
                API Usage
              </button>
              <div className="h-px bg-slate-100 dark:border-slate-800 my-1 mx-2" />
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 hover:text-red-500 transition-all flex items-center gap-3 font-bold"
              >
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
