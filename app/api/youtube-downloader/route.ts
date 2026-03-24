import { NextResponse } from 'next/server';

export const maxDuration = 60; // Vercel Timeout Fix (60 Seconds)

const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
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

// ── ৩. POST: YouTube Fetcher (API-only Fallbacks — No binary required) ─────────
export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));
        const { url } = body as { url?: string };

        if (!url || (!url.includes('youtube.com') && !url.includes('youtu.be'))) {
            return NextResponse.json({ success: false, error: 'Valid YouTube URL required' }, { status: 400, headers: CORS });
        }

        // প্লেলিস্ট লিঙ্ক থেকে শুধু আসল ভিডিও লিঙ্ক বের করা
        let cleanUrl = url;
        let videoId = '';
        try {
            const urlObj = new URL(url);
            if (url.includes('youtu.be/')) {
                videoId = urlObj.pathname.substring(1);
                cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;
            } else {
                const v = urlObj.searchParams.get('v');
                if (v) {
                    videoId = v;
                    cleanUrl = `https://www.youtube.com/watch?v=${v}`;
                } else {
                    cleanUrl = url.split('?')[0];
                }
            }
        } catch (e) { }

        let formats: any[] = [];
        let title = 'YouTube Video';
        let thumbnail = videoId
            ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
            : 'https://images.unsplash.com/photo-1611162618758-6a4fd40becd8?q=80&w=600&auto=format&fit=crop';
        let errorDetails: string[] = [];

        // === ইঞ্জিন ১: YouTube oEmbed (title + thumbnail — no binary needed) ===
        try {
            console.log("YT Engine 1: Trying oEmbed...");
            const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(cleanUrl)}&format=json`, { headers: HEADERS });
            const oembed = await res.json();
            if (oembed && oembed.title) {
                title = oembed.title;
                thumbnail = oembed.thumbnail_url || thumbnail;
            }
        } catch (e: any) {
            console.log("YT Engine 1 (oEmbed) Failed:", e.message);
            errorDetails.push(`Engine 1: ${e.message}`);
        }

        // === ইঞ্জিন ২: VKR API (Fallback) ===
        if (formats.length === 0) {
            try {
                console.log("YT Engine 2: Trying VKR Fallback...");
                const res = await fetch(`https://api.vkrdownloader.co.in/api?vkr=${encodeURIComponent(cleanUrl)}`, { headers: HEADERS });
                const json2 = await res.json();

                if (json2.data && json2.data.downloads) {
                    title = json2.data.title || title;
                    thumbnail = json2.data.thumbnail || thumbnail;
                    json2.data.downloads.forEach((dl: any) => {
                        const isAudio = dl.url.includes('.mp3') || dl.quality?.toLowerCase().includes('audio') || dl.ext === 'mp3';
                        formats.push({ quality: dl.quality || (isAudio ? 'Audio MP3' : 'Video MP4'), ext: isAudio ? 'mp3' : 'mp4', url: dl.url });
                    });
                } else {
                    errorDetails.push("Engine 2: No download data found");
                }
            } catch (e: any) { 
                console.log("YT Engine 2 Failed:", e.message); 
                errorDetails.push(`Engine 2: ${e.message}`);
            }
        }

        // === ইঞ্জিন ৩: BK9 API (Ultimate Backup) ===
        if (formats.length === 0) {
            try {
                console.log("YT Engine 3: Trying BK9 Fallback...");
                const res = await fetch(`https://bk9.fun/download/youtube?url=${encodeURIComponent(url)}`, { headers: HEADERS }); // Use original URL for BK9
                const json3 = await res.json();

                if (json3 && json3.status && json3.BK9) {
                    title = json3.BK9.title || title;
                    thumbnail = json3.BK9.thumb || thumbnail;
                    if (json3.BK9.vid) formats.push({ quality: 'HD Video MP4', ext: 'mp4', url: json3.BK9.vid });
                    if (json3.BK9.aud) formats.push({ quality: 'Audio MP3', ext: 'mp3', url: json3.BK9.aud });
                } else {
                    errorDetails.push("Engine 3: BK9 status failed or data missing");
                }
            } catch (e: any) { 
                console.log("YT Engine 3 Failed:", e.message); 
                errorDetails.push(`Engine 3: ${e.message}`);
            }
        }

        // === ইঞ্জিন ৪: GoAPI (Final Fallback) ===
        if (formats.length === 0) {
            try {
                console.log("YT Engine 4: Trying GoAPI Fallback...");
                const res = await fetch(`https://api.goapi.xyz/google/youtube?url=${encodeURIComponent(cleanUrl)}`, { headers: HEADERS });
                const json4 = await res.json();

                if (json4 && json4.data) {
                    title = json4.data.title || title;
                    thumbnail = json4.data.thumbnail || thumbnail;
                    if (json4.data.formats) {
                        json4.data.formats.forEach((f: any) => {
                            formats.push({ quality: f.quality || 'HD Video', ext: f.ext || 'mp4', url: f.url });
                        });
                    }
                } else {
                    errorDetails.push("Engine 4: GoAPI missing data");
                }
            } catch (e: any) {
                console.log("YT Engine 4 Failed:", e.message);
                errorDetails.push(`Engine 4: ${e.message}`);
            }
        }

        if (formats.length === 0) {
            throw new Error(`Could not fetch data from any engine. ${errorDetails.join(' | ')}`);
        }

        // ডুপ্লিকেট লিঙ্ক ফিল্টার করা
        const uniqueFormats = Array.from(new Map(formats.map(item => [item.url, item])).values());

        return NextResponse.json({ success: true, data: { title, thumbnail, formats: uniqueFormats } }, { status: 200, headers: CORS });

    } catch (err: any) {
        return NextResponse.json({ success: false, error: 'ভিডিও পাওয়া যায়নি। লিংকটি চেক করুন।', details: err.message }, { status: 500, headers: CORS });
    }
}