'use client';

import { useState } from 'react';
import HlsPlayer from "@/components/HlsPlayer";
import MpegTsPlayer from "@/components/MpegTsPlayer";
import UltraPlayer from "@/components/UltraPlayer";
import Link from "next/link";

export default function IPTVPage() {
  const [url, setUrl] = useState('http://103.157.248.140:8000/play/a01p/index.m3u8');
  const [playingUrl, setPlayingUrl] = useState('');
  const [engine, setEngine] = useState<'hls' | 'ffmpeg' | 'ultra'>('ultra');

  const handlePlay = () => {
    if (!url) return;
    setPlayingUrl(url);
  };

  const PRESETS = [
    { name: 'Your IPTV Stream', url: 'http://103.157.248.140:8000/play/a01p/index.m3u8' },
    { name: 'Global Test (HLS)', url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
    { name: 'Big Buck Bunny (HLS)', url: 'https://test-streams.mux.dev/pts_720p_60fps_h264/video.m3u8' },
  ];

  return (
    <div className="bg-[#050505] text-white font-sans antialiased selection:bg-primary/20 min-h-screen" suppressHydrationWarning>
      {/* Immersive Header */}
      <nav className="fixed top-0 w-full z-50 bg-black/40 backdrop-blur-2xl border-b border-white/5">
        <div className="flex justify-between items-center h-20 px-8 max-w-screen-2xl mx-auto">
          <Link className="text-2xl font-black tracking-tighter text-white flex items-center gap-2" href="/">
            <span className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-black text-xl">play_arrow</span>
            </span>
            Syntactic <span className="text-primary font-mono text-sm ml-2">IPTV</span>
          </Link>

          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10 scale-90 md:scale-100">
            <button 
                onClick={() => setEngine('ultra')}
                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 ${engine === 'ultra' ? 'bg-orange-600 text-white' : 'text-white/40 hover:text-white'}`}
            >
                <span className="material-symbols-outlined text-[14px]">bolt</span>
                Ultra
            </button>
            <button 
                onClick={() => setEngine('hls')}
                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${engine === 'hls' ? 'bg-primary text-black' : 'text-white/40 hover:text-white'}`}
            >
                HLS
            </button>
            <button 
                onClick={() => setEngine('ffmpeg')}
                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${engine === 'ffmpeg' ? 'bg-primary text-black' : 'text-white/40 hover:text-white'}`}
            >
                FFmpeg
            </button>
          </div>

          <Link href="/" className="bg-white/10 text-white px-6 py-2.5 rounded-full hover:bg-white/20 transition-all text-sm font-bold hidden md:flex items-center gap-2 border border-white/10">
            <span className="material-symbols-outlined text-[18px]">home</span>
            Exit Cinema
          </Link>
        </div>
      </nav>

      <main className="pt-32 pb-24 px-8 max-w-screen-xl mx-auto">
        <div className="text-center mb-16">
          <span className="font-mono text-primary font-bold tracking-[0.2em] uppercase text-xs mb-4 inline-block">Pro Media Center</span>
          <h1 className="text-5xl md:text-7xl font-sans font-black tracking-tighter mb-6 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
            IPTV Stream Player
          </h1>
          <p className="text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
            {engine === 'ultra' ? 'Using Fragmented MP4 Pipeline for maximum reliability.' : engine === 'hls' ? 'Using Client-side HLS.js for low-latency streaming.' : 'Using Server-side FFmpeg Pipeline for complex streams.'}
          </p>
        </div>

        {/* Player Section */}
        <div className="mb-12">
            {playingUrl ? (
                engine === 'ultra' ? <UltraPlayer src={playingUrl} /> : engine === 'hls' ? <HlsPlayer src={playingUrl} /> : <MpegTsPlayer src={playingUrl} />
            ) : (
                <div className="aspect-video bg-white/5 rounded-3xl border border-white/10 flex flex-col items-center justify-center gap-6 group cursor-pointer hover:bg-white/[0.07] transition-all" onClick={handlePlay}>
                    <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_50px_rgba(var(--primary-rgb),0.3)]">
                        <span className="material-symbols-outlined text-black text-4xl">play_arrow</span>
                    </div>
                    <p className="text-white/40 font-bold uppercase tracking-widest text-sm">Click to Initialize {engine.toUpperCase()} Engine</p>
                </div>
            )}
        </div>

        {/* Control Center */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">link</span>
                        Stream Address
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <input
                            type="text"
                            placeholder="Enter .m3u8 URL here..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="flex-grow bg-black/40 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder:text-white/20 transition-all font-medium"
                        />
                        <button
                            onClick={handlePlay}
                            className="bg-primary text-black px-10 py-4 rounded-2xl font-black hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined">sensors</span>
                            Connect
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-white/5 p-8 rounded-3xl border border-white/10 h-full">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">bookmark</span>
                        Quick Presets
                    </h3>
                    <div className="flex flex-col gap-3">
                        {PRESETS.map((preset, idx) => (
                            <button
                                key={idx}
                                onClick={() => { setUrl(preset.url); setPlayingUrl(preset.url); }}
                                className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all border border-white/5 group"
                            >
                                <span className="font-bold text-white/70 group-hover:text-white transition-colors">{preset.name}</span>
                                <span className="material-symbols-outlined text-primary text-sm">arrow_forward</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}
