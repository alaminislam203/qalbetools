'use client';

import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { PLANS, PlanId } from '@/lib/plans';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier: PlanId;
}

export default function PaymentModal({ isOpen, onClose, tier }: PaymentModalProps) {
  const [method, setMethod] = useState<'binance' | 'bkash'>('bkash');
  const [txId, setTxId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const plan = PLANS[tier] || PLANS.plus;

  useEffect(() => {
    if (isOpen) {
      setSuccess(false);
      setTxId('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (txId.trim().length < 6) {
      alert("Please enter a valid Transaction ID.");
      return;
    }
    
    setSubmitting(true);
    try {
      if (!auth || !db) return;
      const user = auth.currentUser;
      if (!user) throw new Error("Not logged in");

      await addDoc(collection(db, 'orders'), {
        userId: user.uid,
        userEmail: user.email,
        tier: tier,
        method: method,
        transactionId: txId,
        status: 'pending',
        timestamp: serverTimestamp()
      });

      await updateDoc(doc(db, 'users', user.uid), {
        paymentStatus: 'pending'
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 3000);
    } catch (err) {
      alert("Submission failed. Check console.");
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
          <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">✕</button>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-indigo-500/10 text-indigo-500 mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
          </div>
          <h2 className="text-2xl font-black tracking-tight">Activate <span className={plan.accentColor.includes('indigo') ? 'text-indigo-600' : 'text-blue-600'}>{plan.label}</span></h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manual payment verification for your upgrade.</p>
        </div>

        {!success ? (
          <div className="p-8">
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-8">
              {['bkash', 'binance'].map((m) => (
                <button key={m} onClick={() => setMethod(m as any)} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${method === m ? 'bg-white dark:bg-slate-700 shadow-md text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                    {m === 'bkash' ? 'bKash/Nagad' : 'Binance Pay'}
                </button>
              ))}
            </div>

            <div className="mb-8 p-6 bg-slate-50 dark:bg-slate-950/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              {method === 'bkash' ? (
                <div>
                  <p className="text-sm font-medium leading-relaxed mb-4 text-slate-600 dark:text-slate-400">
                    Send exactly <span className="font-black text-slate-900 dark:text-white">{plan.price * 120} BDT</span> via "Send Money" to:
                  </p>
                  <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="font-mono text-lg font-black tracking-widest">017XXXXXXXX</span>
                    <button className="text-[10px] font-black uppercase tracking-widest text-indigo-500" onClick={() => navigator.clipboard.writeText('017XXXXXXXX')}>Copy</button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium leading-relaxed mb-4 text-slate-600 dark:text-slate-400">
                    Send exactly <span className="font-black text-slate-900 dark:text-white">${plan.price} USDT</span> to Binance Pay ID:
                  </p>
                  <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="font-mono text-lg font-black tracking-widest">487638075</span>
                    <button className="text-[10px] font-black uppercase tracking-widest text-indigo-500" onClick={() => navigator.clipboard.writeText('487638075')}>Copy</button>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input required type="text" value={txId} onChange={(e) => setTxId(e.target.value)} placeholder="Paste Transaction ID here..." className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono text-sm" />
              <button type="submit" disabled={submitting} className={`w-full py-5 text-white font-black rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 ${plan.id === 'plus' ? 'bg-blue-600 shadow-blue-600/20' : 'bg-indigo-600 shadow-indigo-600/20'}`}>
                {submitting ? 'Submitting...' : `Submit Upgrade Request`}
              </button>
            </form>
          </div>
        ) : (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-emerald-500 shadow-xl shadow-emerald-500/20 flex items-center justify-center text-white mb-6 animate-bounce">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <h3 className="text-2xl font-black mb-2">Request Submitted</h3>
            <p className="text-slate-500 text-sm font-medium">Verified within 1-4 hours.</p>
          </div>
        )}
      </div>
    </div>
  );
}
