'use client';

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface HlsPlayerProps {
  src: string;
  autoPlay?: boolean;
}

export default function HlsPlayer({ src, autoPlay = true }: HlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    // Clean up previous instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
    }

    // Use our proxy API to avoid CORS issues
    const proxiedSrc = `/api/stream/proxy?url=${encodeURIComponent(src)}`;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false, // Turn off low latency for better buffer stability
        backBufferLength: 60,
        maxBufferLength: 60,
        maxMaxBufferLength: 90,
        fragLoadingMaxRetry: 10,
        levelLoadingMaxRetry: 10,
        manifestLoadingMaxRetry: 10,
        startLevel: -1, // Let HLS.js decide but be ready to recover
        abrEwmaDefaultEstimate: 500000, // 500kbps initial estimate
      });

      hls.loadSource(proxiedSrc);
      hls.attachMedia(video);
      hlsRef.current = hls;

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLive(true);
        if (autoPlay) {
          video.play().catch(e => {
            console.log("Autoplay blocked:", e);
            setError("Autoplay blocked. Please click play manually.");
          });
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError(`Network error: ${data.details}. Retrying...`);
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError(`Media decode error: ${data.details}. Attempting recovery...`);
              hls.recoverMediaError();
              break;
            default:
              setError(`Fatal error: ${data.details}. Please try switching to ULTRA mode if available on your VPS.`);
              hls.destroy();
              break;
          }
        } else {
            console.warn("Non-fatal HLS error:", data.details);
        }
      });
    } 
    // For Safari which has native HLS support
    else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = proxiedSrc;
      video.addEventListener('loadedmetadata', () => {
        setIsLive(true);
        if (autoPlay) video.play();
      });
    } else {
      setError("HLS is not supported in this browser.");
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [src, autoPlay]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden ambient-shadow border border-outline-variant/10">
      <video
        ref={videoRef}
        className="w-full h-full cursor-pointer"
        controls
        playsInline
      />
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-xl text-white p-6 text-center">
          <div className="flex flex-col items-center gap-6 max-w-sm">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30">
                <span className="material-symbols-outlined text-3xl text-red-500">error</span>
            </div>
            <div>
                <h4 className="text-lg font-bold mb-2">Playback Stalled</h4>
                <p className="text-sm text-white/60 leading-relaxed">{error}</p>
            </div>
            <button 
                onClick={() => { setError(null); hlsRef.current?.startLoad(); }}
                className="bg-white text-black px-8 py-2.5 rounded-full font-bold hover:bg-white/90 transition-all active:scale-95"
            >
                Try Reconnect
            </button>
          </div>
        </div>
      )}

      {isLive && (
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
          <span className="w-2 h-2 bg-white rounded-full"></span>
          Live
        </div>
      )}
    </div>
  );
}
