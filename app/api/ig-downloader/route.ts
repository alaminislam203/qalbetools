import { NextResponse } from 'next/server';
// আগের ভুল লাইনটি মুছে এটি দিন (শেষে s আছে)
import { instagram } from 'nayan-media-downloaders';

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

// ── ৩. POST: Media Fetcher (আপনার দেওয়া লজিক) ─────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { url } = body as { url?: string };

    if (!url || !url.includes('instagram.com')) {
      return NextResponse.json({ success: false, error: 'Valid Instagram URL required' }, { status: 400, headers: CORS });
    }

    // আপনার দেওয়া ডকুমেন্টেশন অনুযায়ী instagram() কল করা হলো
    const result = await instagram(url);

    // Vercel লগে ডাটা চেক করার জন্য (ডিবাগিং)
    console.log("IG Package Result:", result);

    if (!result || !result.data || result.data.length === 0) {
       throw new Error('No media found or post is private');
    }

    // ডাটাগুলোকে ফ্রন্টএন্ডের জন্য সুন্দরভাবে সাজানো
    const formats = result.data.map((item: any) => {
        // প্যাকেজটি সাধারণত url বা video প্রোপার্টিতে লিংক দেয়
        const mediaUrl = item.url || item.video || item.image; 
        const isVideo = mediaUrl.includes('.mp4') || item.type === 'video';
        
        return {
            quality: isVideo ? 'HD Video MP4' : 'High Res Image JPG',
            ext: isVideo ? 'mp4' : 'jpg',
            url: mediaUrl
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
