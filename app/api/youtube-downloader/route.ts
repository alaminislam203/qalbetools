import { NextResponse } from 'next/server';
const { youtube } = require('ab-downloader');

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() { return new NextResponse(null, { status: 200, headers: CORS }); }

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const proxyUrl = searchParams.get('proxyUrl');
  const filename = searchParams.get('filename') || 'QalbeTalks_YouTube';
  const ext = searchParams.get('ext') || 'mp4';
  
  if (!proxyUrl) return NextResponse.json({ error: 'Proxy URL missing' }, { status: 400, headers: CORS });
  
  try {
    const upstream = await fetch(proxyUrl, { signal: AbortSignal.timeout(60000) });
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

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { url } = body as { url?: string };

    if (!url || (!url.includes('youtube.com') && !url.includes('youtu.be'))) {
      return NextResponse.json({ success: false, error: 'Valid YouTube URL required' }, { status: 400, headers: CORS });
    }

    let formats: any[] = [];
    let title = 'YouTube Video';
    let thumbnail = 'https://images.unsplash.com/photo-1611162618758-6a4fd40becd8?q=80&w=600&auto=format&fit=crop';

    // === ইঞ্জিন ১: AB-Downloader (Multi-Resolution) ===
    try {
        const result = await youtube(url);
        if (result && result.data) {
            title = result.title || title;
            thumbnail = result.thumbnail || thumbnail;
            
            // যদি প্যাকেজটি অ্যারে (Array) আকারে একাধিক কোয়ালিটি দেয়
            if (Array.isArray(result.data.video)) {
                result.data.video.forEach((vid: any, index: number) => {
                    formats.push({ 
                        quality: vid.quality || `Video Quality ${index + 1}`, 
                        ext: 'mp4', 
                        url: vid.url || vid 
                    });
                });
            } else if (typeof result.data.video === 'string') {
                formats.push({ quality: 'HD Video', ext: 'mp4', url: result.data.video });
            }

            // অডিও (MP3) বের করা
            if (Array.isArray(result.data.audio)) {
                result.data.audio.forEach((aud: any) => {
                    formats.push({ quality: 'Audio MP3', ext: 'mp3', url: aud.url || aud });
                });
            } else if (typeof result.data.audio === 'string') {
                formats.push({ quality: 'High Quality Audio', ext: 'mp3', url: result.data.audio });
            }
        }
    } catch (e: any) { console.log("YT Engine 1 Failed:", e.message); }

    // === ইঞ্জিন ২: Fallback Public API (Multi-Resolution) ===
    if (formats.length === 0) {
        try {
            console.log("Using YouTube Fallback API...");
            const res2 = await fetch(`https://api.vkrdownloader.co.in/api?vkr=${encodeURIComponent(url)}`);
            const json2 = await res2.json();
            
            if (json2.data && json2.data.downloads) {
                title = json2.data.title || title;
                thumbnail = json2.data.thumbnail || thumbnail;
                
                json2.data.downloads.forEach((dl: any) => {
                    const isAudio = dl.url.includes('.mp3') || dl.quality?.toLowerCase().includes('audio') || dl.ext === 'mp3';
                    formats.push({
                        quality: dl.quality || (isAudio ? 'Audio MP3' : 'Video MP4'),
                        ext: isAudio ? 'mp3' : 'mp4',
                        url: dl.url
                    });
                });
            }
        } catch (e: any) { console.log("YT Engine 2 Failed:", e.message); }
    }

    if (formats.length === 0) throw new Error('Could not fetch YouTube data. The video might be restricted or age-gated.');

    // ডুপ্লিকেট লিঙ্ক ফিল্টার করা
    const uniqueFormats = Array.from(new Map(formats.map(item => [item.url, item])).values());

    return NextResponse.json({ success: true, data: { title, thumbnail, formats: uniqueFormats } }, { status: 200, headers: CORS });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'ভিডিও পাওয়া যায়নি। লিংকটি চেক করুন।', details: err.message }, { status: 500, headers: CORS });
  }
}
