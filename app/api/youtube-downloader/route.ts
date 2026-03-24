import { NextResponse } from 'next/server';
import ytdl from '@distube/ytdl-core';

export const maxDuration = 60; // Vercel Timeout Fix

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// ── ১. CORS প্রিফ্লাইট ─────────────────────────────────────────────────────────
export async function OPTIONS() { return new NextResponse(null, { status: 200, headers: CORS }); }

// ── ২. GET: Proxy Downloader ───────────────────────────────────────────────────
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const proxyUrl = searchParams.get('proxyUrl');
  const filename = searchParams.get('filename') || 'QalbeTalks_YT';
  const ext = searchParams.get('ext') || 'mp4';
  
  if (!proxyUrl) return NextResponse.json({ error: 'Proxy URL missing' }, { status: 400, headers: CORS });
  
  try {
    const upstream = await fetch(proxyUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36' },
      signal: AbortSignal.timeout(50000) 
    });
    return new NextResponse(upstream.body, { 
        status: 200, 
        headers: { 
            ...CORS, 
            'Content-Type': upstream.headers.get('content-type') || 'application/octet-stream', 
            'Content-Disposition': `attachment; filename="${filename}.${ext}"` 
        } 
    });
  } catch (error) { return NextResponse.json({ error: 'Proxy failed' }, { status: 500, headers: CORS }); }
}

// ── ৩. POST: YouTube Fetcher (Pure JS + Smart Cleaner) ────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { url } = body as { url?: string };

    if (!url || (!url.includes('youtube.com') && !url.includes('youtu.be'))) {
      return NextResponse.json({ success: false, error: 'Valid YouTube URL required' }, { status: 400, headers: CORS });
    }

    // 🔥 URL Cleaner: প্লেলিস্ট লিঙ্ক থেকে শুধু আসল ভিডিও লিঙ্ক বের করে আনা
    let cleanUrl = url;
    try {
        const urlObj = new URL(url);
        const vParams = urlObj.searchParams.get('v');
        if (vParams) cleanUrl = `https://www.youtube.com/watch?v=${vParams}`;
        else cleanUrl = url.split('?')[0]; 
    } catch(e) {}

    let formats: any[] = [];
    let title = 'YouTube Video';
    let thumbnail = 'https://images.unsplash.com/photo-1611162618758-6a4fd40becd8?q=80&w=600&auto=format&fit=crop';

    const fetchTimeout = (promise: any, ms: number) => {
        return Promise.race([
            promise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout exceeded')), ms))
        ]);
    };

    // === ইঞ্জিন ১: @distube/ytdl-core (No Binary Needed) ===
    try {
        console.log("YT Engine 1: Fetching...", cleanUrl);
        const info: any = await fetchTimeout(ytdl.getInfo(cleanUrl), 15000);
        
        if (info && info.videoDetails) {
            title = info.videoDetails.title || title;
            const thumbs = info.videoDetails.thumbnails;
            if (thumbs && thumbs.length > 0) thumbnail = thumbs[thumbs.length - 1].url;

            // ভিডিও + অডিও একসাথে আছে এমন লিঙ্ক
            const videoAudioFormats = ytdl.filterFormats(info.formats, 'videoandaudio');
            videoAudioFormats.forEach(f => formats.push({ quality: (f.qualityLabel || 'HD') + ' Video', ext: 'mp4', url: f.url }));

            // শুধুমাত্র অডিও লিঙ্ক (MP3)
            const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
            if (audioFormats.length > 0) formats.push({ quality: 'High Quality Audio', ext: 'mp3', url: audioFormats[0].url });
        }
    } catch (e: any) { console.log("YT Engine 1 Failed (Vercel IP might be blocked):", e.message); }

    // === ইঞ্জিন ২: VKR API (Fallback) ===
    if (formats.length === 0) {
        try {
            console.log("YT Engine 2: Trying VKR Fallback...");
            const res: any = await fetchTimeout(fetch(`https://api.vkrdownloader.co.in/api?vkr=${encodeURIComponent(cleanUrl)}`), 12000);
            const json2 = await res.json();
            
            if (json2.data && json2.data.downloads) {
                title = json2.data.title || title;
                thumbnail = json2.data.thumbnail || thumbnail;
                json2.data.downloads.forEach((dl: any) => {
                    const isAudio = dl.url.includes('.mp3') || dl.quality?.toLowerCase().includes('audio') || dl.ext === 'mp3';
                    formats.push({ quality: dl.quality || (isAudio ? 'Audio MP3' : 'Video MP4'), ext: isAudio ? 'mp3' : 'mp4', url: dl.url });
                });
            }
        } catch (e: any) { console.log("YT Engine 2 Failed:", e.message); }
    }

    if (formats.length === 0) throw new Error('All scraping engines failed. The video might be restricted or age-gated.');

    // ডুপ্লিকেট লিঙ্ক ফিল্টার করা
    const uniqueFormats = Array.from(new Map(formats.map(item => [item.url, item])).values());

    return NextResponse.json({ success: true, data: { title, thumbnail, formats: uniqueFormats } }, { status: 200, headers: CORS });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'ভিডিও পাওয়া যায়নি। লিংকটি চেক করুন।', details: err.message }, { status: 500, headers: CORS });
  }
}