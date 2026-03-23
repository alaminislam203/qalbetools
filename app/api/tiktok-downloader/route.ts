import { NextResponse } from 'next/server';
const { ttdl } = require('ab-downloader');

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// ── ১. CORS প্রিফ্লাইট ─────────────────────────────────────────────────────────
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS });
}

// ── ২. GET: Proxy Downloader (ডাইরেক্ট ডাউনলোডের জন্য) ─────────────────────────
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const proxyUrl = searchParams.get('proxyUrl');
  const filename = searchParams.get('filename') || 'QalbeTalks_TikTok';
  const ext = searchParams.get('ext') || 'mp4';

  if (!proxyUrl) return NextResponse.json({ error: 'Proxy URL missing' }, { status: 400, headers: CORS });

  try {
    const upstream = await fetch(proxyUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.tiktok.com/',
        'Accept': '*/*'
      },
      signal: AbortSignal.timeout(60000), 
    });

    if (!upstream.ok) throw new Error('CDN fetch failed');
    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';

    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        ...CORS,
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}.${ext}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Proxy failed to fetch media' }, { status: 500, headers: CORS });
  }
}

// ── ৩. POST: TikTok Fetcher (No Watermark) ────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { url } = body as { url?: string };

    if (!url || (!url.includes('tiktok.com') && !url.includes('douyin.com'))) {
      return NextResponse.json({ success: false, error: 'Valid TikTok URL required' }, { status: 400, headers: CORS });
    }

    const result = await ttdl(url);

    if (!result || !Array.isArray(result) || result.length === 0) {
       throw new Error('No media found');
    }

    const data = result[0];
    const formats: any[] = [];

    // ভিডিও লিঙ্ক (No Watermark)
    if (data.video && data.video.length > 0) {
        formats.push({
            quality: 'HD Video (No Watermark)',
            ext: 'mp4',
            url: data.video[0]
        });
    }

    // অডিও লিঙ্ক (MP3)
    if (data.audio && data.audio.length > 0) {
        formats.push({
            quality: 'Original Audio MP3',
            ext: 'mp3',
            url: data.audio[0]
        });
    }

    if (formats.length === 0) throw new Error('Download links not found.');

    const mediaInfo = {
      title: data.title || 'TikTok Video',
      thumbnail: data.thumbnail || 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?q=80&w=600&auto=format&fit=crop',
      formats: formats
    };

    return NextResponse.json({ success: true, data: mediaInfo }, { status: 200, headers: CORS });

  } catch (err: any) {
    console.error('[TikTok Fetch Error]:', err.message);
    return NextResponse.json(
      { success: false, error: 'ভিডিও পাওয়া যায়নি। লিংকটি সঠিক কিনা চেক করুন।', details: err.message },
      { status: 500, headers: CORS }
    );
  }
}
