'use client';

import { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

interface VideoJsPlayerProps {
  src: string;
  autoPlay?: boolean;
}

export default function VideoJsPlayer({ src, autoPlay = true }: VideoJsPlayerProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    // Initializing the player only once
    if (!playerRef.current) {
        const videoElement = document.createElement('video-js');
        videoElement.classList.add('vjs-big-play-centered', 'vjs-theme-city'); 
        videoRef.current?.appendChild(videoElement);

        const proxiedSrc = `/api/stream/proxy?url=${encodeURIComponent(src)}`;

        const player = (playerRef.current = videojs(videoElement, {
            autoplay: autoPlay,
            controls: true,
            responsive: true,
            fluid: true,
            liveui: true,
            playbackRates: [0.5, 1, 1.5, 2],
            sources: [{
                src: proxiedSrc,
                type: 'application/x-mpegURL'
            }]
        }, () => {
            console.log('Video.js Player Ready');
        }));
    } else {
        // Handle source change without re-initializing
        const player = playerRef.current;
        const proxiedSrc = `/api/stream/proxy?url=${encodeURIComponent(src)}`;
        player.src({ src: proxiedSrc, type: 'application/x-mpegURL' });
    }
  }, [src, autoPlay]);

  // Clean up player on unmount
  useEffect(() => {
    const player = playerRef.current;
    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden ambient-shadow border border-white/10 overflow-hidden">
        <div ref={videoRef} className="w-full h-full" />
        
        <style jsx global>{`
            .video-js {
                font-family: inherit;
                background-color: transparent !important;
                border-radius: 1.5rem;
            }
            .vjs-big-play-button {
                background-color: #ff3e00 !important;
                border: none !important;
                width: 80px !important;
                height: 80px !important;
                line-height: 80px !important;
                border-radius: 50% !important;
                top: 50% !important;
                left: 50% !important;
                margin-top: -40px !important;
                margin-left: -40px !important;
                box-shadow: 0 0 40px rgba(255, 62, 0, 0.4);
            }
            .vjs-control-bar {
                background-color: rgba(0,0,0,0.7) !important;
                backdrop-filter: blur(20px);
                height: 60px !important;
                padding: 0 10px;
            }
            .vjs-slider {
                background-color: rgba(255,255,255,0.1) !important;
            }
            .vjs-play-progress {
                background-color: #ff3e00 !important;
            }
            .vjs-load-progress {
                background-color: rgba(255,255,255,0.2) !important;
            }
            .vjs-poster {
                background-size: cover;
                border-radius: 1.5rem;
            }
            .video-js.vjs-fluid, .video-js.vjs-16-9, .video-js.vjs-4-3 {
                border-radius: 1.5rem;
            }
        `}</style>
    </div>
  );
}
