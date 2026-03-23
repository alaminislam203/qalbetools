import { NextResponse } from 'next/server';
const { youtube } = require('ab-downloader');

// VERCEL TIMEOUT FIX: সার্ভারকে ৬০ সেকেন্ড পর্যন্ত অপেক্ষা করার নির্দেশ
export const maxDuration = 60; 

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
  const filename = searchParams.get('filename') || 'QalbeTalks_YouTube';
  const ext = searchParams.get('ext') || 'mp4';
  
  if (!proxyUrl) return NextResponse.json({ error: 'Proxy URL missing' }, { status: 400, headers: CORS });
  
  try {
    const upstream = await fetch(proxyUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36' },
      signal: AbortSignal.timeout(50000) // ৫০ সেকেন্ড টাইমআউট
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

// ── ৩. POST: YouTube Fetcher (Smart Parser) ──────────────────────────────────
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

    // একটি হেল্পার ফাংশন: যাতে কোনো প্যাকেজ আটকে গেলে টাইমআউট হয়
    const fetchTimeout = (promise: any, ms: number) => {
        return Promise.race([
            promise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout exceeded')), ms))
        ]);
    };

    // === ইঞ্জিন ১: AB-Downloader (আপনার দেওয়া লজিক অনুযায়ী) ===
    try {
        console.log("YT Engine 1: Trying AB-Downloader...");
        
        // await ব্যবহার করে আপনার দেওয়া লজিকটি রান করা হলো
        const data: any = await fetchTimeout(youtube(url), 15000); 
        console.log('✅ YouTube data received from AB:', data); // ডিবাগিং

        if (data) {
            title = data.title || title;
            thumbnail = data.thumbnail || thumbnail;
            
            // ডাটা স্ট্রাকচার যেভাবেই আসুক, খুঁজে বের করার লজিক
            const vids = data.video || data.url || data.hd || (data.data && data.data.video);
            const auds = data.audio || (data.data && data.data.audio);

            // ভিডিও প্রসেসিং
            if (Array.isArray(vids)) {
                vids.forEach((vid: any, i: number) => {
                    formats.push({ quality: vid.quality || `Video ${i+1}`, ext: 'mp4', url: vid.url || vid.hd || vid.sd || vid });
                });
            } else if (typeof vids === 'string') {
                formats.push({ quality: 'HD Video MP4', ext: 'mp4', url: vids });
            } else if (typeof vids === 'object' && vids.hd) {
                formats.push({ quality: 'HD Video MP4', ext: 'mp4', url: vids.hd });
                if (vids.sd) formats.push({ quality: 'SD Video MP4', ext: 'mp4', url: vids.sd });
            }

            // অডিও প্রসেসিং
            if (Array.isArray(auds)) {
                auds.forEach((aud: any) => formats.push({ quality: 'Audio MP3', ext: 'mp3', url: aud.url || aud }));
            } else if (typeof auds === 'string') {
                formats.push({ quality: 'Audio MP3', ext: 'mp3', url: auds });
            }
        }
    } catch (e: any) { 
        console.log("❌ YT Engine 1 Failed:", e.message); 
    }

    // === ইঞ্জিন ২: VKR API (Fallback) ===
    if (formats.length === 0) {
        try {
            console.log("YT Engine 2: Trying VKR Fallback...");
            const res: any = await fetchTimeout(fetch(`https://api.vkrdownloader.co.in/api?vkr=${encodeURIComponent(url)}`), 12000);
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

    // === ইঞ্জিন ৩: BK9 API (The Ultimate Backup) ===
    if (formats.length === 0) {
        try {
            console.log("YT Engine 3: Trying BK9 Fallback...");
            const res: any = await fetchTimeout(fetch(`https://bk9.fun/download/youtube?url=${encodeURIComponent(url)}`), 15000);
            const json3 = await res.json();
            
            if (json3 && json3.status && json3.BK9) {
                title = json3.BK9.title || title;
                thumbnail = json3.BK9.thumb || thumbnail;
                if(json3.BK9.vid) formats.push({ quality: 'HD Video MP4', ext: 'mp4', url: json3.BK9.vid });
                if(json3.BK9.aud) formats.push({ quality: 'Audio MP3', ext: 'mp3', url: json3.BK9.aud });
            }
        } catch (e: any) { console.log("YT Engine 3 Failed:", e.message); }
    }

    if (formats.length === 0) throw new Error('Could not fetch YouTube data. The video might be restricted or age-gated.');

    // ডুপ্লিকেট লিঙ্ক ফিল্টার করা
    const uniqueFormats = Array.from(new Map(formats.map(item => [item.url, item])).values());

    return NextResponse.json({ success: true, data: { title, thumbnail, formats: uniqueFormats } }, { status: 200, headers: CORS });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'ভিডিও পাওয়া যায়নি। লিংকটি চেক করুন।', details: err.message }, { status: 500, headers: CORS });
  }
}
