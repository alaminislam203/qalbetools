'use client';

import { useEffect, useRef, useState } from 'react';

interface UltraPlayerProps {
  src: string;
  autoPlay?: boolean;
}

export default function UltraPlayer({ src, autoPlay = true }: UltraPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    setLoading(true);
    setError(null);

    // Connect to the Ultra Proxy
    const ultraSrc = `/api/stream/ultra?url=${encodeURIComponent(src)}`;
    video.src = ultraSrc;

    const handleCanPlay = () => {
      setLoading(false);
      if (autoPlay) {
        video.play().catch(e => console.log("Autoplay blocked:", e));
      }
    };

    const handleError = () => {
      setError("The Ultra Engine could not decode the stream. Retrying...");
      setLoading(false);
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      video.pause();
      video.src = "";
      video.load();
    };
  }, [src, autoPlay]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/5 group">
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        controls
        playsInline
      />
      
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xl transition-all">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 font-mono text-[10px] text-primary uppercase tracking-[0.3em] font-black">Initializing Ultra Engine</p>
        </div>
      )}

      <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-600 to-red-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg z-10">
        <span className="material-symbols-outlined text-[14px]">bolt</span>
        Ultra Pipeline
      </div>

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-3xl text-white p-8 text-center z-20">
          <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-red-600">report</span>
            </div>
            <div>
              <h4 className="font-black text-2xl mb-2 italic">PIPELINE BREAK</h4>
              <p className="text-white/40 text-sm max-w-xs">{error}</p>
            </div>
            <button 
                onClick={() => window.location.reload()}
                className="px-8 py-3 bg-white text-black rounded-full font-black text-sm hover:scale-105 active:scale-95 transition-all"
            >
                RESTART PIPELINE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
