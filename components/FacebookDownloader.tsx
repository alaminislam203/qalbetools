'use client';

import { useState } from 'react';

export default function FacebookDownloader() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/facebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch data');
      }

      setResult(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-20 w-full max-w-4xl mx-auto p-8 bg-surface-container-lowest rounded-2xl ambient-shadow glass-edge border border-outline-variant/20">
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <h2 className="text-3xl font-headline font-bold text-on-surface mb-2">Facebook Video Downloader</h2>
          <p className="text-on-surface-variant">Paste your Facebook video link below to get download links instantly.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="https://www.facebook.com/watch/?v=..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-grow bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface placeholder:text-outline/50 transition-all"
          />
          <button
            onClick={() => {
              console.log('Button clicked directly');
              handleDownload();
            }}
            disabled={loading}
            className="bg-primary text-on-primary px-8 py-3 rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[140px]"
          >
            {loading ? (
              <>
                <span className="animate-spin material-symbols-outlined">progress_activity</span>
                <span>Loading...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">download</span>
                <span>Download</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-error-container text-on-error-container rounded-lg flex items-center gap-3">
            <span className="material-symbols-outlined text-error">error</span>
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Thumbnail/Preview */}
              <div className="relative aspect-video rounded-xl overflow-hidden glass-edge shadow-lg bg-surface-container-highest">
                <img
                  src={result.thumbnail || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=1000&auto=format&fit=crop'}
                  alt="Video Thumbnail"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-6xl opacity-80">play_circle</span>
                </div>
              </div>

              {/* Download Options */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-on-surface line-clamp-2">{result.title || 'Facebook Video'}</h3>
                
                <div className="flex flex-col gap-3">
                  {result.hd && (
                    <a
                      href={`/api/download?url=${encodeURIComponent(result.hd)}&filename=facebook_hd_${Date.now()}.mp4`}
                      className="flex items-center justify-between p-4 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-xl transition-colors group"
                    >
                      <div className="flex items-center gap-3 text-primary">
                        <span className="material-symbols-outlined">hd</span>
                        <span className="font-bold">Download HD Quality</span>
                      </div>
                      <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">download</span>
                    </a>
                  )}
                  {result.sd && (
                    <a
                      href={`/api/download?url=${encodeURIComponent(result.sd)}&filename=facebook_sd_${Date.now()}.mp4`}
                      className="flex items-center justify-between p-4 bg-surface-container-highest hover:bg-surface-container-high border border-outline-variant/30 rounded-xl transition-colors group"
                    >
                      <div className="flex items-center gap-3 text-on-surface">
                        <span className="material-symbols-outlined">sd</span>
                        <span className="font-bold">Download SD Quality</span>
                      </div>
                      <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">download</span>
                    </a>
                  )}
                </div>
                
                <p className="text-xs text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">info</span>
                  Right-click and select &quot;Save link as...&quot; if the video plays instead of downloading.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
