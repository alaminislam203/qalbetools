'use client';

import ResumeAI from "@/components/ResumeAI";
import Link from "next/link";

export default function ResumePage() {
  return (
    <div className="bg-[#050505] text-white font-sans antialiased selection:bg-primary/20 min-h-screen">
      {/* Immersive Header */}
      <nav className="fixed top-0 w-full z-50 bg-black/40 backdrop-blur-2xl border-b border-white/5">
        <div className="flex justify-between items-center h-20 px-8 max-w-screen-2xl mx-auto">
          <Link className="text-2xl font-black tracking-tighter text-white flex items-center gap-2" href="/">
            <span className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-black text-xl">account_circle</span>
            </span>
            Syntactic <span className="text-primary font-mono text-sm ml-2">RESUME AI</span>
          </Link>
          <Link href="/" className="bg-white/10 text-white px-6 py-2.5 rounded-full hover:bg-white/20 transition-all text-sm font-bold flex items-center gap-2 border border-white/10">
            <span className="material-symbols-outlined text-[18px]">home</span>
            Back to Tools
          </Link>
        </div>
      </nav>

      <main className="pt-32 pb-24 px-8 max-w-screen-xl mx-auto">
        <div className="text-center mb-16">
          <span className="font-mono text-primary font-bold tracking-[0.2em] uppercase text-xs mb-4 inline-block">ATS-Optimized Resumes</span>
          <h1 className="text-5xl md:text-7xl font-sans font-black tracking-tighter mb-6 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
            AI Resume Builder
          </h1>
          <p className="text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
            Turn your raw experience into a professional, high-impact resume using Google Gemini AI. 
            Download instantly in PDF and Word formats.
          </p>
        </div>

        <ResumeAI />
      </main>

      <footer className="border-t border-white/5 py-12 px-8 text-center bg-black/40 backdrop-blur-3xl">
        <p className="text-white/20 text-sm font-mono tracking-widest uppercase">
          &copy; 2026 QalbeTools Premium | Powered by Syntactic AI
        </p>
      </footer>
    </div>
  );
}
