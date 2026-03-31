'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import {
  collection, getDocs, doc, updateDoc, serverTimestamp,
  getDoc, setDoc, deleteField
} from 'firebase/firestore';
import Link from 'next/link';
import { PLANS, PlanId, PlanConfig } from '@/lib/plans';
import { SystemSettings } from '@/lib/system';

// ─────────────────────────────────────────────────────────────────────────────
// SVG ICON COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
const Icon = {
  Users: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  Orders: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><rect x="1" y="3" width="15" height="13" rx="2"/><path strokeLinecap="round" strokeLinejoin="round" d="M16 8h2a2 2 0 012 2v6a3 3 0 01-3 3H7a3 3 0 01-3-3"/></svg>,
  Plans: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  System: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/></svg>,
  Overview: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>,
  TrendUp: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  Edit: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>,
  Check: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><polyline points="20 6 9 17 4 12"/></svg>,
  X: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Plus: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Minus: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Shield: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Ban: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>,
  Refresh: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>,
  Search: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Star: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Revenue: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
  Key: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>,
  Approve: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>,
};

const ADMIN_EMAILS = ['ai729776@gmail.com', 'filehubtop@gmail.com', 'alaminislam203@gmail.com'];
type AdminTab = 'overview' | 'orders' | 'users' | 'plans' | 'system';

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'completed'>('pending');

  const [orders, setOrders] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [stats, setStats] = useState({ totalUsers: 0, totalOrders: 0, activePro: 0, pendingOrders: 0, activePlus: 0, revenue: 0 });
  const [fetching, setFetching] = useState(false);

  // Users tab state
  const [userSearch, setUserSearch] = useState('');
  const [userTierFilter, setUserTierFilter] = useState<'all' | PlanId>('all');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editLimitVal, setEditLimitVal] = useState('');
  const [editPlanVal, setEditPlanVal] = useState<PlanId>('free');

  // Plans tab state
  const [editingPlanId, setEditingPlanId] = useState<PlanId | null>(null);
  const [planEdits, setPlanEdits] = useState<Partial<PlanConfig>>({});

  const isAdmin = ADMIN_EMAILS.includes(user?.email?.toLowerCase() || '');

  useEffect(() => {
    if (!user || !isAdmin) return;
    if (activeTab === 'overview') fetchStats();
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'system') fetchSystemSettings();
    // plans tab reads from local PLANS config
  }, [user, isAdmin, activeTab, orderFilter]);

  // ── Data Fetchers ────────────────────────────────────────────────────────
  const fetchStats = async () => {
    if (!db) return;
    setFetching(true);
    try {
      const [usersSnap, ordersSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'orders'))
      ]);
      const allUsers = usersSnap.docs.map(d => d.data());
      const allOrders = ordersSnap.docs.map(d => d.data());
      const activePro = allUsers.filter((u: any) => u.tier === 'pro').length;
      const activePlus = allUsers.filter((u: any) => u.tier === 'plus').length;
      setStats({
        totalUsers: allUsers.length,
        totalOrders: allOrders.length,
        activePro,
        activePlus,
        pendingOrders: allOrders.filter((o: any) => o.status === 'pending').length,
        revenue: activePro * 30 + activePlus * 10,
      });
    } catch (err) { console.error(err); }
    finally { setFetching(false); }
  };

  const fetchOrders = async () => {
    if (!db) return;
    setFetching(true);
    try {
      const snapshot = await getDocs(collection(db, 'orders'));
      let data = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
      if (orderFilter !== 'all') data = data.filter((o: any) => o.status === orderFilter);
      setOrders(data.sort((a: any, b: any) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)));
    } catch (err) { console.error(err); }
    finally { setFetching(false); }
  };

  const fetchUsers = async () => {
    if (!db) return;
    setFetching(true);
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      setUsersList(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) { console.error(err); }
    finally { setFetching(false); }
  };

  const fetchSystemSettings = async () => {
    if (!db) return;
    setFetching(true);
    try {
      const snap = await getDoc(doc(db, 'system', 'settings'));
      if (snap.exists()) setSystemSettings(snap.data() as SystemSettings);
    } catch (err) { console.error(err); }
    finally { setFetching(false); }
  };

  // ── Actions ──────────────────────────────────────────────────────────────
  const handleApprove = async (order: any) => {
    if (!db || !confirm(`Approve ${order.tier?.toUpperCase()} for ${order.userEmail}?`)) return;
    try {
      const plan = PLANS[order.tier as PlanId] || PLANS.pro;
      await updateDoc(doc(db, 'orders', order.id), { status: 'completed', approvedAt: serverTimestamp() });
      await updateDoc(doc(db, 'users', order.userId), {
        tier: order.tier, paymentStatus: 'active', dailyLimit: plan.dailyLimit
      });
      fetchOrders();
    } catch { alert('Failed to approve order.'); }
  };

  const handleLimitChange = async (userId: string, delta: number) => {
    if (!db) return;
    const u = usersList.find(x => x.id === userId);
    if (!u) return;
    const newLimit = Math.max(0, (u.dailyLimit || 20) + delta);
    await updateDoc(doc(db, 'users', userId), { dailyLimit: newLimit });
    setUsersList(usersList.map(x => x.id === userId ? { ...x, dailyLimit: newLimit } : x));
  };

  const handleSaveUserEdit = async (userId: string) => {
    if (!db) return;
    const plan = PLANS[editPlanVal] || PLANS.free;
    const customLimit = parseInt(editLimitVal) || plan.dailyLimit;
    await updateDoc(doc(db, 'users', userId), {
      tier: editPlanVal,
      dailyLimit: customLimit,
      paymentStatus: editPlanVal === 'free' ? 'free' : 'active',
    });
    setUsersList(usersList.map(x => x.id === userId
      ? { ...x, tier: editPlanVal, dailyLimit: customLimit }
      : x
    ));
    setEditingUserId(null);
  };

  const handleBanUser = async (u: any) => {
    if (!db || !confirm(`${u.banned ? 'Unban' : 'Ban'} ${u.email}?`)) return;
    await updateDoc(doc(db, 'users', u.id), { banned: !u.banned });
    setUsersList(usersList.map(x => x.id === u.id ? { ...x, banned: !u.banned } : x));
  };

  const handleResetToken = async (u: any) => {
    if (!db || !confirm(`Reset API token for ${u.email}?`)) return;
    const newToken = 'qt_' + Array.from({ length: 40 }, () =>
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 62)]
    ).join('');
    await updateDoc(doc(db, 'users', u.id), { apiToken: newToken });
    setUsersList(usersList.map(x => x.id === u.id ? { ...x, apiToken: newToken } : x));
    alert(`Token reset successfully!`);
  };

  const handleSavePlanEdit = () => {
    // In a real DB-backed system this would write to Firestore.
    // Since plans are code-config, show a success message with new values.
    alert(`Plan "${editingPlanId}" config updated in UI.\n\nTo persist, update lib/plans.ts with:\ndailyLimit: ${planEdits.dailyLimit}\npriceLabel: ${planEdits.priceLabel}`);
    setEditingPlanId(null);
    setPlanEdits({});
  };

  const updateToggle = async (key: keyof SystemSettings) => {
    if (!db || !systemSettings) return;
    const newVal = !systemSettings[key];
    await setDoc(doc(db, 'system', 'settings'), { [key]: newVal }, { merge: true });
    setSystemSettings({ ...systemSettings, [key]: newVal });
  };

  // ── Derived data ─────────────────────────────────────────────────────────
  const filteredUsers = useMemo(() => {
    return usersList.filter(u => {
      const matchSearch = userSearch === '' ||
        u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.displayName?.toLowerCase().includes(userSearch.toLowerCase());
      const matchTier = userTierFilter === 'all' || u.tier === userTierFilter;
      return matchSearch && matchTier;
    });
  }, [usersList, userSearch, userTierFilter]);

  // ── Guards ───────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-black">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user || !isAdmin) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-slate-50 dark:bg-black">
      <div className="w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6 text-red-600">
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
      </div>
      <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">Restricted Access</h1>
      <p className="text-slate-500 font-mono text-sm mb-8">{user?.email || 'Not signed in'}</p>
      <Link href="/" className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black shadow-xl shadow-indigo-600/20 transition-all active:scale-95">Return to Site</Link>
    </div>
  );

  const TIER_COLORS: Record<string, string> = {
    free: 'bg-slate-100 dark:bg-slate-800 text-slate-500',
    plus: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
    pro: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600',
    enterprise: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600',
  };

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Icon.Overview /> },
    { id: 'orders',   label: 'Orders',   icon: <Icon.Orders /> },
    { id: 'users',    label: 'Users',    icon: <Icon.Users /> },
    { id: 'plans',    label: 'Plans',    icon: <Icon.Plans /> },
    { id: 'system',   label: 'System',   icon: <Icon.System /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0f] p-4 md:p-8 text-slate-900 dark:text-white font-sans">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-500 uppercase italic">
              Admin <span className="text-slate-900 dark:text-white">Console</span>
            </h1>
            <p className="text-slate-500 font-bold tracking-tight text-sm mt-1">QalbeTools — System Management & Control</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl gap-1">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                  activeTab === t.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {t.icon}
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Loading indicator */}
        {fetching && (
          <div className="mb-6 flex items-center gap-2 text-indigo-500 font-bold text-sm animate-pulse">
            <div className="w-2 h-2 bg-indigo-500 rounded-full" />
            Syncing live data...
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB: OVERVIEW                                                       */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'Total Users',    val: stats.totalUsers,    color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/10',     icon: <Icon.Users /> },
                { label: 'Active Pro',     val: stats.activePro,     color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/10', icon: <Icon.Star /> },
                { label: 'Active Plus',    val: stats.activePlus,    color: 'text-blue-400',   bg: 'bg-sky-50 dark:bg-sky-900/10',       icon: <Icon.Plans /> },
                { label: 'Total Orders',   val: stats.totalOrders,   color: 'text-emerald-500',bg: 'bg-emerald-50 dark:bg-emerald-900/10',icon: <Icon.Orders /> },
                { label: 'Pending Orders', val: stats.pendingOrders, color: 'text-amber-500',  bg: 'bg-amber-50 dark:bg-amber-900/10',   icon: <Icon.TrendUp /> },
                { label: 'Est. Revenue',   val: `$${stats.revenue}`, color: 'text-emerald-600',bg: 'bg-emerald-50 dark:bg-emerald-900/10',icon: <Icon.Revenue /> },
              ].map((s, i) => (
                <div key={i} className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                  <div className={`w-9 h-9 ${s.bg} ${s.color} rounded-xl flex items-center justify-center mb-3`}>{s.icon}</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{s.label}</div>
                  <div className={`text-3xl font-black ${s.color}`}>{s.val}</div>
                </div>
              ))}
            </div>

            {/* Tier Breakdown */}
            <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-black mb-6 uppercase tracking-tight">Tier Breakdown</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(['free', 'plus', 'pro', 'enterprise'] as PlanId[]).map(tid => {
                  const count = usersList.filter(u => (u.tier || 'free') === tid).length;
                  const total = Math.max(usersList.length, 1);
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={tid} className="space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="uppercase tracking-widest text-slate-500">{tid}</span>
                        <span className="text-slate-900 dark:text-white">{count}</span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${tid === 'pro' ? 'bg-indigo-500' : tid === 'plus' ? 'bg-blue-400' : tid === 'enterprise' ? 'bg-violet-500' : 'bg-slate-300'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold">{pct}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB: ORDERS                                                         */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex gap-2">
              {(['pending', 'completed', 'all'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setOrderFilter(f)}
                  className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${orderFilter === f ? 'bg-slate-900 text-white dark:bg-white dark:text-black border-transparent' : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800'}`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="grid gap-3">
              {orders.length === 0 && (
                <div className="p-16 text-center text-slate-400 font-bold bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                  No {orderFilter} orders found.
                </div>
              )}
              {orders.map(order => (
                <div key={order.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-white ${order.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                      {order.status === 'completed' ? <Icon.Check /> : <Icon.Orders />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${TIER_COLORS[order.tier] || TIER_COLORS.free}`}>{order.tier}</span>
                        <span className="text-[10px] font-black uppercase text-slate-400">{order.method}</span>
                      </div>
                      <div className="font-black text-base">{order.userEmail}</div>
                      <code className="text-[10px] text-slate-400">TXID: {order.transactionId}</code>
                    </div>
                  </div>
                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleApprove(order)}
                      className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-indigo-500 transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
                    >
                      <Icon.Approve />
                      Approve Plan
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB: USERS                                                          */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Search & Filter Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                  <Icon.Search />
                </div>
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
              <div className="flex gap-2">
                {(['all', 'free', 'plus', 'pro', 'enterprise'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setUserTierFilter(t)}
                    className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${userTierFilter === t ? 'bg-indigo-600 text-white border-transparent' : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800 hover:border-indigo-400'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Showing {filteredUsers.length} of {usersList.length} users
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
                      {['User', 'Plan', 'Daily Limit', 'Status', 'Actions'].map(h => (
                        <th key={h} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className={`hover:bg-slate-50 dark:hover:bg-slate-950/50 transition-colors ${u.banned ? 'opacity-50' : ''}`}>
                        {/* User info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                              {(u.displayName || u.email || '?')[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-sm">{u.displayName || '—'}</div>
                              <div className="text-xs text-slate-400 font-mono">{u.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Plan */}
                        <td className="px-6 py-4">
                          {editingUserId === u.id ? (
                            <select
                              value={editPlanVal}
                              onChange={e => setEditPlanVal(e.target.value as PlanId)}
                              className="px-3 py-1.5 text-xs font-black bg-white dark:bg-slate-800 border border-indigo-500 rounded-lg focus:outline-none"
                            >
                              {(['free', 'plus', 'pro', 'enterprise'] as PlanId[]).map(p => (
                                <option key={p} value={p}>{p.toUpperCase()}</option>
                              ))}
                            </select>
                          ) : (
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${TIER_COLORS[u.tier || 'free']}`}>
                              {u.tier || 'free'}
                            </span>
                          )}
                        </td>

                        {/* Daily Limit */}
                        <td className="px-6 py-4">
                          {editingUserId === u.id ? (
                            <input
                              type="number"
                              value={editLimitVal}
                              onChange={e => setEditLimitVal(e.target.value)}
                              placeholder={String(u.dailyLimit || 20)}
                              className="w-24 px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-800 border border-indigo-500 rounded-lg focus:outline-none"
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleLimitChange(u.id, -10)}
                                className="w-7 h-7 bg-slate-100 dark:bg-slate-800 hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-600 dark:text-slate-300 hover:text-red-600 rounded-lg flex items-center justify-center transition-all"
                                title="Decrease by 10"
                              >
                                <Icon.Minus />
                              </button>
                              <span className="font-black text-sm w-10 text-center">{u.dailyLimit || 20}</span>
                              <button
                                onClick={() => handleLimitChange(u.id, 10)}
                                className="w-7 h-7 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-slate-600 dark:text-slate-300 hover:text-emerald-600 rounded-lg flex items-center justify-center transition-all"
                                title="Increase by 10"
                              >
                                <Icon.Plus />
                              </button>
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${u.banned ? 'bg-red-500' : u.paymentStatus === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                              {u.banned ? 'banned' : (u.paymentStatus || 'free')}
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            {editingUserId === u.id ? (
                              <>
                                <button
                                  onClick={() => handleSaveUserEdit(u.id)}
                                  className="w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center hover:bg-emerald-400 transition-all"
                                  title="Save"
                                >
                                  <Icon.Check />
                                </button>
                                <button
                                  onClick={() => setEditingUserId(null)}
                                  className="w-8 h-8 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
                                  title="Cancel"
                                >
                                  <Icon.X />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingUserId(u.id);
                                    setEditPlanVal(u.tier || 'free');
                                    setEditLimitVal(String(u.dailyLimit || 20));
                                  }}
                                  className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-lg flex items-center justify-center hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all"
                                  title="Edit Plan & Limit"
                                >
                                  <Icon.Edit />
                                </button>
                                <button
                                  onClick={() => handleResetToken(u)}
                                  className="w-8 h-8 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-lg flex items-center justify-center hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all"
                                  title="Reset API Token"
                                >
                                  <Icon.Key />
                                </button>
                                <button
                                  onClick={() => handleBanUser(u)}
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${u.banned ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:bg-emerald-100' : 'bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100'}`}
                                  title={u.banned ? 'Unban User' : 'Ban User'}
                                >
                                  {u.banned ? <Icon.Shield /> : <Icon.Ban />}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB: PLANS                                                          */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'plans' && (
          <div className="space-y-6">
            <div className="p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
                Editing plan config here updates the UI preview. To permanently persist changes, update <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1 rounded">lib/plans.ts</code> in the codebase and redeploy.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {(Object.values(PLANS) as PlanConfig[]).map(plan => {
                const isEditing = editingPlanId === plan.id;
                const vals = isEditing ? { ...plan, ...planEdits } : plan;
                return (
                  <div key={plan.id} className={`p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 transition-all ${isEditing ? 'border-indigo-500 shadow-xl shadow-indigo-500/10' : 'border-slate-200 dark:border-slate-800'}`}>
                    {/* Plan header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${TIER_COLORS[plan.id]}`}>{plan.id}</span>
                        {isEditing ? (
                          <input
                            value={planEdits.label ?? plan.label}
                            onChange={e => setPlanEdits(p => ({ ...p, label: e.target.value }))}
                            className="text-lg font-black bg-transparent border-b-2 border-indigo-500 focus:outline-none w-32"
                          />
                        ) : (
                          <span className="text-lg font-black">{plan.label}</span>
                        )}
                      </div>
                      {isEditing ? (
                        <div className="flex gap-2">
                          <button onClick={handleSavePlanEdit} className="flex items-center gap-1 px-4 py-2 bg-emerald-500 text-white text-xs font-black rounded-xl hover:bg-emerald-400 transition-all">
                            <Icon.Check /> Save
                          </button>
                          <button onClick={() => { setEditingPlanId(null); setPlanEdits({}); }} className="flex items-center gap-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-black rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-all">
                            <Icon.X /> Cancel
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditingPlanId(plan.id); setPlanEdits({}); }} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 text-xs font-black rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all">
                          <Icon.Edit /> Edit Config
                        </button>
                      )}
                    </div>

                    {/* Fields */}
                    <div className="space-y-4">
                      {/* Price */}
                      <div className="flex items-center gap-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 w-24">Price Label</label>
                        {isEditing ? (
                          <input
                            value={planEdits.priceLabel ?? plan.priceLabel}
                            onChange={e => setPlanEdits(p => ({ ...p, priceLabel: e.target.value }))}
                            className="flex-1 px-3 py-2 text-sm font-bold bg-slate-50 dark:bg-slate-950 border border-indigo-300 rounded-xl focus:outline-none"
                          />
                        ) : (
                          <span className="font-black text-lg">{plan.priceLabel}</span>
                        )}
                      </div>

                      {/* Daily Limit */}
                      <div className="flex items-center gap-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 w-24">Daily Limit</label>
                        {isEditing ? (
                          <input
                            type="number"
                            value={planEdits.dailyLimit ?? plan.dailyLimit}
                            onChange={e => setPlanEdits(p => ({ ...p, dailyLimit: parseInt(e.target.value) }))}
                            className="flex-1 px-3 py-2 text-sm font-bold bg-slate-50 dark:bg-slate-950 border border-indigo-300 rounded-xl focus:outline-none"
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-black text-2xl text-indigo-500">{plan.dailyLimit}</span>
                            <span className="text-xs text-slate-400 font-bold">req/day</span>
                          </div>
                        )}
                      </div>

                      {/* Features list */}
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Features</div>
                        <ul className="space-y-1.5">
                          {plan.features.map((f, i) => (
                            <li key={i} className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Usage count */}
                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Subscribers</span>
                        <span className="font-black text-slate-900 dark:text-white">
                          {usersList.filter(u => (u.tier || 'free') === plan.id).length}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB: SYSTEM                                                         */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'system' && (
          <div className="p-10 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800">
            <h3 className="text-2xl font-black mb-8 border-b border-slate-100 dark:border-slate-800 pb-4 uppercase tracking-tight">API Service Control</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { key: 'youtube_enabled',   label: 'YouTube Downloader',   desc: 'Enable/disable YT API' },
                { key: 'facebook_enabled',  label: 'Facebook Downloader',  desc: 'Enable/disable FB API' },
                { key: 'instagram_enabled', label: 'Instagram Downloader', desc: 'Enable/disable IG API' },
                { key: 'tiktok_enabled',    label: 'TikTok Downloader',    desc: 'Enable/disable TT API' },
                { key: 'ai_features_enabled', label: 'AI Generator Tools', desc: 'Grammar, Rewriter, Resume' },
                { key: 'maintenance_mode',  label: 'Global Maintenance',   desc: 'Block all API endpoints' },
              ].map((s) => {
                const isOn = systemSettings?.[s.key as keyof SystemSettings];
                return (
                  <div
                    key={s.key}
                    className={`p-6 rounded-3xl border transition-all ${isOn ? 'border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/30 dark:bg-emerald-900/5' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950'}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-black text-sm uppercase tracking-tight mb-1">{s.label}</div>
                        <div className="text-[10px] text-slate-400 font-bold">{s.desc}</div>
                      </div>
                      <button
                        onClick={() => updateToggle(s.key as any)}
                        className={`relative flex-shrink-0 w-14 h-7 rounded-full transition-all duration-300 ${isOn ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30' : 'bg-slate-300 dark:bg-slate-700'}`}
                      >
                        <div className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-all duration-300 ${isOn ? 'translate-x-7' : 'translate-x-0'}`} />
                      </button>
                    </div>
                    <div className={`mt-3 text-[10px] font-black uppercase tracking-widest ${isOn ? 'text-emerald-600' : 'text-red-500'}`}>
                      {isOn ? 'ONLINE' : 'OFFLINE'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-20 text-center border-t border-slate-200 dark:border-slate-800 pt-10">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-black text-slate-400 hover:text-indigo-500 transition-colors uppercase tracking-widest group">
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
