'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import PaymentModal from '@/components/PaymentModal';
import { PLANS, PlanId } from '@/lib/plans';

export default function DashboardPage() {
  const { user, userData, loading, regenerateApiToken } = useAuth();
  const [showToken, setShowToken] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState<PlanId>('plus');
  const [copied, setCopied] = useState(false);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-black">
      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-black">
      <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-3xl flex items-center justify-center mb-6 text-indigo-600">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
      </div>
      <h1 className="text-3xl font-black mb-2 tracking-tight">Access Denied</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">Please sign in to view your developer statistics.</p>
      <Link href="/" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg hover:-translate-y-0.5">Return Home</Link>
    </div>
  );

  const today = new Date().toISOString().split('T')[0];
  const currentUsage = userData?.usage?.[today] || 0;
  const currentPlan = PLANS[userData?.tier as PlanId] || PLANS.free;
  const usagePercent = Math.min(100, (currentUsage / currentPlan.dailyLimit) * 100);

  const handleCopy = () => {
    if (!userData?.apiToken) return;
    navigator.clipboard.writeText(userData.apiToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    if (confirm("Are you sure? Your old token will stop working immediately.")) {
        regenerateApiToken();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black p-4 md:p-8 text-slate-900 dark:text-white font-sans selection:bg-indigo-500 selection:text-white">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
           <div className="flex items-center gap-5">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
                <img src={user.photoURL || ''} alt="avatar" className="relative w-16 h-16 rounded-2xl border border-white/10 shadow-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight leading-none mb-1">Welcome, {user.displayName?.split(' ')[0]}</h1>
                <p className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                    {userData?.tier === 'pro' && <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />}
                    {currentPlan.label} Tier Instance
                </p>
              </div>
           </div>
           
           <div className="flex gap-3">
              <Link href="/" className="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm shadow-sm hover:border-indigo-500 transition-all flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                Main Site
              </Link>
              {isAdmin(user.email) && (
                <Link href="/admin" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 transition-all flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Admin Console
                </Link>
              )}
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Stats Column */}
          <div className="lg:col-span-2 space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
            
            {/* Usage Card */}
            <div className="p-8 md:p-10 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 text-indigo-500/5 group-hover:text-indigo-500/10 transition-colors duration-500">
                <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13 3v6h8V3h-8zm0 18h8v-9h-8v9zM3 21h8v-6H3v6zm0-9h8V3H3v9z" />
                </svg>
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black tracking-tight">API Usage Statistics</h3>
                    <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full uppercase tracking-widest text-slate-500">Today</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div>
                        <div className="text-4xl font-black text-indigo-600 mb-1">{currentUsage}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Requests Made</div>
                    </div>
                    <div>
                        <div className="text-4xl font-black text-slate-900 dark:text-white mb-1">{currentPlan.dailyLimit}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Daily Limit</div>
                    </div>
                    <div className="hidden md:block">
                        <div className="text-4xl font-black text-emerald-500 mb-1">{currentPlan.dailyLimit - currentUsage}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Remaining</div>
                    </div>
                </div>

                <div className="mt-10">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Usage Progress</span>
                        <span className="text-xs font-mono font-bold text-indigo-500">{Math.round(usagePercent)}%</span>
                    </div>
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-800/50 p-1">
                        <div 
                            className="h-full bg-gradient-to-r from-indigo-600 to-violet-500 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(79,70,229,0.3)] relative overflow-hidden"
                            style={{ width: `${usagePercent}%` }}
                        >
                            <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }} />
                        </div>
                    </div>
                </div>
              </div>
            </div>

            {/* Developer API Card */}
            <div className="p-8 md:p-10 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                        </div>
                        <h3 className="text-xl font-black tracking-tight">Developer API Token</h3>
                    </div>
                    {userData?.tier === 'free' && (
                        <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest">Upgrade to View Full Stats</span>
                    )}
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 relative group">
                    {userData?.apiToken ? (
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <code className="text-base font-mono text-indigo-600 dark:text-indigo-400 font-bold bg-white dark:bg-slate-900 px-6 py-4 rounded-xl border border-slate-200 dark:border-slate-800 flex-1 w-full text-center sm:text-left blur-sm group-hover:blur-none transition-all duration-300">
                                {showToken ? userData.apiToken : '••••••••••••••••••••••••••••••••'}
                            </code>
                            <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
                                <button onClick={() => setShowToken(!showToken)} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:scale-105 transition-transform" title="Toggle Visibility">
                                     {showToken ? '👁️' : '🕶️'}
                                </button>
                                <button onClick={handleCopy} className={`p-4 ${copied ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'} rounded-xl hover:scale-105 transition-transform active:scale-95`} title="Copy to clipboard">
                                     {copied ? '✅' : '📋'}
                                </button>
                                <button onClick={handleRegenerate} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:scale-105 transition-transform text-red-500" title="Regenerate Token">
                                     🔄
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-slate-400 font-bold text-sm mb-4">No API Token Found.</p>
                            <button onClick={() => regenerateApiToken()} className="px-6 py-3 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95">Generate My First Token</button>
                        </div>
                    )}
                </div>
                <p className="mt-6 text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    Use this token in your HTTP headers as <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">x-api-token</code>. <strong className="text-red-500">Warning:</strong> Keep it secret! Sharing your token allows others to use your daily limit.
                </p>
            </div>

            {/* Upgrade Plans Section */}
            <div className="p-8 md:p-10 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black tracking-tight">Available Subscription Plans</h3>
                    <Link href="/#pricing" className="text-xs font-black text-indigo-500 hover:underline uppercase tracking-widest">Compare All</Link>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                    {(['plus', 'pro'] as PlanId[]).map((pid) => {
                        const p = PLANS[pid];
                        return (
                            <div key={pid} className={`p-6 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 transition-all ${userData?.tier === pid ? 'ring-2 ring-indigo-500 bg-indigo-50/10' : ''}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-black text-lg">{p.label}</h4>
                                    {userData?.tier === pid && <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-full uppercase font-black">Active</span>}
                                </div>
                                <div className="text-2xl font-black mb-1">{p.priceLabel}</div>
                                <div className="text-xs text-slate-400 font-bold mb-4">{p.dailyLimit} Daily Requests</div>
                                <button 
                                    onClick={() => { setSelectedTier(pid); setShowPaymentModal(true); }}
                                    disabled={userData?.tier === pid}
                                    className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${userData?.tier === pid ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed' : 'bg-slate-900 dark:bg-white text-white dark:text-black hover:opacity-90'}`}
                                >
                                    {userData?.tier === pid ? 'Current Plan' : 'Select Plan'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
            {/* User Profile Card */}
            <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-[4rem]" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Your Status</h3>
                
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        </div>
                        <div>
                            <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-0.5">Payment Status</div>
                            <div className={`text-sm font-black uppercase tracking-widest ${
                                userData?.paymentStatus === 'active' ? 'text-emerald-500' : 
                                userData?.paymentStatus === 'pending' ? 'text-amber-500' : 'text-slate-400'
                            }`}>{userData?.paymentStatus || 'FREE'}</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                        <div>
                            <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-0.5">Joined QalbeTools</div>
                            <div className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
                                {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-10 p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] leading-relaxed text-slate-400 font-bold uppercase tracking-widest">
                        QalbeTools Pro is a contribution to support local independent developers. Thank you for your support!
                    </p>
                </div>
            </div>

            {/* Quick Links */}
            <div className="p-8 bg-indigo-600 rounded-[2.5rem] text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000" />
                <h3 className="text-lg font-black mb-6 tracking-tight relative z-10">Developer Perks</h3>
                <ul className="space-y-4 relative z-10">
                    {[
                        'Higher Daily Execution Limit',
                        'Priority Social Media Logic',
                        'No Rate Limiting Errors',
                        'Zero AD Documentation Access',
                    ].map((perk, i) => (
                        <li key={i} className="flex items-center gap-3 text-xs font-bold text-indigo-50">
                            <span className="w-1.5 h-1.5 bg-indigo-300 rounded-full flex-shrink-0" />
                            {perk}
                        </li>
                    ))}
                </ul>
                <button 
                  onClick={() => { setSelectedTier('plus'); setShowPaymentModal(true); }}
                  disabled={userData?.tier === 'pro' || userData?.tier === 'plus'}
                  className="w-full mt-10 py-4 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {(userData?.tier === 'pro' || userData?.tier === 'plus') ? 'Enjoy Early Access' : 'Upgrade Account'}
                </button>
            </div>
          </div>
        </div>

      </div>

      <PaymentModal 
        isOpen={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)} 
        tier={selectedTier} 
      />
    </div>
  );
}

function isAdmin(email: string | null | undefined) {
    return ['ai729776@gmail.com', 'filehubtop@gmail.com', 'alaminislam203@gmail.com'].includes(email?.toLowerCase() || '');
}
