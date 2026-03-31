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
            {/* API Usage & Limits */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-black">Daily API Usage</h3>
                    <p className="text-sm text-slate-500">Your requests reset every 24 hours at 00:00 UTC.</p>
                </div>
                <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-full border border-indigo-100 dark:border-indigo-800">
                    <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400">Standard Plan</span>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm font-bold mb-2">
                    <span className="text-slate-500">Global API Requests</span>
                    <span>{Object.values(userData?.usage || {}).reduce((a: any, b: any) => a + b, 0) as number || 0} / {userData?.dailyLimit || 20}</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-indigo-600 to-violet-500 transition-all duration-1000" 
                        style={{ width: `${Math.min(100, ((Object.values(userData?.usage || {}).reduce((a: any, b: any) => a + b, 0) as number || 0) / (userData?.dailyLimit || 20)) * 100)}%` }}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="block text-[10px] font-black text-slate-400 uppercase mb-1">Available</span>
                    <span className="text-xl font-black">{Math.max(0, (userData?.dailyLimit || 20) - (Object.values(userData?.usage || {}).reduce((a: any, b: any) => a + b, 0) as number || 0))}</span>
                  </div>
                   <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="block text-[10px] font-black text-slate-400 uppercase mb-1">Reset In</span>
                    <span className="text-xl font-black">20h</span>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="block text-[10px] font-black text-slate-400 uppercase mb-1">Success Rate</span>
                    <span className="text-xl font-black text-emerald-500">100%</span>
                  </div>
                   <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="block text-[10px] font-black text-slate-400 uppercase mb-1">Tier</span>
                    <span className="text-xl font-black uppercase text-indigo-500">{userData?.tier || 'Free'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Developer API Section */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-xl font-black">Developer API</h3>
                        <p className="text-sm text-slate-500">Authenticate your requests with your private token.</p>
                    </div>
                </div>

                {userData?.tier === 'pro' ? (
                    <div className="space-y-6">
                        <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 relative overflow-hidden group">
                           <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                           <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Your API Token (Secret)</label>
                           <div className="flex items-center gap-4 relative z-10">
                                <code className="flex-grow font-mono text-sm text-indigo-400 bg-black/50 p-3 rounded-xl border border-slate-800 truncate">
                                    {userData?.apiToken || 'Generating...'}
                                </code>
                                <button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(userData?.apiToken || '');
                                        alert('Token copied to clipboard!');
                                    }}
                                    className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors border border-white/10"
                                    title="Copy Token"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="Content-Copy" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                    </svg>
                                </button>
                           </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                             <button className="flex-grow py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold rounded-2xl transition-all flex items-center justify-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Regenerate Token
                            </button>
                            <Link href="/#api-docs" className="flex-grow py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-600/20 text-center flex items-center justify-center gap-2">
                                API Documentation
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                        
                        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/40">
                            <div className="flex gap-3">
                                <svg className="w-5 h-5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed font-medium">
                                    Never share your API token in client-side code, Git repositories, or public forums. Use environment variables to keep your credentials safe.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-center">
                        <div className="w-12 h-12 bg-slate-50 dark:bg-slate-950 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h4 className="font-bold mb-2">Pro Access Required</h4>
                        <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">Get your unique API token, higher daily limits, and access to premium models by upgrading to a Pro plan.</p>
                        <Link href="/#pricing" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all inline-block shadow-lg shadow-indigo-600/20">
                            View Pro Plans
                        </Link>
                    </div>
                )}
            </div>

            {/* Recent Logs (Placeholder for now) */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none min-h-[200px] flex flex-col items-center justify-center text-center">
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
