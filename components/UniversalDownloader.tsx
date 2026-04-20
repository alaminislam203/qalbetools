'use client';

import { useState } from 'react';

interface UniversalDownloaderProps {
  serviceName: string;
  apiEndpoint: string;
  placeholder: string;
  accentColor: string; // Tailwind class like 'primary' or 'secondary'
  icon: string;
}

export default function UniversalDownloader({
  serviceName,
  apiEndpoint,
  placeholder,
  accentColor,
  icon
}: UniversalDownloaderProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch data');
      }

      // Handle both single object and array responses
      const resultsArray = Array.isArray(data.data) ? data.data : [data.data];
      setResults(resultsArray);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-20 w-full max-w-5xl mx-auto p-8 bg-surface-container-lowest rounded-2xl ambient-shadow glass-edge border border-outline-variant/20">
      <div className="flex flex-col gap-8">
        <div className="text-center">
          <div className={`w-16 h-16 bg-${accentColor}/10 rounded-2xl flex items-center justify-center mx-auto mb-4`}>
            <span className={`material-symbols-outlined text-${accentColor} text-4xl`}>{icon}</span>
          </div>
          <h2 className="text-3xl font-headline font-bold text-on-surface mb-2">{serviceName} Downloader</h2>
          <p className="text-on-surface-variant">Paste your {serviceName} link below to grab the media instantly.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder={placeholder}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-grow bg-surface-container-low border border-outline-variant/30 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface placeholder:text-outline/50 transition-all font-medium"
          />
          <button
            onClick={handleDownload}
            disabled={loading}
            className={`bg-${accentColor} text-on-primary px-10 py-4 rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[160px] ambient-shadow`}
          >
            {loading ? (
              <>
                <span className="animate-spin material-symbols-outlined">progress_activity</span>
                <span>Fetching...</span>
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
          <div className="p-4 bg-error-container text-on-error-container rounded-xl flex items-center gap-3 animate-in fade-in zoom-in duration-300">
            <span className="material-symbols-outlined text-error">error</span>
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {results.map((item, index) => (
              <div key={index} className="bg-surface-container-low rounded-2xl overflow-hidden border border-outline-variant/20 flex flex-col h-full group">
                <div className="relative aspect-square bg-surface-container-highest overflow-hidden">
                  <img
                    src={item.thumbnail || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=1000&auto=format&fit=crop'}
                    alt={`Content ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                    {item.type || 'Media'}
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-grow gap-4">
                  <div className="flex-grow">
                    <p className="text-xs font-mono text-on-surface-variant uppercase tracking-widest mb-1">Source: {serviceName}</p>
                    <h4 className="font-bold text-on-surface line-clamp-1">{item.title || `${serviceName} Content`}</h4>
                  </div>
                  {(() => {
                    const ext = item.type === 'image' ? 'jpg' : 'mp4';
                    const downloadUrl = `/api/download?url=${encodeURIComponent(item.url || item.hd || item.sd)}&filename=${serviceName.toLowerCase()}_${index + 1}_${Date.now()}.${ext}`;
                    return (
                      <a
                        href={downloadUrl}
                        className={`w-full py-3 bg-${accentColor}/10 hover:bg-${accentColor} text-${accentColor} hover:text-on-primary rounded-xl font-bold flex items-center justify-center gap-2 transition-all transition-colors border border-${accentColor}/20`}
                      >
                        <span className="material-symbols-outlined text-[20px]">download</span>
                        Download {item.type === 'image' ? 'Image' : 'Video'}
                      </a>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
