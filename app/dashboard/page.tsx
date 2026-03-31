'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import PaymentModal from '@/components/PaymentModal';
import { PLANS, PlanId } from '@/lib/plans';

// ─────────────────────────────────────────────────────────────────────────────
// SVG ICON COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
const IconEye = ({ open }: { open: boolean }) => open
  ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
  : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;

const IconCopy = ({ done }: { done: boolean }) => done
  ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><polyline points="20 6 9 17 4 12"/></svg>
  : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>;

const IconRefresh = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>;
const IconCode  = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>;
const IconChart = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const IconHome  = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IconGear  = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/></svg>;
const IconZap   = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const IconCheck = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><polyline points="20 6 9 17 4 12"/></svg>;
const IconKey   = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>;
const IconStar  = () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IconCalendar = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IconUser  = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;

function isAdminUser(email: string | null | undefined) {
  return ['ai729776@gmail.com', 'filehubtop@gmail.com', 'alaminislam203@gmail.com'].includes(email?.toLowerCase() || '');
}

// ─────────────────────────────────────────────────────────────────────────────
// SNIPPET BUILDER
// ─────────────────────────────────────────────────────────────────────────────
function buildSnippet(lang: 'curl' | 'js' | 'py', token: string) {
  const t = token || 'YOUR_API_TOKEN';
  if (lang === 'curl') return `curl -X POST https://tools.qalbetalks.com/api/fb-downloader \\
  -H "Content-Type: application/json" \\
  -H "x-api-token: ${t}" \\
  -d '{"url": "https://www.facebook.com/reel/..."}'`;

  if (lang === 'js') return `const res = await fetch('https://tools.qalbetalks.com/api/grammar-checker', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-token': '${t}'
  },
  body: JSON.stringify({ text: 'Your text here.' })
});
const data = await res.json();`;

  return `import requests

response = requests.post(
    'https://tools.qalbetalks.com/api/ig-downloader',
    json={'url': 'https://www.instagram.com/reel/...'},
    headers={
        'Content-Type': 'application/json',
        'x-api-token': '${t}'
    }
)
print(response.json())`;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user, userData, loading, regenerateApiToken } = useAuth();
  const [showToken, setShowToken] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState<PlanId>('plus');
  const [copied, setCopied] = useState(false);
  const [snippetLang, setSnippetLang] = useState<'curl' | 'js' | 'py'>('curl');
  const [snippetCopied, setSnippetCopied] = useState(false);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-black">
      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-black">
      <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-3xl flex items-center justify-center mb-6 text-indigo-600">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
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

  // Last 7 days activity
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().split('T')[0];
    return {
      date: d.toLocaleDateString(undefined, { weekday: 'short' }),
      count: userData?.usage?.[key] || 0,
    };
  });
  const maxDay = Math.max(...last7Days.map(d => d.count), 1);

  const handleCopy = () => {
    if (!userData?.apiToken) return;
    navigator.clipboard.writeText(userData.apiToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    if (confirm('Are you sure? Your old token will stop working immediately.')) {
      regenerateApiToken();
    }
  };

  const handleSnippetCopy = () => {
    navigator.clipboard.writeText(buildSnippet(snippetLang, userData?.apiToken || ''));
    setSnippetCopied(true);
    setTimeout(() => setSnippetCopied(false), 2000);
  };

  const TIER_BADGE: Record<string, string> = {
    free: 'bg-slate-100 dark:bg-slate-800 text-slate-500',
    plus: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
    pro:  'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600',
    enterprise: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600',
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0f] p-4 md:p-8 text-slate-900 dark:text-white font-sans selection:bg-indigo-500 selection:text-white">
      <div className="max-w-6xl mx-auto">

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-5">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000" />
              {user.photoURL
                ? <img src={user.photoURL} alt="avatar" className="relative w-16 h-16 rounded-2xl border border-white/10 shadow-2xl object-cover" />
                : <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-2xl font-black shadow-2xl">
                    {(user.displayName || user.email || '?')[0].toUpperCase()}
                  </div>
              }
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight leading-none mb-1">
                Welcome, {user.displayName?.split(' ')[0] || 'Developer'}
              </h1>
              <div className="flex items-center gap-2">
                {userData?.paymentStatus === 'active' && <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />}
                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${TIER_BADGE[userData?.tier || 'free']}`}>
                  {currentPlan.label}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Link href="/" className="px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm shadow-sm hover:border-indigo-500 transition-all flex items-center gap-2">
              <IconHome /> Home
            </Link>
            {isAdminUser(user.email) && (
              <Link href="/admin" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 transition-all flex items-center gap-2">
                <IconGear /> Admin
              </Link>
            )}
          </div>
        </div>

        {/* ── Grid Layout ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Usage Card */}
            <div className="p-8 md:p-10 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 text-indigo-500/5 group-hover:text-indigo-500/10 transition-colors duration-500">
                <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3v6h8V3h-8zm0 18h8v-9h-8v9zM3 21h8v-6H3v6zm0-9h8V3H3v9z"/></svg>
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black tracking-tight">API Usage — Today</h3>
                  <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full uppercase tracking-widest text-slate-500">
                    {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-10">
                  {[
                    { val: currentUsage, label: 'Requests Made', color: 'text-indigo-600' },
                    { val: currentPlan.dailyLimit, label: 'Daily Limit', color: 'text-slate-900 dark:text-white' },
                    { val: Math.max(0, currentPlan.dailyLimit - currentUsage), label: 'Remaining', color: 'text-emerald-500' },
                  ].map((s, i) => (
                    <div key={i}>
                      <div className={`text-4xl font-black ${s.color} mb-1`}>{s.val}</div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Usage Progress</span>
                    <span className="text-xs font-mono font-bold text-indigo-500">{Math.round(usagePercent)}%</span>
                  </div>
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full p-0.5">
                    <div
                      className="h-full rounded-full transition-all duration-1000 relative overflow-hidden"
                      style={{
                        width: `${usagePercent}%`,
                        background: usagePercent >= 90 ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : 'linear-gradient(90deg, #4f46e5, #7c3aed)',
                        boxShadow: usagePercent >= 90 ? '0 0 12px rgba(239,68,68,.3)' : '0 0 12px rgba(79,70,229,.3)'
                      }}
                    >
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)', animation: 'shimmer 2s infinite' }} />
                    </div>
                  </div>
                  {usagePercent >= 80 && (
                    <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                      <IconZap /> Approaching daily limit. Consider upgrading your plan.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 7-Day Activity Chart */}
            <div className="p-8 md:p-10 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center">
                  <IconChart />
                </div>
                <h3 className="text-xl font-black tracking-tight">7-Day Activity</h3>
              </div>
              <div className="flex items-end gap-2 h-32">
                {last7Days.map((day, i) => {
                  const pct = (day.count / maxDay) * 100;
                  const isToday = i === 6;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">{day.count}</div>
                      <div className="w-full rounded-t-lg relative overflow-hidden transition-all duration-300" style={{ height: `${Math.max(pct, 4)}%`, background: isToday ? 'linear-gradient(180deg, #4f46e5, #7c3aed)' : '#e2e8f0' }} />
                      <div className={`text-[10px] font-black uppercase ${isToday ? 'text-indigo-500' : 'text-slate-400'}`}>{day.date}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* API Token Card */}
            <div className="p-8 md:p-10 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center">
                  <IconKey />
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tight">Developer API Token</h3>
                  <p className="text-xs text-slate-400 font-bold mt-0.5">Include as <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded font-mono">x-api-token</code> header in every request</p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-3xl border border-slate-200 dark:border-slate-800">
                {userData?.apiToken ? (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <code className="flex-1 font-mono text-sm text-indigo-600 dark:text-indigo-400 font-bold bg-white dark:bg-slate-900 px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 truncate">
                      {showToken ? userData.apiToken : '••••••••••••••••••••••••••••••••••••••'}
                    </code>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowToken(!showToken)}
                        className="w-11 h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center text-slate-500 hover:text-indigo-500 hover:border-indigo-400 transition-all"
                        title={showToken ? 'Hide Token' : 'Show Token'}
                      >
                        <IconEye open={showToken} />
                      </button>
                      <button
                        onClick={handleCopy}
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${copied ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-indigo-500 hover:border-indigo-400'}`}
                        title="Copy Token"
                      >
                        <IconCopy done={copied} />
                      </button>
                      <button
                        onClick={handleRegenerate}
                        className="w-11 h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center text-slate-500 hover:text-red-500 hover:border-red-400 transition-all"
                        title="Regenerate Token (old token will stop working)"
                      >
                        <IconRefresh />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-slate-400 font-bold text-sm mb-4">No API Token Found.</p>
                    <button
                      onClick={() => regenerateApiToken()}
                      className="px-6 py-3 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 active:scale-95 transition-all"
                    >
                      Generate My First Token
                    </button>
                  </div>
                )}
              </div>

              {userData?.apiToken && (
                <p className="mt-4 text-xs text-slate-400 dark:text-slate-500 font-medium leading-relaxed">
                  <strong className="text-red-500">Warning:</strong> Keep your token secret. Sharing it allows others to consume your daily limit.
                </p>
              )}
            </div>

            {/* Quick API Snippets */}
            <div className="p-8 md:p-10 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-violet-500/10 text-violet-500 rounded-2xl flex items-center justify-center">
                    <IconCode />
                  </div>
                  <h3 className="text-xl font-black tracking-tight">Quick API Snippets</h3>
                </div>
                <button
                  onClick={handleSnippetCopy}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${snippetCopied ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                >
                  {snippetCopied ? <><IconCheck /> Copied!</> : <><IconCopy done={false} /> Copy</>}
                </button>
              </div>

              {/* Language Tabs */}
              <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl mb-5 w-fit gap-1">
                {(['curl', 'js', 'py'] as const).map(lang => (
                  <button
                    key={lang}
                    onClick={() => setSnippetLang(lang)}
                    className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${snippetLang === lang ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {lang === 'curl' ? 'cURL' : lang === 'js' ? 'JavaScript' : 'Python'}
                  </button>
                ))}
              </div>

              {/* Code block */}
              <pre className="bg-slate-950 text-slate-300 text-xs leading-relaxed p-6 rounded-2xl overflow-x-auto font-mono border border-slate-800">
                <code>{buildSnippet(snippetLang, userData?.apiToken || '')}</code>
              </pre>

              {!userData?.apiToken && (
                <p className="mt-3 text-xs text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1.5">
                  <IconZap /> Generate your API token above to auto-fill it in snippets.
                </p>
              )}
            </div>

            {/* Upgrade Plans */}
            <div className="p-8 md:p-10 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black tracking-tight">Subscription Plans</h3>
                <Link href="/#pricing" className="text-xs font-black text-indigo-500 hover:underline uppercase tracking-widest">See All</Link>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {(['plus', 'pro'] as PlanId[]).map(pid => {
                  const p = PLANS[pid];
                  const isCurrent = userData?.tier === pid;
                  return (
                    <div key={pid} className={`p-6 rounded-3xl border-2 transition-all ${isCurrent ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-900/10' : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400'}`}>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-black text-lg">{p.label}</h4>
                        {isCurrent && <span className="flex items-center gap-1 text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-full uppercase font-black"><IconCheck /> Active</span>}
                      </div>
                      <div className="text-2xl font-black mb-1">{p.priceLabel}</div>
                      <div className="text-xs text-slate-400 font-bold mb-5">{p.dailyLimit} Daily API Requests</div>
                      <button
                        onClick={() => { setSelectedTier(pid); setShowPaymentModal(true); }}
                        disabled={isCurrent}
                        className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isCurrent ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed' : 'bg-slate-900 dark:bg-white text-white dark:text-black hover:opacity-90 active:scale-95'}`}
                      >
                        {isCurrent ? 'Current Plan' : 'Upgrade Now'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>{/* end left column */}

          {/* ── RIGHT SIDEBAR ── */}
          <div className="space-y-6">

            {/* Profile Status Card */}
            <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-[4rem]" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Account Status</h3>

              <div className="space-y-5">
                {[
                  {
                    icon: <IconUser />,
                    label: 'Payment Status',
                    val: userData?.paymentStatus || 'Free',
                    color: userData?.paymentStatus === 'active' ? 'text-emerald-500' : userData?.paymentStatus === 'pending' ? 'text-amber-500' : 'text-slate-400',
                  },
                  {
                    icon: <IconCalendar />,
                    label: 'Member Since',
                    val: userData?.createdAt
                      ? new Date(userData.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                      : '—',
                    color: 'text-slate-900 dark:text-white',
                  },
                  {
                    icon: <IconKey />,
                    label: 'API Token',
                    val: userData?.apiToken ? 'Generated' : 'Not Generated',
                    color: userData?.apiToken ? 'text-emerald-500' : 'text-red-500',
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{item.label}</div>
                      <div className={`text-sm font-black uppercase tracking-wide ${item.color}`}>{item.val}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Usage Ring Summary */}
            <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Today's Usage</h3>
              <div className="flex items-center justify-center mb-6">
                {/* SVG Ring */}
                <svg viewBox="0 0 100 100" className="w-28 h-28">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="8" className="dark:opacity-10"/>
                  <circle
                    cx="50" cy="50" r="40" fill="none"
                    stroke={usagePercent >= 90 ? '#ef4444' : usagePercent >= 60 ? '#f59e0b' : '#4f46e5'}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - usagePercent / 100)}`}
                    transform="rotate(-90 50 50)"
                    style={{ transition: 'stroke-dashoffset 1s ease' }}
                  />
                  <text x="50" y="50" dominantBaseline="middle" textAnchor="middle" className="font-black" fill="currentColor" fontSize="16" fontWeight="900">
                    {Math.round(usagePercent)}%
                  </text>
                </svg>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-400">
                <span>{currentUsage} used</span>
                <span>{currentPlan.dailyLimit} total</span>
              </div>
            </div>

            {/* Plan Perks Card */}
            <div className="p-8 bg-indigo-600 rounded-[2.5rem] text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000" />
              <h3 className="text-base font-black mb-5 tracking-tight relative z-10 flex items-center gap-2">
                <IconStar /> Developer Perks
              </h3>
              <ul className="space-y-3 relative z-10 mb-8">
                {[
                  'Higher Daily API Limit',
                  'No Rate Limit Errors',
                  'Priority Social Scrapers',
                  'Full AI Suite Access',
                  'Token-Based Auth',
                ].map((perk, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-xs font-bold text-indigo-50">
                    <div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <IconCheck />
                    </div>
                    {perk}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => { setSelectedTier('plus'); setShowPaymentModal(true); }}
                disabled={userData?.tier === 'pro' || userData?.tier === 'plus' || userData?.tier === 'enterprise'}
                className="w-full py-3.5 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-xl active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed relative z-10"
              >
                {(userData?.tier === 'pro' || userData?.tier === 'plus' || userData?.tier === 'enterprise')
                  ? 'Plan Active'
                  : 'Upgrade Account'}
              </button>
            </div>

            {/* Useful Links */}
            <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-5">Quick Links</h3>
              <div className="space-y-2">
                {[
                  { href: '/#api-docs', label: 'API Documentation' },
                  { href: '/#pricing', label: 'Pricing & Plans' },
                  { href: '/', label: 'Browse All Tools' },
                  { href: 'https://github.com/alaminislam203/qalbetools', label: 'GitHub Repository' },
                ].map((link, i) => (
                  <a
                    key={i}
                    href={link.href}
                    target={link.href.startsWith('http') ? '_blank' : '_self'}
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-950 transition-all group"
                  >
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{link.label}</span>
                    <svg className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors -translate-x-1 group-hover:translate-x-0 duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </a>
                ))}
              </div>
            </div>

          </div>{/* end right sidebar */}
        </div>{/* end grid */}
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        tier={selectedTier}
      />
    </div>
  );
}
