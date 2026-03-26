'use client';

import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier: string;
}

export default function PaymentModal({ isOpen, onClose, tier }: PaymentModalProps) {
  const [method, setMethod] = useState<'binance' | 'bkash'>('binance');
  const [isBD, setIsBD] = useState(false);
  const [txId, setTxId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Basic IP/Geolocation check
    const checkGeo = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        if (data.country_code === 'BD') {
          setIsBD(true);
          setMethod('bkash');
        }
      } catch (e) {
        console.warn("Geo-check failed, defaulting to Binance.");
      }
    };
    if (isOpen) {
      checkGeo();
      setSuccess(false);
      setTxId('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txId.trim()) return;
    
    setSubmitting(true);
    try {
      if (!auth || !db) {
        alert("Firebase services are not initialized. Check environment variables.");
        return;
      }
      const user = auth.currentUser;
      if (!user) throw new Error("Not logged in");

      // Add order to Firestore
      await addDoc(collection(db, 'orders'), {
        userId: user.uid,
        userEmail: user.email,
        tier: tier,
        method: method,
        transactionId: txId,
        status: 'pending',
        timestamp: serverTimestamp()
      });

      // Update user's profile to pending status
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        paymentStatus: 'pending'
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 3000);
    } catch (err) {
      alert("Error submitting payment proof. Check console.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 text-center relative">
          <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
             ✕
          </button>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-indigo-500/10 text-indigo-500 mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          </div>
          <h2 className="text-2xl font-black tracking-tight">Activate <span className="text-indigo-600 dark:text-indigo-400">Professional</span></h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Submit payment proof for manual verification.</p>
        </div>

        {!success ? (
          <div className="p-8">
            {/* Method Toggle */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-8">
              <button 
                onClick={() => setMethod('binance')}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${method === 'binance' ? 'bg-white dark:bg-slate-700 shadow-md text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
              >
                Binance Pay
              </button>
              <button 
                onClick={() => setMethod('bkash')}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${method === 'bkash' ? 'bg-white dark:bg-slate-700 shadow-md text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
              >
                bKash (BD Only)
              </button>
            </div>

            {/* Method Instructions */}
            <div className="mb-8 p-6 bg-slate-50 dark:bg-slate-950/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              {method === 'binance' ? (
                <div>
                  <div className="text-xs font-black uppercase tracking-widest text-indigo-500 mb-2">Instructions</div>
                  <p className="text-sm font-medium leading-relaxed">
                    Send exactly <span className="font-bold text-slate-900 dark:text-white">$30 USDT</span> to Binance Pay ID:
                  </p>
                  <div className="mt-3 flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="font-mono text-lg font-black tracking-widest">487638075</span>
                    <button className="text-xs font-bold text-indigo-500 hover:text-indigo-600" onClick={() => navigator.clipboard.writeText('487638075')}>Copy</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-xs font-black uppercase tracking-widest text-pink-500 mb-2">Instructions</div>
                  <p className="text-sm font-medium leading-relaxed">
                    Send exactly <span className="font-bold text-slate-900 dark:text-white">3,600 BDT</span> via "Send Money" to:
                  </p>
                  <div className="mt-3 flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="font-mono text-lg font-black tracking-widest">01XXX XXXXXX</span>
                    <button className="text-xs font-bold text-pink-500 hover:text-pink-600">Copy</button>
                  </div>
                </div>
              )}
            </div>

            {/* Submission Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Transaction ID / TrxID</label>
                <input 
                  required
                  type="text" 
                  value={txId}
                  onChange={(e) => setTxId(e.target.value)}
                  placeholder="Paste your transaction proof here..."
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono"
                />
              </div>
              <button 
                type="submit"
                disabled={submitting}
                className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-3"
              >
                {submitting ? 'Submitting...' : 'Submit Verification Request'}
              </button>
            </form>
          </div>
        ) : (
          <div className="p-12 text-center flex flex-col items-center animate-in fade-in slide-in-from-bottom-4">
            <div className="w-20 h-20 rounded-full bg-emerald-500 shadow-xl shadow-emerald-500/20 flex items-center justify-center text-white mb-6">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="text-2xl font-black mb-2">Payment Submitted</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xs">
              Your request is being verified. Your account will be upgraded within <span className="font-bold text-slate-800 dark:text-slate-200">1-4 hours</span>.
            </p>
          </div>
        )}

        <div className="p-6 bg-slate-50 dark:bg-slate-950/50 text-center">
            <p className="text-[10px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-[0.2em]">Manual Verification System v1.0 • Secure Encryption</p>
        </div>
      </div>
    </div>
  );
}
