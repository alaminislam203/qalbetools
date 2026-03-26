'use client';

import { useAuth } from '@/hooks/useAuth';
import AuthButton from '@/components/AuthButton';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, userData, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-black">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-black p-4 text-center">
        <h1 className="text-3xl font-black mb-4">Access Denied</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">Please sign in to view your dashboard.</p>
        <AuthButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white">
      {/* Navbar Overlay */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-black italic tracking-tighter text-indigo-600">QalbeTools</Link>
          <AuthButton />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 pt-32 pb-20">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                   {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-24 h-24 rounded-full border-4 border-indigo-500/20" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-indigo-500 flex items-center justify-center text-3xl font-bold text-white">
                        {user.displayName?.charAt(0)}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-white dark:border-slate-900" />
                </div>
                <h2 className="text-2xl font-black mb-1">{user.displayName}</h2>
                <p className="text-slate-500 text-sm mb-6">{user.email}</p>
                
                <div className="w-full flex flex-col gap-3">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-left">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Current Plan</span>
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-tight">
                                {userData?.tier === 'pro' ? 'Premium Pro' : 'Free Hobbyist'}
                            </span>
                            {userData?.tier !== 'pro' && (
                                <Link href="/#pricing" className="text-xs font-black text-indigo-500 hover:underline">Upgrade →</Link>
                            )}
                        </div>
                    </div>
                    
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-left">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Payment Status</span>
                        <span className={`font-bold uppercase tracking-tight ${
                            userData?.paymentStatus === 'pending' ? 'text-amber-500' : 
                            userData?.paymentStatus === 'active' ? 'text-green-500' : 'text-slate-400'
                        }`}>
                            {userData?.paymentStatus || 'None'}
                        </span>
                    </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <h3 className="text-xl font-black mb-6">Daily API Usage</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm font-bold mb-2">
                    <span className="text-slate-500">API Requests</span>
                    <span>0 / {userData?.dailyLimit || 20}</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="w-0 h-full bg-gradient-to-r from-indigo-600 to-violet-500" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="block text-[10px] font-black text-slate-400 uppercase mb-1">Remaining</span>
                    <span className="text-xl font-black">{userData?.dailyLimit || 20}</span>
                  </div>
                   <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="block text-[10px] font-black text-slate-400 uppercase mb-1">Reset In</span>
                    <span className="text-xl font-black">24h</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none min-h-[300px] flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                   <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                </div>
                <h4 className="text-lg font-bold mb-2">No Recent Activity</h4>
                <p className="text-slate-500 text-sm max-w-xs">Your API request history will appear here once you start using the tools.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
