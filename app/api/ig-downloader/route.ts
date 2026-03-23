import { NextResponse } from 'next/server';
const { igdl } = require('ab-downloader'); // নতুন প্যাকেজ ইমপোর্ট

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// ── ১. CORS প্রিফ্লাইট ─────────────────────────────────────────────────────────
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS });
}

// ── ২. GET: Proxy Downloader (সরাসরি ডাউনলোডের জন্য) ─────────────────────────
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const proxyUrl = searchParams.get('proxyUrl');
  const filename = searchParams.get('filename') || 'QalbeTalks_IG';
  const ext = searchParams.get('ext') || 'mp4';

  if (!proxyUrl) return NextResponse.json({ error: 'Proxy URL missing' }, { status: 400, headers: CORS });

  try {
    const upstream = await fetch(proxyUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.instagram.com/',
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

// ── ৩. POST: Media Fetcher (AB-DOWNLOADER ব্যবহার করে) ────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { url } = body as { url?: string };

    if (!url || !url.includes('instagram.com')) {
      return NextResponse.json({ success: false, error: 'Valid Instagram URL required' }, { status: 400, headers: CORS });
    }

    // ab-downloader এর igdl ফাংশন কল করা হলো
    const result = await igdl(url);
    console.log("AB-Downloader IG Result:", result); // ডিবাগিংয়ের জন্য

    if (!result || !Array.isArray(result) || result.length === 0) {
       throw new Error('No media found or post is private');
    }

    // ডাটাগুলোকে ফ্রন্টএন্ডের জন্য সাজানো
    const formats = result.map((item: any, index: number) => {
        const mediaUrl = item.url;
        // লিংকে .mp4 থাকলে ভিডিও, নাহলে ছবি
        const isVideo = mediaUrl && mediaUrl.includes('.mp4');
        
        return {
            quality: isVideo ? 'HD Video MP4' : 'High Res Image JPG',
            ext: isVideo ? 'mp4' : 'jpg',
            url: mediaUrl
        };
    }).filter((f: any) => f.url); // যাদের URL নেই তাদের বাদ দেওয়া

    if (formats.length === 0) {
        throw new Error('Valid download links not found.');
    }

    const mediaInfo = {
      title: 'Instagram Post / Reels',
      thumbnail: result[0]?.thumbnail || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=600&auto=format&fit=crop',
      formats: formats
    };

    return NextResponse.json({ success: true, data: mediaInfo }, { status: 200, headers: CORS });

  } catch (err: any) {
    console.error('[IG Fetch Error]:', err.message);
    return NextResponse.json(
      { success: false, error: 'মিডিয়া পাওয়া যায়নি। লিংকটি সঠিক কিনা চেক করুন।', details: err.message },
      { status: 500, headers: CORS }
    );
  }
}
