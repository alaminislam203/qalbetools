'use client';

import { useEffect } from 'react';
import { analytics } from '@/lib/firebase';
import { Analytics } from 'firebase/analytics';

export default function FirebaseProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Analytics initialization is handled inside lib/firebase.ts via a promise.
    // We just need to trigger the import/usage here on the client side.
    if (analytics) {
      analytics.then((instance: Analytics | null) => {
        if (instance) {
          console.log("Firebase Analytics initialized.");
        }
      }).catch((err: any) => {
        console.error("Firebase Analytics failed to initialize:", err);
      });
    }
  }, []);

  return <>{children}</>;
}
