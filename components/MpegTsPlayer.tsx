import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

interface MpegTsPlayerProps {
  src: string;
  autoPlay?: boolean;
}

export default function MpegTsPlayer({ src, autoPlay = true }: MpegTsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<string>('Initializing FFmpeg Engine...');
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    // Access global mpegts from window
    const mpegts = (window as any).mpegts;
    
    if (!scriptLoaded || !mpegts) return;

    if (!mpegts.getFeatureList().mseLivePlayback) {
      setError("Your browser does not support MSE live playback.");
      return;
    }

    const video = videoRef.current;
    if (!video || !src) return;

    // Clean up previous instance
    if (playerRef.current) {
      playerRef.current.destroy();
    }

    // Connect to our FFmpeg proxy
    const ffmpegSrc = `/api/stream/ffmpeg?url=${encodeURIComponent(src)}`;

    try {
      const player = mpegts.createPlayer({
        type: 'flv', // Changed to flv for better stability with FFmpeg pipe
        isLive: true,
        url: ffmpegSrc,
        hasAudio: true,
        hasVideo: true,
      }, {
        enableStashBuffer: false,
        liveBufferLatencyChasing: true,
      });

      player.attachMediaElement(video);
      player.load();
      playerRef.current = player;

      player.on('error', (type: any, detail: any, info: any) => {
        console.error('mpegts error:', type, detail, info);
        setError(`Playback Error: ${type} - ${detail}`);
      });

      player.on('statistics_info', (res: any) => {
        setStats(`Bitrate: ${Math.round(res.speed)} KB/s`);
      });

      if (autoPlay) {
        player.play().catch((e: any) => console.log("Autoplay blocked:", e));
      }
    } catch (e: any) {
      setError(`Player initialization failed: ${e.message}`);
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [src, autoPlay, scriptLoaded]);

  return (
    <>
      <Script 
        src="https://unpkg.com/mpegts.js/dist/mpegts.js" 
        onLoad={() => setScriptLoaded(true)}
      />
      <div className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden ambient-shadow border border-white/10 group">
        <video
          ref={videoRef}
          className="w-full h-full cursor-pointer"
          controls
          playsInline
        />
        
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-[10px] font-mono border border-white/10 transition-opacity group-hover:opacity-100 opacity-0">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          FFmpeg Backend Active
        </div>

        <div className="absolute bottom-20 left-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded text-[10px] font-mono border border-white/5 opacity-40">
          {stats}
        </div>

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-2xl text-white p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <span className="material-symbols-outlined text-5xl text-error">dangerous</span>
              <div>
                <h4 className="font-bold text-xl mb-1">Engine Error</h4>
                <p className="text-white/60 text-sm">{error}</p>
              </div>
              <button 
                  onClick={() => window.location.reload()}
                  className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-xs font-bold transition-all"
              >
                  Restart Engine
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
