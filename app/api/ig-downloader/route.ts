import { NextResponse } from 'next/server';
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

// ── ২. GET: Proxy Downloader ───────────────────────────────────────────────────
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const proxyUrl = searchParams.get('proxyUrl');
  const filename = searchParams.get('filename') || 'QalbeTalks_IG';
  const ext = searchParams.get('ext') || 'mp4';

  if (!proxyUrl) return NextResponse.json({ error: 'Proxy URL missing' }, { status: 400, headers: CORS });

  try {
    const upstream = await fetch(proxyUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
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

// ── ৩. POST: Smart Media Fetcher (Array/Object Fix + Fallback) ────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { url } = body as { url?: string };

    if (!url || !url.includes('instagram.com')) {
      return NextResponse.json({ success: false, error: 'Valid Instagram URL required' }, { status: 400, headers: CORS });
    }

    let formats: any[] = [];
    let thumbnail = 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=600&auto=format&fit=crop';

    // === পদ্ধতি ১: Nayan Media Downloader (Array vs Object Fix) ===
    try {
        const result = await instagram(url);
        if (result && result.data) {
            // যদি ডাটা Object হয়, তবে তাকে Array তে কনভার্ট করে নেব
            const dataArray = Array.isArray(result.data) ? result.data : [result.data];

            formats = dataArray.map((item: any) => {
                const mediaUrl = item.url || item.video || item.image || item.hd;
                if (!mediaUrl) return null;

                const isVideo = mediaUrl.includes('.mp4') || item.type === 'video' || !!item.video;
                return {
                    quality: isVideo ? 'HD Video MP4' : 'High Res Image JPG',
                    ext: isVideo ? 'mp4' : 'jpg',
                    url: mediaUrl
                };
            }).filter(Boolean); // null ভ্যালুগুলো রিমুভ করা
        }
    } catch (e: any) {
        console.log("Nayan Package Failed:", e.message);
    }

    // === পদ্ধতি ২: Fallback API (যদি প্যাকেজ Vercel এ ব্লক খায়) ===
    if (formats.length === 0) {
        try {
            console.log("Using Fallback API...");
            // একটি ফ্রি এবং শক্তিশালী পাবলিক এপিআই ব্যবহার
            const fallbackRes = await fetch(`https://api.vkrdownloader.co.in/api?vkr=${encodeURIComponent(url)}`);
            const fallbackData = await fallbackRes.json();

            if (fallbackData && fallbackData.data && fallbackData.data.downloads) {
                formats = fallbackData.data.downloads.map((item: any) => ({
                    quality: 'HD Video/Image',
                    ext: item.url.includes('.mp4') ? 'mp4' : 'jpg',
                    url: item.url
                }));
            }
        } catch (e: any) {
            console.log("Fallback API Failed:", e.message);
        }
    }

    // যদি দুটি পদ্ধতিই ফেইল করে
    if (formats.length === 0) {
        throw new Error('All scraping methods failed. Post might be strictly private.');
    }

    const mediaInfo = {
      title: 'Instagram Reels / Media',
      thumbnail: thumbnail,
      formats: formats
    };

    return NextResponse.json({ success: true, data: mediaInfo }, { status: 200, headers: CORS });

  } catch (err: any) {
    console.error('[IG Fatal Error]:', err.message);
    return NextResponse.json(
      { success: false, error: 'মিডিয়া পাওয়া যায়নি। লিংকটি সঠিক বা পাবলিক কিনা চেক করুন।', details: err.message },
      { status: 500, headers: CORS }
    );
  }
}
