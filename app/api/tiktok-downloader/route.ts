import { NextResponse, NextRequest } from 'next/server';
const { ttdl } = require('ab-downloader');
import { validateApiToken } from '@/lib/api-auth';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-token',
};

export async function OPTIONS() { return new NextResponse(null, { status: 200, headers: CORS }); }

export async function GET(req: Request) {
  // প্রক্সি ডাউনলোডার লজিক (আগের মতোই)
  const { searchParams } = new URL(req.url);
  const proxyUrl = searchParams.get('proxyUrl');
  const filename = searchParams.get('filename') || 'QalbeTalks_TikTok';
  const ext = searchParams.get('ext') || 'mp4';
  if (!proxyUrl) return NextResponse.json({ error: 'Proxy URL missing' }, { status: 400, headers: CORS });
  try {
    const upstream = await fetch(proxyUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36', 'Referer': 'https://www.tiktok.com/' },
      signal: AbortSignal.timeout(60000), 
    });
    if (!upstream.ok) throw new Error('CDN fetch failed');
    return new NextResponse(upstream.body, { status: 200, headers: { ...CORS, 'Content-Type': upstream.headers.get('content-type') || 'application/octet-stream', 'Content-Disposition': `attachment; filename="${filename}.${ext}"` } });
  } catch (error) { return NextResponse.json({ error: 'Proxy failed' }, { status: 500, headers: CORS }); }
}

export async function POST(req: NextRequest) {
  // ── Pro Authentication ──────────────────────────────────────────────
  const auth = await validateApiToken(req);
  if (!auth.success) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401, headers: CORS });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { url } = body as { url?: string };

    if (!url || (!url.includes('tiktok.com') && !url.includes('douyin.com'))) {
      return NextResponse.json({ success: false, error: 'Valid TikTok URL required' }, { status: 400, headers: CORS });
    }

    let formats: any[] = [];
    let thumbnail = 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?q=80&w=600&auto=format&fit=crop';
    let title = 'TikTok Video';

    // === ইঞ্জিন ১: AB-Downloader ===
    try {
        const result = await ttdl(url);
        const data = Array.isArray(result) ? result[0] : result;
        if (data && (data.video || data.audio)) {
            if (data.video && data.video.length > 0) formats.push({ quality: 'HD Video (No Watermark)', ext: 'mp4', url: data.video[0] });
            if (data.audio && data.audio.length > 0) formats.push({ quality: 'Original Audio', ext: 'mp3', url: data.audio[0] });
            if (data.thumbnail) thumbnail = data.thumbnail;
            if (data.title) title = data.title;
        }
    } catch (e: any) { console.log("TT Engine 1 Failed:", e.message); }

    // === ইঞ্জিন ২: TikWM API (Super Fallback) ===
    if (formats.length === 0) {
        try {
            console.log("Switching to TikWM Fallback...");
            const res2 = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
            const json2 = await res2.json();
            if (json2.data) {
                if (json2.data.play) formats.push({ quality: 'HD Video (No Watermark)', ext: 'mp4', url: json2.data.play });
                if (json2.data.music) formats.push({ quality: 'Original Audio', ext: 'mp3', url: json2.data.music });
                if (json2.data.cover) thumbnail = json2.data.cover;
                if (json2.data.title) title = json2.data.title;
            }
        } catch (e: any) { console.log("TT Engine 2 Failed:", e.message); }
    }

    if (formats.length === 0) throw new Error('All engines failed.');

    return NextResponse.json({ success: true, data: { title, thumbnail, formats } }, { status: 200, headers: CORS });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'ভিডিও পাওয়া যায়নি। লিংকটি সঠিক কিনা চেক করুন।', details: err.message }, { status: 500, headers: CORS });
  }
}
