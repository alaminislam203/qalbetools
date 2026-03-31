'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp, getDoc, setDoc } from 'firebase/firestore';
import Link from 'next/link';
import { PLANS, PlanId } from '@/lib/plans';
import { SystemSettings } from '@/lib/system';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'users' | 'system'>('overview');
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'completed'>('pending');
  const [orders, setOrders] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [stats, setStats] = useState({ totalUsers: 0, totalOrders: 0, activePro: 0, pendingOrders: 0 });
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Admin access check
  const isAdmin = ['ai729776@gmail.com', 'filehubtop@gmail.com', 'alaminislam203@gmail.com'].includes(user?.email?.toLowerCase() || ''); 

  useEffect(() => {
    if (user && isAdmin) {
      if (activeTab === 'overview') fetchStats();
      if (activeTab === 'orders') fetchOrders();
      if (activeTab === 'users') fetchUsers();
      if (activeTab === 'system') fetchSystemSettings();
    }
  }, [user, isAdmin, activeTab, orderFilter]);

  const fetchStats = async () => {
    if (!db) return;
    setFetching(true);
    try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const ordersSnap = await getDocs(collection(db, 'orders'));
        const allUsers = usersSnap.docs.map(d => d.data());
        const allOrders = ordersSnap.docs.map(d => d.data());

        setStats({
            totalUsers: allUsers.length,
            totalOrders: allOrders.length,
            activePro: allUsers.filter((u: any) => u.tier === 'pro').length,
            pendingOrders: allOrders.filter((o: any) => o.status === 'pending').length
        });
    } catch (err) { console.error(err); }
    finally { setFetching(false); }
  };

  const fetchSystemSettings = async () => {
    if (!db) return;
    setFetching(true);
    try {
        const docRef = doc(db, 'system', 'settings');
        const snap = await getDoc(docRef);
        if (snap.exists()) setSystemSettings(snap.data() as SystemSettings);
    } catch (err) { console.error(err); }
    finally { setFetching(false); }
  };

  const updateToggle = async (key: keyof SystemSettings) => {
    if (!db || !systemSettings) return;
    const newVal = !systemSettings[key];
    try {
        const docRef = doc(db, 'system', 'settings');
        await setDoc(docRef, { [key]: newVal }, { merge: true });
        setSystemSettings({ ...systemSettings, [key]: newVal });
    } catch (err) { alert("Failed to update settings."); }
  };

  const fetchOrders = async () => {
    if (!db) return;
    setFetching(true);
    try {
      let q;
      if (orderFilter === 'all') q = query(collection(db, 'orders'));
      else q = query(collection(db, 'orders'), where('status', '==', orderFilter));
      
      const snapshot = await getDocs(q);
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersData.sort((a: any, b: any) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)));
    } catch (err) { setError("Failed to fetch orders."); }
    finally { setFetching(false); }
  };

  const fetchUsers = async () => {
    if (!db) return;
    setFetching(true);
    try {
        const snapshot = await getDocs(collection(db, 'users'));
        setUsersList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) { setError("Failed to fetch users."); }
    finally { setFetching(false); }
  };

  const handleApprove = async (order: any) => {
    if (!db) return;
    if (!confirm(`Approve ${order.tier.toUpperCase()} for ${order.userEmail}?`)) return;

    try {
      const plan = PLANS[order.tier as PlanId] || PLANS.pro;
      await updateDoc(doc(db, 'orders', order.id), { status: 'completed', approvedAt: serverTimestamp() });
      await updateDoc(doc(db, 'users', order.userId), {
        tier: order.tier,
        paymentStatus: 'active',
        dailyLimit: plan.dailyLimit
      });

      alert("User upgraded successfully!");
      fetchOrders();
    } catch (err) { alert("Failed to approve order."); }
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
        
        {/* Navigation */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div>
                <h1 className="text-5xl font-black mb-2 tracking-tighter uppercase italic bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-500">Admin <span className="text-slate-900 dark:text-white">Console</span></h1>
                <p className="text-slate-500 font-bold tracking-tight">System Management & Control</p>
            </div>
            
            <div className="flex flex-wrap bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
                {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'orders', label: 'Orders' },
                    { id: 'users', label: 'Users' },
                    { id: 'system', label: 'System' },
                ].map((t) => (
                    <button 
                        key={t.id}
                        onClick={() => setActiveTab(t.id as any)}
                        className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === t.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>
        </div>

        {fetching && (
            <div className="mb-8 flex items-center gap-2 text-indigo-500 font-bold animate-pulse">
                <span className="w-2 h-2 bg-indigo-500 rounded-full" /> Updating live data...
            </div>
        )}

        {/* ── Tab: Overview ── */}
        {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {[
                    { label: 'Total Users', val: stats.totalUsers, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/10' },
                    { label: 'Active Pro', val: stats.activePro, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/10' },
                    { label: 'Total Orders', val: stats.totalOrders, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
                    { label: 'Pending Orders', val: stats.pendingOrders, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/10' },
                ].map((s, i) => (
                    <div key={i} className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className={`w-10 h-10 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center mb-4`}>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                        <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">{s.label}</div>
                        <div className={`text-4xl font-black ${s.color}`}>{s.val}</div>
                    </div>
                ))}
            </div>
        )}

        {/* ── Tab: Orders ── */}
        {activeTab === 'orders' && (
            <div className="space-y-6">
                <div className="flex gap-2">
                    {['pending', 'completed', 'all'].map(f => (
                        <button key={f} onClick={() => setOrderFilter(f as any)} className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${orderFilter === f ? 'bg-slate-900 text-white dark:bg-white dark:text-black border-transparent' : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800'}`}>
                            {f}
                        </button>
                    ))}
                </div>
                <div className="grid gap-4">
                    {orders.map(order => (
                        <div key={order.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-black uppercase text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-full">{order.tier}</span>
                                    <span className="text-[10px] font-black uppercase text-slate-400">{order.method}</span>
                                </div>
                                <h4 className="font-black text-lg">{order.userEmail}</h4>
                                <code className="text-[10px] text-slate-500">TXID: {order.transactionId}</code>
                            </div>
                            {order.status === 'pending' && (
                                <button onClick={() => handleApprove(order)} className="px-6 py-2.5 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-indigo-500 transition-all">Approve Plan</button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* ── Tab: Users ── */}
        {activeTab === 'users' && (
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Identity</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Plan</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Limit</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                        {usersList.map((u) => (
                            <tr key={u.id}>
                                <td className="px-8 py-5">
                                    <div className="font-bold">{u.displayName}</div>
                                    <div className="text-xs text-slate-400">{u.email}</div>
                                </td>
                                <td className="px-8 py-5">
                                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter ${u.tier === 'pro' ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>{u.tier}</span>
                                </td>
                                <td className="px-8 py-5 font-black text-sm">{u.dailyLimit}</td>
                                <td className="px-8 py-5">
                                    <button className="text-indigo-500 font-bold text-xs hover:underline">Manage</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}

        {/* ── Tab: System ── */}
        {activeTab === 'system' && (
            <div className="grid gap-6">
                <div className="p-10 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800">
                    <h3 className="text-2xl font-black mb-8 border-b border-slate-100 dark:border-slate-800 pb-4">API Service Control</h3>
                    <div className="grid sm:grid-cols-2 gap-8">
                        {[
                            { key: 'youtube_enabled', label: 'YouTube Downloader' },
                            { key: 'facebook_enabled', label: 'Facebook Downloader' },
                            { key: 'instagram_enabled', label: 'Instagram Downloader' },
                            { key: 'tiktok_enabled', label: 'TikTok Downloader' },
                            { key: 'ai_features_enabled', label: 'AI Generator Tools' },
                            { key: 'maintenance_mode', label: 'Global Maintenance' },
                        ].map((s) => (
                            <div key={s.key} className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-indigo-500/50 transition-all">
                                <span className="font-black text-sm uppercase tracking-tight">{s.label}</span>
                                <button 
                                    onClick={() => updateToggle(s.key as any)}
                                    className={`relative w-14 h-8 rounded-full transition-all duration-300 ${systemSettings?.[s.key as keyof SystemSettings] ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                                >
                                    <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-all duration-300 ${systemSettings?.[s.key as keyof SystemSettings] ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        ))}
                    </div>
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
