import { NextResponse } from 'next/server';
import { ndown } from 'nayan-media-downloader';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// ── ১. CORS প্রিফ্লাইট ─────────────────────────────────────────────────────────
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS });
}

// ── ২. GET: Proxy Downloader (সরাসরি ডাউনলোড এবং CORS বাইপাস) ─────────────────
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const proxyUrl = searchParams.get('proxyUrl');
  const filename = searchParams.get('filename') || 'QalbeTalks_IG';
  const ext = searchParams.get('ext') || 'mp4';

  if (!proxyUrl) {
    return NextResponse.json({ error: 'Proxy URL missing' }, { status: 400, headers: CORS });
  }

  try {
    const upstream = await fetch(proxyUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.instagram.com/',
        'Accept': '*/*'
      },
      signal: AbortSignal.timeout(60000), // 60 সেকেন্ড টাইমআউট
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

// ── ৩. POST: Media Fetcher (ভিডিও/ছবির লিংক বের করা) ──────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { url } = body as { url?: string };

    if (!url || !url.includes('instagram.com')) {
      return NextResponse.json({ success: false, error: 'Valid Instagram URL required' }, { status: 400, headers: CORS });
    }

    // Nayan Media Downloader দিয়ে ভিডিও ফেচ (এটি Vercel IP-তে ব্লক খায় না)
    const result = await ndown(url);

    if (!result.status || !result.data || result.data.length === 0) {
       throw new Error('No media found or post is private');
    }

    // ফ্রন্টএন্ডের জন্য ডাটা ফরম্যাটিং
    const formats = result.data.map((item: any, i: number) => {
        const isVideo = item.url.includes('.mp4');
        return {
            quality: isVideo ? 'HD Video MP4' : 'High Res Image JPG',
            ext: isVideo ? 'mp4' : 'jpg',
            url: item.url
        };
    });

    const mediaInfo = {
      title: 'Instagram Media',
      thumbnail: result.data[0]?.thumbnail || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=600&auto=format&fit=crop',
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
