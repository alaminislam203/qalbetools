import { NextResponse } from 'next/server';
const { igdl } = require('ab-downloader');

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

// ── ৩. POST: Media Fetcher (Triple Engine) ────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { url } = body as { url?: string };

    if (!url || !url.includes('instagram.com')) {
      return NextResponse.json({ success: false, error: 'Valid Instagram URL required' }, { status: 400, headers: CORS });
    }

    let formats: any[] = [];
    
    // Smart Checker: ইউজার কি রিলস/ভিডিও এর লিঙ্ক দিয়েছে?
    const isReel = url.includes('/reel/') || url.includes('/reels/') || url.includes('/tv/');

    // === ইঞ্জিন ১: AB-Downloader (Primary) ===
    try {
        const result = await igdl(url);
        if (result && Array.isArray(result)) {
            formats = result.map((item: any) => {
                const mediaUrl = item.url;
                // যদি লিংকে .mp4 থাকে, অথবা ইউজার রিলসের লিংক দেয়, তবে সেটি ১০০% ভিডিও
                const isVideo = (mediaUrl && mediaUrl.includes('.mp4')) || isReel;
                
                return {
                    quality: isVideo ? 'HD Video MP4' : 'High Res Image JPG',
                    ext: isVideo ? 'mp4' : 'jpg',
                    url: mediaUrl
                };
            }).filter(f => f.url);
        }
    } catch (e: any) {
        console.log("Engine 1 (AB) Failed:", e.message);
    }

    // ভ্যালিডেশন: যদি রিলসের লিংক হয়, কিন্তু আমরা শুধু Image পাই, তার মানে ইঞ্জিন ১ ভুল ডাটা দিয়েছে!
    const hasVideo = formats.some(f => f.ext === 'mp4');
    if (isReel && !hasVideo) {
        console.log("Only image found for a Reel. Discarding and switching to Fallback API...");
        formats = []; // ভুল ডাটা ক্লিয়ার করে দিলাম
    }

    // === ইঞ্জিন ২: VKR API (Fallback) ===
    if (formats.length === 0) {
        try {
            const fbRes = await fetch(`https://api.vkrdownloader.co.in/api?vkr=${encodeURIComponent(url)}`);
            const fbData = await fbRes.json();

            if (fbData && fbData.data && fbData.data.downloads) {
                formats = fbData.data.downloads.map((item: any) => ({
                    quality: item.ext === 'mp4' || item.url.includes('.mp4') || isReel ? 'HD Video MP4' : 'High Res Image',
                    ext: item.ext || (item.url.includes('.mp4') || isReel ? 'mp4' : 'jpg'),
                    url: item.url
                }));
            }
        } catch (e: any) {
            console.log("Engine 2 (VKR) Failed:", e.message);
        }
    }

    // === ইঞ্জিন ৩: BK9 API (Ultimate Backup) ===
    if (formats.length === 0) {
        try {
            const bkRes = await fetch(`https://bk9.fun/ig/igdl?url=${encodeURIComponent(url)}`);
            const bkData = await bkRes.json();

            if (bkData && bkData.BK9) {
                formats = bkData.BK9.map((item: any) => ({
                    quality: item.url.includes('.mp4') || isReel ? 'HD Video MP4' : 'High Res Image',
                    ext: item.url.includes('.mp4') || isReel ? 'mp4' : 'jpg',
                    url: item.url
                }));
            }
        } catch (e: any) {
            console.log("Engine 3 (BK9) Failed:", e.message);
        }
    }

    if (formats.length === 0) {
        throw new Error('All scraping engines failed. Post might be strictly private.');
    }

    const mediaInfo = {
      title: 'Instagram Reels / Post',
      thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=600&auto=format&fit=crop',
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
