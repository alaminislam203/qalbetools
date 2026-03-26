'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import Link from 'next/link';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  // Simple admin check: Based on the users I've seen in the logs/context
  const isAdmin = user?.email === 'ai729776@gmail.com' || user?.email === 'filehubtop@gmail.com' || user?.email === 'alaminislam203@gmail.com'; 

  useEffect(() => {
    if (user && isAdmin) {
      fetchOrders();
    }
  }, [user, isAdmin]);

  const fetchOrders = async () => {
    if (!db) return;
    setFetching(true);
    try {
      const q = query(collection(db, 'orders'), where('status', '==', 'pending'));
      const snapshot = await getDocs(q);
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersData);
    } catch (err) {
      console.error("Fetch Orders Error:", err);
    } finally {
      setFetching(false);
    }
  };

  const handleApprove = async (order: any) => {
    if (!db) return;
    if (!confirm(`Approve order for ${order.userEmail}?`)) return;

    try {
      // 1. Update order status
      const orderRef = doc(db, 'orders', order.id);
      await updateDoc(orderRef, {
        status: 'completed',
        approvedAt: serverTimestamp()
      });

      // 2. Update user tier
      const userRef = doc(db, 'users', order.userId);
      await updateDoc(userRef, {
        tier: 'pro',
        paymentStatus: 'active',
        dailyLimit: 100 // Upgrade to 100 requests per day
      });

      alert("User upgraded to PRO successfully!");
      fetchOrders(); // Refresh list
    } catch (err) {
      console.error("Approval Error:", err);
      alert("Failed to approve order.");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-black">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-slate-50 dark:bg-black">
        <div className="w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
           <svg className="w-12 h-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
           </svg>
        </div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">Restricted Access</h1>
        <p className="text-xl font-bold mb-8 text-slate-500">You do not have permissions to view this panel.</p>
        <Link href="/" className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black shadow-xl shadow-indigo-600/20 transition-all active:scale-95">Return to Site</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black p-4 md:p-12 text-slate-900 dark:text-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
            <div>
                <h1 className="text-5xl font-black mb-2 tracking-tighter uppercase italic">Order <span className="text-indigo-600">Verification</span></h1>
                <p className="text-slate-500 font-bold tracking-tight">Approve manual payments and activate Pro tiers.</p>
            </div>
            <button 
                onClick={fetchOrders} 
                disabled={fetching}
                className="flex items-center gap-3 px-6 py-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-xl shadow-slate-200/50 dark:shadow-none font-black text-sm uppercase tracking-widest disabled:opacity-50"
            >
                {fetching ? 'Refreshing...' : 'Refresh List'}
                <svg className={`w-5 h-5 text-indigo-500 ${fetching ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
            </button>
        </div>

        <div className="grid gap-8">
          {orders.length === 0 ? (
            <div className="p-32 bg-white dark:bg-slate-900 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-slate-800 text-center flex flex-col items-center justify-center">
               <div className="w-20 h-20 bg-slate-50 dark:bg-slate-950 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
               </div>
               <h3 className="text-2xl font-black text-slate-300 uppercase tracking-widest">Inbox Zero</h3>
               <p className="text-slate-400 font-bold mt-2">All orders have been processed.</p>
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="group bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none flex flex-col md:flex-row md:items-center justify-between gap-10 hover:border-indigo-500 transition-all duration-300">
                <div className="space-y-4 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-4 py-1.5 bg-indigo-500 text-white text-[10px] font-black tracking-widest uppercase rounded-full shadow-lg shadow-indigo-600/20">{order.method}</span>
                    <span className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black tracking-widest uppercase rounded-full">PLAN: {order.tier || 'PRO'}</span>
                  </div>
                  
                  <div>
                    <h4 className="text-2xl font-black mb-1 leading-none">{order.userEmail}</h4>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{new Date(order.timestamp?.seconds * 1000).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}</p>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Transaction ID</span>
                    <code className="text-lg font-black text-indigo-600 dark:text-indigo-400 select-all">{order.transactionId}</code>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3 shrink-0">
                    <button 
                        onClick={() => handleApprove(order)}
                        className="px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black transition-all shadow-xl shadow-indigo-600/30 active:scale-95 flex items-center justify-center gap-3"
                    >
                        Approve Order
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </button>
                    <button className="px-10 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 rounded-2xl font-bold transition-all text-xs uppercase tracking-widest">
                        Reject / Spam
                    </button>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="mt-20 text-center border-t border-slate-200 dark:border-slate-800 pt-10">
            <Link href="/" className="text-sm font-black text-slate-400 hover:text-indigo-500 transition-colors uppercase tracking-widest">← Back to Homepage</Link>
        </div>
      </div>
    </div>
  );
}
