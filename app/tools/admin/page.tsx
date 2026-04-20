'use client';

import LogChecker from "@/components/LogChecker";
import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="bg-[#050505] text-white font-sans antialiased selection:bg-primary/20 min-h-screen">
      {/* Immersive Header */}
      <nav className="fixed top-0 w-full z-50 bg-black/40 backdrop-blur-2xl border-b border-white/5">
        <div className="flex justify-between items-center h-20 px-8 max-w-screen-2xl mx-auto">
          <Link className="text-2xl font-black tracking-tighter text-white flex items-center gap-2" href="/">
            <span className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-xl">terminal</span>
            </span>
            Syntactic <span className="text-primary font-mono text-sm ml-2">ADMIN</span>
          </Link>
          <Link href="/" className="bg-white/10 text-white px-6 py-2.5 rounded-full hover:bg-white/20 transition-all text-sm font-bold flex items-center gap-2 border border-white/10">
            <span className="material-symbols-outlined text-[18px]">home</span>
            Exit Panel
          </Link>
        </div>
      </nav>

      <main className="pt-32 pb-24 px-8 max-w-screen-xl mx-auto">
        <div className="text-center mb-16">
          <span className="font-mono text-primary font-bold tracking-[0.2em] uppercase text-xs mb-4 inline-block">System Telemetry</span>
          <h1 className="text-5xl md:text-7xl font-sans font-black tracking-tighter mb-6 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
            Command Center
          </h1>
          <p className="text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
            Real-time monitoring of all QalbeTools APIs, system dependencies, and diagnostic logs.
          </p>
        </div>

        <LogChecker />
      </main>

      <footer className="border-t border-white/5 py-12 px-8 text-center bg-black/40 backdrop-blur-3xl">
        <p className="text-white/20 text-sm font-mono tracking-widest uppercase">
          &copy; 2026 QalbeTools Command Center | Internal Use Only
        </p>
      </footer>
    </div>
  );
}
