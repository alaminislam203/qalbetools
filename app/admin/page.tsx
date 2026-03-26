'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import Link from 'next/link';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'users'>('orders');
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'completed'>('pending');
  const [orders, setOrders] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Admin access check (case-insensitive for safety)
  const isAdmin = ['ai729776@gmail.com', 'filehubtop@gmail.com', 'alaminislam203@gmail.com'].includes(user?.email?.toLowerCase() || ''); 

  useEffect(() => {
    if (user && isAdmin) {
      if (activeTab === 'orders') fetchOrders();
      if (activeTab === 'users') fetchUsers();
    }
  }, [user, isAdmin, activeTab, orderFilter]);

  const fetchOrders = async () => {
    if (!db) return;
    setFetching(true);
    setError(null);
    try {
      let q;
      if (orderFilter === 'all') {
        q = query(collection(db, 'orders'));
      } else {
        q = query(collection(db, 'orders'), where('status', '==', orderFilter));
      }
      
      const snapshot = await getDocs(q);
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersData.sort((a: any, b: any) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)));
    } catch (err: any) {
      console.error("Fetch Orders Error:", err);
      setError("Failed to fetch orders. Check Firestore rules.");
    } finally {
      setFetching(false);
    }
  };

  const fetchUsers = async () => {
    if (!db) return;
    setFetching(true);
    setError(null);
    try {
        const snapshot = await getDocs(collection(db, 'users'));
        const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsersList(usersData);
    } catch (err: any) {
        console.error("Fetch Users Error:", err);
        setError("Failed to fetch users. Check Firestore rules.");
    } finally {
        setFetching(false);
    }
  };

  const handleApprove = async (order: any) => {
    if (!db) return;
    if (!confirm(`Approve order for ${order.userEmail}?`)) return;

    try {
      const orderRef = doc(db, 'orders', order.id);
      await updateDoc(orderRef, {
        status: 'completed',
        approvedAt: serverTimestamp()
      });

      const userRef = doc(db, 'users', order.userId);
      await updateDoc(userRef, {
        tier: 'pro',
        paymentStatus: 'active',
        dailyLimit: 100
      });

      alert("User upgraded to PRO successfully!");
      fetchOrders();
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
        <p className="text-xl font-bold mb-8 text-slate-500 font-mono text-sm leading-none">{user?.email}</p>
        <Link href="/" className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black shadow-xl shadow-indigo-600/20 transition-all active:scale-95">Return to Site</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black p-4 md:p-8 text-slate-900 dark:text-white font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div>
                <h1 className="text-5xl font-black mb-2 tracking-tighter uppercase italic bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-500">Admin <span className="text-slate-900 dark:text-white">Console</span></h1>
                <p className="text-slate-500 font-bold tracking-tight">Managing {activeTab === 'orders' ? 'Transactions' : 'User Profiles'}</p>
            </div>
            
            <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <button 
                    onClick={() => setActiveTab('orders')}
                    className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'orders' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Orders
                </button>
                <button 
                    onClick={() => setActiveTab('users')}
                    className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Users
                </button>
            </div>
        </div>

        {error && (
            <div className="mb-8 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 font-bold">
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
            </div>
        )}

        {activeTab === 'orders' ? (
          <div className="space-y-8">
            <div className="flex flex-wrap items-center gap-4 mb-8">
                {['all', 'pending', 'completed'].map((f) => (
                    <button 
                        key={f}
                        onClick={() => setOrderFilter(f as any)}
                        className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                            orderFilter === f 
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-black border-transparent shadow-lg' 
                            : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800'
                        }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            <div className="grid gap-6">
              {orders.length === 0 ? (
                <div className="p-24 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 text-center">
                   <p className="text-slate-400 font-bold uppercase tracking-widest">No {orderFilter} orders found.</p>
                </div>
              ) : (
                orders.map(order => (
                  <div key={order.id} className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-indigo-500 transition-all duration-300">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-indigo-500 text-white text-[10px] font-black uppercase rounded-full">{order.method}</span>
                        <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full ${
                            order.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
                        }`}>{order.status}</span>
                      </div>
                      <h4 className="text-xl font-black">{order.userEmail}</h4>
                      <p className="text-xs font-mono bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-800 truncate">TXID: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{order.transactionId}</span></p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2 text-right">
                        <p className="text-xs text-slate-400 font-bold">{new Date(order.timestamp?.seconds * 1000).toLocaleString()}</p>
                        {order.status === 'pending' && (
                            <button 
                                onClick={() => handleApprove(order)}
                                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                            >
                                Approve
                            </button>
                        )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">User</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Tier</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Limit</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Joined</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                        {usersList.map((u) => (
                            <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="px-8 py-5">
                                    <div className="font-bold">{u.displayName}</div>
                                    <div className="text-xs text-slate-400">{u.email}</div>
                                </td>
                                <td className="px-8 py-5">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                        u.tier === 'pro' ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                    }`}>{u.tier || 'FREE'}</span>
                                </td>
                                <td className="px-8 py-5 font-black text-sm">{u.dailyLimit || 20}</td>
                                <td className="px-8 py-5">
                                    <span className={`text-[10px] font-black uppercase ${
                                        u.paymentStatus === 'active' ? 'text-green-500' : 
                                        u.paymentStatus === 'pending' ? 'text-amber-500 animate-pulse' : 'text-slate-300'
                                    }`}>{u.paymentStatus || 'NONE'}</span>
                                </td>
                                <td className="px-8 py-5 text-sm text-slate-400 font-medium">
                                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {usersList.length === 0 && (
                     <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest">No users found.</div>
                )}
            </div>
          </div>
        )}
        
        <div className="mt-20 text-center border-t border-slate-200 dark:border-slate-800 pt-10">
            <Link href="/" className="text-sm font-black text-slate-400 hover:text-indigo-500 transition-colors uppercase tracking-widest group">
                <span className="inline-block transition-transform group-hover:-translate-x-1 mr-2">←</span> Back to Homepage
            </Link>
        </div>
      </div>
    </div>
  );
}
