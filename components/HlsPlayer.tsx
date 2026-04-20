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
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hls.loadSource(proxiedSrc);
      hls.attachMedia(video);
      hlsRef.current = hls;

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLive(true);
        if (autoPlay) {
          video.play().catch(e => console.log("Autoplay blocked:", e));
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError("Network error. Retrying...");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError("Media error. Recovering...");
              hls.recoverMediaError();
              break;
            default:
              setError("Fatal playback error.");
              hls.destroy();
              break;
          }
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
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md text-white p-6 text-center">
          <div className="flex flex-col items-center gap-4">
            <span className="material-symbols-outlined text-4xl text-error">error</span>
            <p className="font-medium">{error}</p>
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
