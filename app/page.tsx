'use client';

import { useState, useEffect, useRef } from 'react';
import AuthButton from '@/components/AuthButton';
import PaymentModal from '@/components/PaymentModal';

/* ─────────────────────────────────────────
   SVG ICON COMPONENTS
───────────────────────────────────────── */
const IconChevronDown = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const IconArrowRight = ({ className = '' }: { className?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);
const IconGithub = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);
const IconExternalLink = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);
const IconCopy = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
  </svg>
);
const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconZap = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const IconLock = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);
const IconGlobe = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
  </svg>
);
const IconLayers = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
  </svg>
);
const IconRefreshCw = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
  </svg>
);
const IconDownload = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const IconCode = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
  </svg>
);
const IconImage = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
  </svg>
);
const IconStar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);


/* ─────────────────────────────────────────
   INTERSECTION OBSERVER HOOK
───────────────────────────────────────── */
function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setInView(true); observer.disconnect(); }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}


/* ─────────────────────────────────────────
   FADE-IN WRAPPER
───────────────────────────────────────── */
function FadeUp({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}


/* ─────────────────────────────────────────
   CODE BLOCK WITH COPY BUTTON
───────────────────────────────────────── */
function CodeBlock({ title, code }: { title: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-700/70 shadow-2xl">
      <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80 block" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80 block" />
            <span className="w-3 h-3 rounded-full bg-green-500/80 block" />
          </div>
          <span className="text-xs font-mono text-slate-400">{title}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-indigo-600 text-slate-300 hover:text-white transition-all duration-200"
        >
          {copied ? <><IconCheck /> Copied</> : <><IconCopy /> Copy</>}
        </button>
      </div>
      <pre className="bg-slate-950 p-6 text-sm text-slate-300 font-mono overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}


/* ─────────────────────────────────────────
   WHY CARD
───────────────────────────────────────── */
function WhyCard({
  icon,
  accentClass,
  borderClass,
  bgClass,
  title,
  children,
  delay = 0,
}: {
  icon: React.ReactNode;
  accentClass: string;
  borderClass: string;
  bgClass: string;
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <FadeUp delay={delay}>
      <div className={`group relative rounded-3xl border ${borderClass} bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all duration-300 p-8 md:p-10 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1`}>
        {/* Soft glow on hover */}
        <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${bgClass}`} />

        <div className="relative flex items-start gap-6">
          {/* Icon */}
          <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center border ${borderClass} ${bgClass} ${accentClass}`}>
            {icon}
          </div>

          {/* Text */}
          <div>
            <h3 className={`text-lg font-black mb-3 tracking-tight ${accentClass}`}>{title}</h3>
            <div className="text-slate-600 dark:text-slate-400 leading-relaxed text-[15px] space-y-3">
              {children}
            </div>
          </div>
        </div>
      </div>
    </FadeUp>
  );
}


/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
export default function Home() {
  const [activeTab, setActiveTab] = useState<'mockup' | 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'grammar' | 'rewriter' | 'protector' | 'pastebin' | 'resume' | 'shortener' | 'database' | 'passport'>('mockup');
  const [scrolled, setScrolled] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState('pro');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">

      {/* ── GLOBAL KEYFRAMES ── */}
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.7); }
        }
        @keyframes slideTabIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes gradientPan {
          0%, 100% { background-position: 0% 50%; }
          50%       { background-position: 100% 50%; }
        }
        @keyframes shimmer {
          from { transform: translateX(-100%); }
          to   { transform: translateX(200%); }
        }
        @keyframes borderPulse {
          0%, 100% { border-color: rgb(99 102 241 / 0.3); }
          50%       { border-color: rgb(99 102 241 / 0.7); }
        }

        .animate-fade-slide-up { animation: fadeSlideUp 0.7s ease both; }
        .animate-pulse-dot     { animation: pulseDot 2s ease-in-out infinite; }
        .animate-tab-in        { animation: slideTabIn 0.35s ease both; }
        .animate-gradient-pan  {
          background-size: 200% 200%;
          animation: gradientPan 5s ease infinite;
        }
        .btn-shimmer {
          position: relative;
          overflow: hidden;
        }
        .btn-shimmer::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%);
          animation: shimmer 2.8s ease-in-out infinite;
        }
        .hero-glow-1 {
          position: absolute; top: -80px; right: -120px;
          width: 480px; height: 480px;
          background: radial-gradient(circle, rgb(99 102 241 / 0.18), transparent 70%);
          border-radius: 50%; pointer-events: none;
        }
        .hero-glow-2 {
          position: absolute; bottom: -80px; left: -120px;
          width: 420px; height: 420px;
          background: radial-gradient(circle, rgb(59 130 246 / 0.14), transparent 70%);
          border-radius: 50%; pointer-events: none;
        }
        .dot-grid {
          background-image: radial-gradient(circle, rgb(99 102 241 / 0.15) 1px, transparent 1px);
          background-size: 28px 28px;
        }
        .tab-panel { animation: slideTabIn 0.3s ease both; }
        .header-scrolled {
          background: rgba(248,250,252,0.85);
          backdrop-filter: blur(16px);
          border-color: rgb(226 232 240);
        }
        .dark .header-scrolled {
          background: rgba(2,6,23,0.85);
          border-color: rgb(30 41 59);
        }
        .why-divider {
          width: 40px; height: 3px;
          background: linear-gradient(90deg, #6366f1, #3b82f6);
          border-radius: 99px;
          margin-bottom: 1.5rem;
        }
        /* stagger hero children */
        .hero-stagger > *:nth-child(1) { animation-delay: 0ms; }
        .hero-stagger > *:nth-child(2) { animation-delay: 100ms; }
        .hero-stagger > *:nth-child(3) { animation-delay: 200ms; }
        .hero-stagger > *:nth-child(4) { animation-delay: 300ms; }
        .hero-stagger > * { animation: fadeSlideUp 0.7s ease both; }
      `}</style>

      {/* ════════════════════════════════════
          HEADER
      ════════════════════════════════════ */}
      <header
        className={`border-b sticky top-0 z-50 transition-all duration-300 ${scrolled
            ? 'header-scrolled border-slate-200 dark:border-slate-800'
            : 'border-transparent bg-transparent'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="font-black text-xl tracking-tighter">
            Qalbe<span className="text-indigo-600 dark:text-indigo-400">Tools</span>
          </div>
          <nav className="flex items-center gap-4 sm:gap-6 text-sm font-medium">
            <a
              href="https://qalbetalks.com" target="_blank" rel="noopener noreferrer"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors hidden sm:block text-slate-500 dark:text-slate-400"
            >
              QalbeTalks
            </a>
            <a
              href="#api-docs"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-slate-500 dark:text-slate-400"
            >
              API Docs
            </a>
            <a
              href="#why-section"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors hidden sm:block text-slate-500 dark:text-slate-400"
            >
              Why Us
            </a>
            <AuthButton />
            <a
              href="https://github.com/alaminislam203/qalbetools" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-full hover:scale-105 transition-transform shadow-md text-sm font-bold"
            >
              <IconGithub />
              GitHub
            </a>
          </nav>
        </div>
      </header>


      {/* ════════════════════════════════════
          HERO
      ════════════════════════════════════ */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-36 overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-60 dark:opacity-30" />
        <div className="hero-glow-1" />
        <div className="hero-glow-2" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center hero-stagger">

          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 px-4 py-2 rounded-full text-sm font-semibold text-indigo-600 dark:text-indigo-300 mb-8">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse-dot inline-block" />
            Free &amp; Open-Source Developer API Suite
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-[1.06]">
            The Ultimate<br className="hidden md:block" />{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-500 to-blue-500 dark:from-indigo-400 dark:via-violet-400 dark:to-blue-400 animate-gradient-pan">
              Device Mockup API
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
            Instantly generate pixel-perfect device mockups, download social media content — all through clean, free REST APIs.
            No API key. No sign-up. Just ship.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#api-docs"
              className="btn-shimmer w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/30 transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              Read Documentation
              <IconArrowRight />
            </a>
            <a
              href="https://qalbetalks.com/free-tools/device-mockup-generator/" target="_blank" rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 font-bold rounded-2xl shadow-sm transition-all hover:-translate-y-1 flex items-center justify-center gap-2 text-slate-700 dark:text-slate-200"
            >
              Live Generator Tool
              <IconExternalLink />
            </a>
          </div>

          {/* Scroll cue */}
          <div className="mt-20 flex flex-col items-center gap-2 text-slate-400 dark:text-slate-600">
            <span className="text-xs font-medium uppercase tracking-widest">Explore</span>
            <IconChevronDown />
          </div>
        </div>
      </section>


      {/* ════════════════════════════════════
          API DOCUMENTATION
      ════════════════════════════════════ */}
      <section id="api-docs" className="py-20 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          <FadeUp className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-3">
              Documentation
            </p>
            <h2 className="text-3xl md:text-5xl font-black mb-4">Developer API Guide</h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-xl mx-auto">
              Integrate our powerful utility APIs directly into your workflow with standard HTTP requests.
            </p>
          </FadeUp>

          {/* Tab Navigation */}
          <FadeUp delay={80}>
            <div className="flex flex-wrap justify-center gap-2 mb-12 p-2 bg-slate-100 dark:bg-white/5 rounded-3xl w-fit mx-auto border border-slate-200 dark:border-slate-800">
              {(
                [
                  { id: 'mockup', label: 'Mockup API', activeClass: 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-lg' },
                  { id: 'facebook', label: 'Facebook API', activeClass: 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-lg' },
                  { id: 'instagram', label: 'Instagram API', activeClass: 'bg-white dark:bg-purple-600 text-purple-600 dark:text-white shadow-lg' },
                  { id: 'tiktok', label: 'TikTok API', activeClass: 'bg-white dark:bg-rose-600 text-rose-600 dark:text-white shadow-lg' },
                  { id: 'youtube', label: 'YouTube API', activeClass: 'bg-white dark:bg-red-600 text-red-600 dark:text-white shadow-lg' },
                  { id: 'grammar', label: 'Grammar API', activeClass: 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-lg' },
                  { id: 'rewriter', label: 'Rewriter API', activeClass: 'bg-white dark:bg-emerald-600 text-emerald-600 dark:text-white shadow-lg' },
                  { id: 'protector', label: 'Protector API', activeClass: 'bg-white dark:bg-amber-600 text-amber-600 dark:text-white shadow-lg' },
                  { id: 'pastebin', label: 'Pastebin API', activeClass: 'bg-white dark:bg-slate-600 text-slate-600 dark:text-white shadow-lg' },
                  { id: 'resume', label: 'Resume AI', activeClass: 'bg-white dark:bg-violet-600 text-violet-600 dark:text-white shadow-lg' },
                  { id: 'shortener', label: 'Shortener API', activeClass: 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-lg' },
                  { id: 'database', label: 'Database API', activeClass: 'bg-white dark:bg-rose-600 text-rose-600 dark:text-white shadow-lg' },
                  { id: 'passport', label: 'Passport API', activeClass: 'bg-white dark:bg-cyan-600 text-cyan-600 dark:text-white shadow-lg' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? tab.activeClass
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {tab.label}
                  {['grammar', 'rewriter', 'resume', 'passport'].includes(tab.id) && (
                    <span className="bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400 text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter border border-amber-200 dark:border-amber-800 shadow-sm transition-transform hover:scale-110">
                      Pro
                    </span>
                  )}
                </button>
              ))}
            </div>
          </FadeUp>

          {/* ── Mockup Tab ── */}
          {activeTab === 'mockup' && (
            <div className="tab-panel">
              <div className="bg-slate-50 dark:bg-black rounded-[2rem] p-8 md:p-12 border border-slate-200 dark:border-slate-800 shadow-2xl mb-12">
                <h3 className="text-2xl font-black mb-6 text-indigo-600 dark:text-indigo-400">
                  1. Device Mockup API
                </h3>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
                  <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-4 py-2 rounded-xl font-mono font-bold text-sm tracking-widest shadow-sm">
                    POST
                  </span>
                  <code className="text-lg font-mono text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                    /api/mockup
                  </code>
                </div>

                <p className="mb-10 text-slate-600 dark:text-slate-400 leading-relaxed text-base">
                  Send a{' '}
                  <code className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded-md text-sm">multipart/form-data</code>
                  {' '}POST request containing your image file and the target device ID. The API returns a fully composited PNG mockup ready for download or display.
                </p>

                <div className="mb-10">
                  <h4 className="font-bold text-lg mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
                    Parameters (FormData)
                  </h4>
                  <div className="space-y-3">
                    {[
                      { key: 'image', desc: 'The screenshot file — PNG, JPG, or WebP.', required: true },
                      { key: 'deviceId', desc: 'Target device frame. Supported: iphone15, macbook.', required: true },
                    ].map((p) => (
                      <div key={p.key} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <code className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-lg text-sm font-mono">
                            {p.key}
                          </code>
                          {p.required && (
                            <span className="text-red-500 text-xs font-bold mono uppercase tracking-wider">required</span>
                          )}
                        </div>
                        <span className="text-slate-600 dark:text-slate-400 text-sm">{p.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <CodeBlock
                  title="example.js"
                  code={`const formData = new FormData();
formData.append('image', screenshotFile);
formData.append('deviceId', 'iphone15'); // or 'macbook'

const response = await fetch('/api/mockup', {
  method: 'POST',
  body: formData,
});

const blob = await response.blob();
const imageUrl = URL.createObjectURL(blob);`}
                />
              </div>
            </div>
          )}

          {/* ── Facebook Tab ── */}
          {activeTab === 'facebook' && (
            <div className="tab-panel">
              <div className="bg-slate-50 dark:bg-black rounded-[2rem] p-8 md:p-12 border border-slate-200 dark:border-slate-800 shadow-2xl">
                <h3 className="text-2xl font-black mb-8 text-blue-600 dark:text-blue-400">
                  2. Facebook Media Downloader API
                </h3>

                {/* POST endpoint */}
                <div className="mb-10">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                    <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-4 py-2 rounded-xl font-mono font-bold text-sm tracking-widest shadow-sm">POST</span>
                    <code className="text-base font-mono text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                      /api/fb-downloader
                    </code>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-base mb-6">
                    Fetch metadata, thumbnails, and direct video/image URLs from any public Facebook post, reel, or video.
                  </p>
                  <CodeBlock title="request-body.json" code={`{\n  "url": "https://www.facebook.com/reel/1305238694994449"\n}`} />
                </div>

                {/* GET proxy */}
                <div className="mb-10">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                    <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-4 py-2 rounded-xl font-mono font-bold text-sm tracking-widest shadow-sm">GET</span>
                    <code className="text-sm font-mono text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 break-all">
                      /api/fb-downloader/proxy?url=URL&amp;filename=NAME
                    </code>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-base">
                    Bypass CORS and force direct downloads with the{' '}
                    <code className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded-md text-sm">Content-Disposition</code>{' '}
                    header.
                  </p>
                </div>

                <CodeBlock
                  title="usage-example.js"
                  code={`// 1. Fetch formats
const res = await fetch('/api/fb-downloader', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: 'FB_URL' })
});
const { data } = await res.json();

// 2. Download via Proxy (bypasses CORS)
const downloadUrl = \`/api/fb-downloader/proxy?url=\${
  encodeURIComponent(data.formats[0].url)
}&filename=video.mp4\`;
window.location.href = downloadUrl;`}
                />
              </div>
            </div>
          )}

          {/* ── Instagram Tab ── */}
          {activeTab === 'instagram' && (
            <div className="tab-panel">
              <div className="bg-slate-50 dark:bg-black rounded-[2rem] p-8 md:p-12 border border-slate-200 dark:border-slate-800 shadow-2xl">
                <div className="flex flex-wrap items-center gap-3 mb-8">
                  <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-400 dark:to-pink-400">
                    3. Instagram Media Downloader API
                  </h3>
                  <span className="bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-pink-200 dark:border-pink-800">
                    Carousel Support
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                  <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-4 py-2 rounded-xl font-mono font-bold text-sm tracking-widest shadow-sm">POST</span>
                  <code className="text-base font-mono text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                    /api/ig-downloader
                  </code>
                </div>

                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-base mb-6">
                  Download <strong className="text-slate-800 dark:text-white">Reels, Videos, Photos, and Carousels</strong> using our high-reliability multi-method engine — SnapSave, SaveIG, and a direct GraphQL fallback — for maximum uptime.
                </p>

                <CodeBlock title="request-body.json" code={`{\n  "url": "https://www.instagram.com/reels/C4ub4_8L6z7/"\n}`} />

                <div className="mt-6 p-5 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800/40 rounded-2xl">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 italic">
                    The shared FB proxy also handles Instagram CDN links seamlessly:
                  </p>
                  <code className="block text-purple-600 dark:text-purple-300 font-mono text-sm break-all bg-white dark:bg-black p-4 rounded-xl border border-purple-100 dark:border-purple-900">
                    /api/fb-downloader/proxy?url=IG_CDN_URL&amp;filename=ig-media.mp4
                  </code>
                </div>
              </div>
            </div>
          )}

          {/* ── TikTok Tab ── */}
          {activeTab === 'tiktok' && (
            <div className="tab-panel">
              <div className="bg-slate-50 dark:bg-black rounded-[2rem] p-8 md:p-12 border border-slate-200 dark:border-slate-800 shadow-2xl">
                <div className="flex flex-wrap items-center gap-3 mb-8">
                  <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-cyan-500 dark:from-rose-400 dark:to-cyan-400">
                    4. TikTok Video Downloader API
                  </h3>
                  <span className="bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-rose-200 dark:border-rose-800">
                    No Watermark
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                  <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-4 py-2 rounded-xl font-mono font-bold text-sm tracking-widest shadow-sm">POST</span>
                  <code className="text-base font-mono text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                    /api/tiktok-downloader
                  </code>
                </div>

                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-base mb-6">
                  Extract high-quality <strong className="text-slate-800 dark:text-white">Watermark-Free Videos</strong> and <strong className="text-slate-800 dark:text-white">Original Audio (MP3)</strong> from any TikTok or Douyin link instantly.
                </p>

                <CodeBlock title="request-body.json" code={`{\n  "url": "https://www.tiktok.com/@user/video/123456789"\n}`} />

                <div className="mt-8">
                  <h4 className="font-bold text-lg mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
                    Direct Download Proxy
                  </h4>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                    <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-4 py-2 rounded-xl font-mono font-bold text-sm tracking-widest shadow-sm">GET</span>
                    <code className="text-sm font-mono text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 break-all">
                      /api/tiktok-downloader?proxyUrl=URL&amp;filename=NAME&amp;ext=mp4
                    </code>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                    Use this to bypass TikTok's strict CORS policies and trigger a browser download.
                  </p>
                </div>

                <div className="mt-10">
                  <CodeBlock
                    title="tiktok-fetch.js"
                    code={`const response = await fetch('/api/tiktok-downloader', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: 'TIKTOK_URL' })
});

const { data } = await response.json();
// data contains: title, thumbnail, and formats array (video & audio)`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── YouTube Tab ── */}
          {activeTab === 'youtube' && (
            <div className="tab-panel">
              <div className="bg-slate-50 dark:bg-black rounded-[2rem] p-8 md:p-12 border border-slate-200 dark:border-slate-800 shadow-2xl">
                <div className="flex flex-wrap items-center gap-3 mb-8">
                  <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500 dark:from-red-400 dark:to-orange-400">
                    5. YouTube Video Downloader API
                  </h3>
                  <span className="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-red-200 dark:border-red-800">
                    High Stability
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                  <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-4 py-2 rounded-xl font-mono font-bold text-sm tracking-widest shadow-sm">POST</span>
                  <code className="text-base font-mono text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                    /api/youtube-downloader
                  </code>
                </div>

                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-base mb-6">
                  Experience lightning-fast <strong className="text-slate-800 dark:text-white">YouTube & Shorts</strong> downloads. Our engine uses a 3-tier fallback system (AB, VKR, and BK9) to ensure 99.9% uptime for both Video (MP4) and Audio (MP3).
                </p>

                <CodeBlock title="request-body.json" code={`{\n  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"\n}`} />

                <div className="mt-8">
                  <h4 className="font-bold text-lg mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
                    Universal Proxy Downloader
                  </h4>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                    <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-4 py-2 rounded-xl font-mono font-bold text-sm tracking-widest shadow-sm">GET</span>
                    <code className="text-sm font-mono text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 break-all">
                      /api/youtube-downloader?proxyUrl=URL&amp;filename=NAME&amp;ext=mp4
                    </code>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                    Fetch YouTube streams directly through our proxy to bypass geographical restrictions and CORS issues.
                  </p>
                </div>

                <div className="mt-10">
                  <CodeBlock
                    title="youtube-fetch.js"
                    code={`const response = await fetch('/api/youtube-downloader', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: 'YOUTUBE_URL' })
});

const { data } = await response.json();
// data contains: title, thumbnail, and unique formats array`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Grammar Tab ── */}
          {activeTab === 'grammar' && (
            <div className="tab-panel">
              <div className="bg-slate-50 dark:bg-black rounded-[2rem] p-8 md:p-12 border border-slate-200 dark:border-slate-800 shadow-2xl">
                <div className="flex flex-wrap items-center gap-3 mb-8">
                  <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500 dark:from-indigo-400 dark:to-violet-400">
                    6. AI Grammar Checker API
                  </h3>
                  <span className="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-indigo-200 dark:border-indigo-800">
                    Powered by Gemini
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                  <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-4 py-2 rounded-xl font-mono font-bold text-sm tracking-widest shadow-sm">POST</span>
                  <code className="text-base font-mono text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                    /api/grammar-checker
                  </code>
                </div>

                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-base mb-6">
                  Fix grammatical, spelling, and punctuation errors instantly using AI. This API provides high-accuracy corrections while strictly preserving the original meaning of your text.
                </p>

                <div className="mb-10">
                  <h4 className="font-bold text-lg mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
                    Request Body (JSON)
                  </h4>
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="flex items-center gap-2">
                        <code className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-lg text-sm font-mono">
                          text
                        </code>
                        <span className="text-red-500 text-xs font-bold mono uppercase tracking-wider">required</span>
                      </div>
                      <span className="text-slate-600 dark:text-slate-400 text-sm">The English text you want to check and correct.</span>
                    </div>
                  </div>
                </div>

                <CodeBlock
                  title="request-example.js"
                  code={`const response = await fetch('/api/grammar-checker', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    text: 'I has a apple and it are very delicious.' 
  })
});

const { success, data } = await response.json();
console.log(data.corrected); // "I have an apple and it is very delicious."`}
                />

                <div className="mt-8">
                  <h4 className="font-bold text-lg mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
                    Response Schema
                  </h4>
                  <CodeBlock
                    title="response.json"
                    code={`{
  "success": true,
  "data": {
    "original": "I has a apple and it are very delicious.",
    "corrected": "I have an apple and it is very delicious."
  }
}`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Article Rewriter Tab ── */}
          {activeTab === 'rewriter' && (
            <div className="tab-panel">
              <div className="bg-slate-50 dark:bg-black rounded-[2rem] p-8 md:p-12 border border-slate-200 dark:border-slate-800 shadow-2xl">
                <div className="flex flex-wrap items-center gap-3 mb-8">
                  <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-400">
                    7. AI Article Rewriter API
                  </h3>
                  <span className="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-200 dark:border-emerald-800">
                    Tone & Length Control
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                  <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-4 py-2 rounded-xl font-mono font-bold text-sm tracking-widest shadow-sm">POST</span>
                  <code className="text-base font-mono text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                    /api/article-rewriter
                  </code>
                </div>

                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-base mb-6">
                  Rewrite any text with professional quality. Choose your preferred tone (Professional, Casual, Creative) and length (Shorten, Expand, Standard).
                </p>

                <div className="mb-10">
                  <h4 className="font-bold text-lg mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
                    Request Body (JSON)
                  </h4>
                  <div className="space-y-3">
                    {[
                      { key: 'text', desc: 'The content you want to rewrite.', required: true },
                      { key: 'tone', desc: 'Tone of output (Standard, Professional, Casual, Creative).', required: false },
                      { key: 'length', desc: 'Length control (Standard, Shorten, Expand).', required: false },
                    ].map((p) => (
                      <div key={p.key} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <code className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg text-sm font-mono">
                            {p.key}
                          </code>
                          {p.required && <span className="text-red-500 text-xs font-bold mono uppercase tracking-wider">required</span>}
                        </div>
                        <span className="text-slate-600 dark:text-slate-400 text-sm">{p.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <CodeBlock
                  title="rewrite-example.js"
                  code={`const response = await fetch('/api/article-rewriter', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    text: 'Artificial Intelligence is changing the world fast.',
    tone: 'Professional',
    length: 'Expand'
  })
});

const { success, data } = await response.json();
console.log(data.rewritten);`}
                />
              </div>
            </div>
          )}

          {/* ── Link Protector Tab ── */}
          {activeTab === 'protector' && (
            <div className="tab-panel">
              <div className="bg-slate-50 dark:bg-black rounded-[2rem] p-8 md:p-12 border border-slate-200 dark:border-slate-800 shadow-2xl">
                <div className="flex flex-wrap items-center gap-3 mb-8">
                  <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-500 dark:from-amber-400 dark:to-orange-400">
                    8. Multi-Link Protector API
                  </h3>
                  <span className="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-amber-200 dark:border-amber-800">
                    Safe Sharing
                  </span>
                </div>

                <div className="space-y-8 mb-10">
                  <div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                      <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-4 py-2 rounded-xl font-mono font-bold text-sm tracking-widest shadow-sm">POST</span>
                      <code className="text-base font-mono text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                        /api/link-protector
                      </code>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 italic">Save multiple links under a single unique ID.</p>
                    <CodeBlock title="create-links.js" code={`// body: { title: "My Collection", links: ["url1", "url2"] }\nconst { data } = await res.json();\nconsole.log(data.id); // returns unique key`} />
                  </div>

                  <div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                      <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-4 py-2 rounded-xl font-mono font-bold text-sm tracking-widest shadow-sm">GET</span>
                      <code className="text-base font-mono text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                        /api/link-protector?id=KEY
                      </code>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 italic">Retrieve protected links using the ID.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Pastebin Tab ── */}
          {activeTab === 'pastebin' && (
            <div className="tab-panel">
              <div className="bg-slate-50 dark:bg-black rounded-[2rem] p-8 md:p-12 border border-slate-200 dark:border-slate-800 shadow-2xl">
                <div className="flex flex-wrap items-center gap-3 mb-8">
                  <h3 className="text-2xl font-black text-slate-800 dark:text-slate-200">
                    9. Simple Pastebin API
                  </h3>
                  <span className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-slate-200 dark:border-slate-700">
                    Fast & Anonymous
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 px-3 py-1 rounded-lg font-mono font-bold text-xs uppercase">POST</span>
                      <span className="text-xs font-mono text-slate-500">Create Paste</span>
                    </div>
                    <CodeBlock title="create.js" code={`// body: { content: "Your text here..." }\nconst { data } = await res.json();\nconsole.log(data.id);`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 px-3 py-1 rounded-lg font-mono font-bold text-xs uppercase">GET</span>
                      <span className="text-xs font-mono text-slate-500">Read Paste</span>
                    </div>
                    <CodeBlock title="read.js" code={`// URL: /api/pastebin?id=xyz123\nconst { data } = await res.json();\nconsole.log(data.content);`} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Resume AI Tab ── */}
          {activeTab === 'resume' && (
            <div className="tab-panel">
              <div className="bg-slate-50 dark:bg-black rounded-[2rem] p-8 md:p-12 border border-slate-200 dark:border-slate-800 shadow-2xl">
                <div className="flex flex-wrap items-center gap-3 mb-8">
                  <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-500 dark:from-violet-400 dark:to-fuchsia-400">
                    10. Resume AI Expert API
                  </h3>
                  <span className="bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-violet-200 dark:border-violet-800">
                    Career Suite
                  </span>
                </div>

                <div className="mb-10">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                    <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-4 py-2 rounded-xl font-mono font-bold text-sm tracking-widest">POST</span>
                    <code className="text-base font-mono bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800">/api/resume-ai</code>
                  </div>

                  <h4 className="font-bold text-slate-800 dark:text-white mb-4">Available Actions:</h4>
                  <div className="grid sm:grid-cols-2 gap-4 h-fit">
                    {[
                      { action: 'summary', desc: 'Generate professional resume summaries.', params: 'jobTitle' },
                      { action: 'experience', desc: 'Enhance work history bullet points.', params: 'rawText' },
                      { action: 'skills', desc: 'Predict in-demand skills for a role.', params: 'jobTitle' },
                      { action: 'coverLetter', desc: 'Write tailored professional cover letters.', params: 'name, jobTitle, summary, skills, jobDesc' },
                      { action: 'ats', desc: 'Perform ATS check and resume analysis.', params: 'cvText, jobDesc' },
                    ].map((a) => (
                      <div key={a.action} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col h-full">
                        <code className="text-violet-600 dark:text-violet-400 text-sm font-bold mb-2 uppercase tracking-wide">{a.action}</code>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 flex-grow">{a.desc}</p>
                        <p className="text-[10px] font-mono text-slate-400 italic">Params: {a.params}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <CodeBlock
                   title="sample-request.js"
                   code={`const res = await fetch('/api/resume-ai', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    action: 'summary', 
    jobTitle: 'Senior React Developer' 
  })
});`}
                />
              </div>
            </div>
          )}

          {/* ── Shortener Tab ── */}
          {activeTab === 'shortener' && (
            <div className="tab-panel">
              <div className="bg-slate-50 dark:bg-black rounded-[2rem] p-8 md:p-12 border border-slate-200 dark:border-slate-800 shadow-2xl">
                <div className="flex flex-wrap items-center gap-3 mb-8">
                  <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-400">
                    11. URL Shortener & QR API
                  </h3>
                  <span className="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-blue-200 dark:border-blue-800">
                    is.gd Powered
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
                   <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 px-4 py-2 rounded-xl font-mono font-bold text-sm tracking-widest">POST</span>
                   <code className="text-base font-mono bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800">/api/url-shortener</code>
                </div>

                <p className="text-slate-600 dark:text-slate-400 mb-8">Instantly shorten URLs and generate scan-ready QR codes for any link.</p>

                <CodeBlock 
                  title="response-preview.json"
                  code={`{
  "success": true,
  "data": {
    "originalUrl": "https://example.com/long-url",
    "shortUrl": "https://is.gd/abc123",
    "qrCode": "https://api.qrserver.com/v1/create-qr-code/..."
  }
}`}
                />
              </div>
            </div>
          )}

          {/* ── Custom Database Tab ── */}
          {activeTab === 'database' && (
            <div className="tab-panel">
              <div className="bg-slate-50 dark:bg-black rounded-[2rem] p-8 md:p-12 border border-slate-200 dark:border-slate-800 shadow-2xl">
                <div className="flex flex-wrap items-center gap-3 mb-8">
                  <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-500 dark:from-rose-400 dark:to-pink-400">
                    12. Custom Database Search API
                  </h3>
                  <span className="bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-rose-200 dark:border-rose-800">
                    Local Search Logic
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
                  <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 px-4 py-2 rounded-xl font-mono font-bold text-sm tracking-widest">POST</span>
                  <code className="text-base font-mono bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800">/api/custom-database</code>
                </div>

                <p className="text-slate-600 dark:text-slate-400 mb-8">
                  Search through your custom collection of software, assets, and premium content. This API performs a fuzzy search on titles and categories.
                </p>

                <CodeBlock 
                  title="request-body.json"
                  code={`{\n  "query": "Typing Software"\n}`}
                />

                <div className="mt-8">
                  <h4 className="font-bold text-lg mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
                    Sample Response
                  </h4>
                  <CodeBlock 
                    title="response.json"
                    code={`{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "QalbeTalks Premium Typing Software",
      "type": "Software",
      "size": "150 MB",
      "link": "https://drive.google.com/..."
    }
  ]
}`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Passport Photo Tab ── */}
          {activeTab === 'passport' && (
            <div className="tab-panel">
              <div className="bg-slate-50 dark:bg-black rounded-[2rem] p-8 md:p-12 border border-slate-200 dark:border-slate-800 shadow-2xl">
                <div className="flex flex-wrap items-center gap-3 mb-8">
                  <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-500 dark:from-cyan-400 dark:to-blue-400">
                    13. Passport Photo AI API
                  </h3>
                  <span className="bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-cyan-200 dark:border-cyan-800">
                    Background Removal
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
                  <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 px-4 py-2 rounded-xl font-mono font-bold text-sm tracking-widest">POST</span>
                  <code className="text-base font-mono bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800">/api/passport-photo</code>
                </div>

                <p className="text-slate-600 dark:text-slate-400 mb-8 font-medium">
                  Automatically remove backgrounds from portraits using AI. Perfect for creating professional passport, visa, or profile photos in seconds.
                </p>

                <div className="mb-10">
                  <h4 className="font-bold text-lg mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
                    Request (Multipart Form-Data)
                  </h4>
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-2">
                       <code className="text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 px-3 py-1 rounded-lg text-sm font-mono">image</code>
                       <span className="text-red-500 text-xs font-bold mono uppercase tracking-wider">required</span>
                    </div>
                    <span className="text-slate-600 dark:text-slate-400 text-sm italic">The portrait image file (JPG, PNG).</span>
                  </div>
                </div>

                <CodeBlock 
                  title="remove-bg.js"
                  code={`const formData = new FormData();
formData.append('image', fileInput.files[0]);

const response = await fetch('/api/passport-photo', {
  method: 'POST',
  body: formData
});

const { data } = await response.json();
// Returns data.base64 (Processed image)`}
                />
              </div>
            </div>
          )}

        </div>
      </section>


      {/* ════════════════════════════════════
          PRICING & PREMIUM SECTION
      ════════════════════════════════════ */}
      <section id="pricing" className="py-32 relative overflow-hidden bg-slate-50 dark:bg-black border-t border-slate-200 dark:border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <FadeUp className="mb-20">
            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight text-slate-900 dark:text-white">
              Scale Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500 dark:from-indigo-400 dark:to-violet-400 font-black italic">Ambition</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed">
              Start for free. Upgrade to Pro for just <strong className="text-indigo-600 dark:text-indigo-400">$1/day</strong> and get massive daily limits.
            </p>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            {/* Free Tier */}
            <div className="group p-10 rounded-[3rem] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col hover:border-indigo-500/30 transition-all duration-500 hover:shadow-2xl">
              <div className="mb-8 font-black uppercase tracking-widest text-slate-400 text-xs">Hobbyist</div>
              <div className="mb-8">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-black text-slate-900 dark:text-white">$0</span>
                  <span className="text-slate-500 text-sm font-medium">/ 24h</span>
                </div>
              </div>
              <ul className="space-y-4 mb-10 text-left flex-grow">
                {['20 API Calls / Day', 'Standard Social Tools', 'Public Community Support', 'CORS Enabled'].map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm font-medium">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 flex-shrink-0">
                      <IconZap />
                    </div>
                    {feat}
                  </li>
                ))}
              </ul>
              <button className="w-full py-4 rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-800 transition-all">
                Current Plan
              </button>
            </div>

            {/* Pro Tier (Featured) */}
            <div className="group p-10 rounded-[3rem] bg-indigo-600 text-white flex flex-col relative scale-105 shadow-2xl shadow-indigo-500/20">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-amber-400 text-indigo-950 px-6 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
                Best Value
              </div>
              <div className="mb-8 font-black uppercase tracking-widest text-indigo-200 text-xs">Professional</div>
              <div className="mb-8">
                <div className="flex items-baseline justify-center gap-1 text-white">
                  <span className="text-5xl font-black">$1</span>
                  <span className="text-indigo-200 text-sm font-medium">/ day</span>
                </div>
              </div>
              <ul className="space-y-4 mb-10 text-left flex-grow">
                {['100 API Calls / Day', 'Full AI Suite (Grammar, Resume)', 'Priority Image Processing', 'Private API Endpoint Access', 'Premium Dev Support'].map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-indigo-50 text-sm font-bold">
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white flex-shrink-0">
                      <IconZap />
                    </div>
                    {feat}
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => {
                  setSelectedTier('pro');
                  setShowPaymentModal(true);
                }} 
                className="w-full py-4 rounded-2xl bg-white text-indigo-600 font-black text-sm hover:bg-indigo-50 transition-all shadow-xl shadow-black/10 active:scale-95 flex items-center justify-center gap-2 group"
              >
                Buy Now
                <IconArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Enterprise Tier */}
            <div className="group p-10 rounded-[3rem] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col hover:border-violet-500/30 transition-all duration-500 hover:shadow-2xl">
              <div className="mb-8 font-black uppercase tracking-widest text-slate-400 text-xs">Enterprise</div>
              <div className="mb-8">
                <div className="flex items-baseline justify-center gap-1 text-slate-900 dark:text-white">
                  <span className="text-3xl font-black">Custom</span>
                </div>
              </div>
              <ul className="space-y-4 mb-10 text-left flex-grow">
                {['Unlimited API Scalability', 'Custom Route Implementation', 'Dedicated Account Manager', 'SLA Guaranteed 99.9% Uptime'].map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm font-medium">
                    <div className="w-5 h-5 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-500 flex-shrink-0">
                      <IconZap />
                    </div>
                    {feat}
                  </li>
                ))}
              </ul>
              <button className="w-full py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm hover:opacity-90 transition-all">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>


      {/* ════════════════════════════════════
          WHY QALBETOOLS — DETAILED SECTION
      ════════════════════════════════════ */}
      <section id="why-section" className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-40 dark:opacity-20" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">

          {/* Section header */}
          <FadeUp className="mb-16 text-center sm:text-left">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-3">
              Why QalbeTools
            </p>
            <h2 className="text-3xl md:text-5xl font-black mb-5 tracking-tight leading-tight">
              Why Use the{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 dark:from-indigo-400 dark:to-blue-400">
                QalbeTools Dev API?
              </span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl leading-relaxed">
              From indie developers to growing startup teams, here is why QalbeTools is the go-to choice for professional, production-ready API tooling — at zero cost.
            </p>
          </FadeUp>

          {/* Cards */}
          <div className="space-y-5">

            <WhyCard
              delay={0}
              icon={<IconImage />}
              accentClass="text-indigo-600 dark:text-indigo-400"
              borderClass="border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700"
              bgClass="bg-indigo-50 dark:bg-indigo-950/40"
              title="Realistic Device Mockups Dramatically Increase Engagement"
            >
              <p>
                Placing your app or website screenshot inside a realistic <strong className="text-slate-800 dark:text-white">iPhone 15</strong> or <strong className="text-slate-800 dark:text-white">Apple MacBook</strong> frame instantly elevates perceived quality. Research in UX consistently confirms that contextual screenshots inside hardware frames drive significantly higher click-through rates on landing pages, app store listings, and investor decks — because they help users immediately visualize the product in real life.
              </p>
              <p>
                Whether you are building an app portfolio to attract clients, crafting a Play Store or App Store product page, preparing pitch materials for investors, or simply generating polished marketing graphics for social media — a professional device mockup removes doubt and communicates attention to detail at a glance. The QalbeTools API automates this entire workflow in a single HTTP call.
              </p>
            </WhyCard>

            <WhyCard
              delay={60}
              icon={<IconZap />}
              accentClass="text-amber-600 dark:text-amber-400"
              borderClass="border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700"
              bgClass="bg-amber-50 dark:bg-amber-950/30"
              title="No Photoshop, No Figma — Results in Under 500ms"
            >
              <p>
                Traditional mockup workflows demand expensive software like <strong className="text-slate-800 dark:text-white">Adobe Photoshop</strong> or <strong className="text-slate-800 dark:text-white">Figma</strong>, along with hours of manual work: opening smart object layers, scaling screenshots precisely, adjusting corner masks, exporting the final composite. For teams running continuous deployment cycles, this manual step is a bottleneck.
              </p>
              <p>
                The QalbeTools Mockup API is powered by the <strong className="text-slate-800 dark:text-white">Sharp image processing library</strong> — one of the fastest Node.js imaging engines available. It automatically detects the transparent screen area of each device frame, calculates the correct target dimensions, applies mathematically precise corner radius masking, and composites your screenshot into the frame — all in a single server-side operation with sub-500ms response times.
              </p>
              <p>
                This makes it a perfect fit for <strong className="text-slate-800 dark:text-white">CI/CD pipelines</strong> where app store screenshots must be regenerated after every release, or for SaaS products that let end-users automatically generate their own mockups without any human design intervention.
              </p>
            </WhyCard>

            <WhyCard
              delay={120}
              icon={<IconLock />}
              accentClass="text-emerald-600 dark:text-emerald-400"
              borderClass="border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700"
              bgClass="bg-emerald-50 dark:bg-emerald-950/30"
              title="Completely Free — No API Key, No Credit Card, No Rate Limits"
            >
              <p>
                Unlike commercial alternatives such as <strong className="text-slate-800 dark:text-white">Smartmockups, Placeit</strong>, or <strong className="text-slate-800 dark:text-white">MockMagic</strong> that charge between $20 and $60 per month for API access, QalbeTools is entirely free and open-source. There is no API key to generate, no OAuth flow to implement, no credit card to register, and no usage dashboard to monitor.
              </p>
              <p>
                For solo developers, indie makers, and early-stage startups working within tight budgets, this means you can ship polished marketing assets and media download features on day one — without infrastructure cost or subscription overhead eating into your runway.
              </p>
            </WhyCard>

            <WhyCard
              delay={180}
              icon={<IconGlobe />}
              accentClass="text-blue-600 dark:text-blue-400"
              borderClass="border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700"
              bgClass="bg-blue-50 dark:bg-blue-950/30"
              title="Framework-Agnostic: Works With Any Stack, Any Language"
            >
              <p>
                QalbeTools APIs are standard REST endpoints with no proprietary SDK requirements. They work natively with any HTTP client — <strong className="text-slate-800 dark:text-white">fetch(), axios, curl, PHP cURL, Python requests, Kotlin OkHttp</strong>, or any tool capable of making HTTP calls.
              </p>
              <p>
                The mockup endpoint accepts standard <code className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm">multipart/form-data</code> — identical to a plain HTML file input — making it trivially simple to integrate into any existing file upload flow. The downloader endpoints accept a minimal JSON body and return consistent, predictable schemas regardless of whether you are fetching from Facebook or Instagram, so your parsing logic stays the same.
              </p>
              <p>
                Whether you are running <strong className="text-slate-800 dark:text-white">Next.js 14, a Laravel backend, a WordPress plugin, a Flutter mobile app</strong>, or a simple Node.js automation script — QalbeTools integrates without friction, without library dependencies, and without configuration.
              </p>
            </WhyCard>

            <WhyCard
              delay={240}
              icon={<IconRefreshCw />}
              accentClass="text-violet-600 dark:text-violet-400"
              borderClass="border-slate-200 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-700"
              bgClass="bg-violet-50 dark:bg-violet-950/30"
              title="Social Downloaders With Multi-Method Fallback for High Uptime"
            >
              <p>
                Building a content aggregation platform, media archive tool, or social analytics system? The Facebook and Instagram downloader APIs give you reliable, structured access to public social media content without you having to maintain brittle, undocumented scrapers yourself.
              </p>
              <p>
                The <strong className="text-slate-800 dark:text-white">Facebook Downloader</strong> returns multiple quality variants (HD and SD), thumbnail URLs, and post metadata — everything needed to build a polished download interface. The proxy endpoint injects <code className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm">Content-Disposition</code> headers to force browser Save-As dialogs instead of inline media previews, solving a common cross-origin download problem in a single endpoint.
              </p>
              <p>
                The <strong className="text-slate-800 dark:text-white">Instagram Downloader</strong> uses a three-stage fallback strategy: SnapSave is tried first, then SaveIG, then a direct GraphQL query. If any single method fails due to platform changes, the next one automatically takes over — giving your integration significantly higher real-world uptime compared to any single-method approach.
              </p>
            </WhyCard>

            <WhyCard
              delay={300}
              icon={<IconCode />}
              accentClass="text-pink-600 dark:text-pink-400"
              borderClass="border-slate-200 dark:border-slate-800 hover:border-pink-300 dark:hover:border-pink-700"
              bgClass="bg-pink-50 dark:bg-pink-950/30"
              title="Open Source, Auditable, and Community-Driven"
            >
              <p>
                Every line of QalbeTools is <strong className="text-slate-800 dark:text-white">publicly available on GitHub</strong>. You can audit the source code, fork it for your own needs, self-host it on your own infrastructure, or contribute improvements back to the community. There is no black box, no hidden telemetry, and no vendor lock-in.
              </p>
              <p>
                This project is built and maintained by the <strong className="text-slate-800 dark:text-white">QalbeTalks Devs</strong> team — independent developers who believe that high-quality developer tooling should be accessible to every builder, not gated behind enterprise pricing tiers. Star the repository, file issues, and submit pull requests. Your contributions directly improve a tool that thousands of developers rely on every day.
              </p>
            </WhyCard>

          </div>
        </div>
      </section>


      {/* ════════════════════════════════════
          FEATURE GRID
      ════════════════════════════════════ */}
      <section className="py-20 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-black mb-2">Everything you need. Nothing you don't.</h2>
            <p className="text-slate-500 dark:text-slate-400">Built lean. Built fast. Built for developers.</p>
          </FadeUp>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: <IconZap />, label: 'Sub-500ms Response', desc: 'Sharp-powered image processing', color: 'text-amber-500' },
              { icon: <IconLock />, label: 'Zero Auth Required', desc: 'No API keys or sign-up flows', color: 'text-emerald-500' },
              { icon: <IconGlobe />, label: 'CORS Configured', desc: 'Call directly from any browser', color: 'text-blue-500' },
              { icon: <IconLayers />, label: 'Carousel Support', desc: 'Multi-image Instagram posts', color: 'text-violet-500' },
              { icon: <IconRefreshCw />, label: 'Multi-Method Fallback', desc: 'Three-stage IG scraping engine', color: 'text-pink-500' },
              { icon: <IconDownload />, label: 'Proxy Downloads', desc: 'Force Content-Disposition header', color: 'text-indigo-500' },
            ].map((f, i) => (
              <FadeUp key={i} delay={i * 40}>
                <div className="group p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all duration-300 h-full">
                  <div className={`mb-3 ${f.color}`}>{f.icon}</div>
                  <div className="font-bold text-slate-800 dark:text-white text-sm mb-1">{f.label}</div>
                  <div className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{f.desc}</div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>


      {/* ════════════════════════════════════
          FOOTER
      ════════════════════════════════════ */}
      <footer className="bg-slate-900 dark:bg-black text-slate-400 py-16 border-t border-slate-800 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-indigo-500/8 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center justify-center gap-6">
            <h3 className="text-3xl font-black text-white tracking-tighter">
              Qalbe<span className="text-indigo-500">Tools</span>
            </h3>
            <p className="max-w-xl mx-auto text-base leading-relaxed text-slate-300">
              A powerful open-source suite of developer utilities brought to you by the creators of QalbeTalks. Discover tools that supercharge your workflow.
            </p>

            {/* Star badge */}
            <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold border border-amber-500/30 bg-amber-500/8 px-4 py-2 rounded-full">
              <IconStar /> Star us on GitHub to support the project
            </div>

            <a
              href="https://qalbetalks.com"
              className="btn-shimmer inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-full font-bold text-base shadow-xl shadow-indigo-600/20 transition-all hover:scale-105"
              target="_blank" rel="noopener noreferrer"
              title="QalbeTalks - Technology, Coding, and Free Web Tools"
            >
              Learn more at QalbeTalks.com
              <IconArrowRight />
            </a>
          </div>

          <div className="mt-16 pt-8 border-t border-slate-800/60 text-sm text-slate-500">
            <p>
              &copy; {new Date().getFullYear()}{' '}
              <a href="https://qalbetalks.com" className="text-slate-300 hover:text-indigo-400 transition-colors">
                QalbeTalks Devs
              </a>
              . All rights reserved. Built with Next.js and Tailwind CSS.
            </p>
          </div>
        </div>
      </footer>

      {/* Payment Modal */}
      <PaymentModal 
        isOpen={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)} 
        tier={selectedTier} 
      />
    </div>
  );
}
