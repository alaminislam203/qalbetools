import { NextResponse } from 'next/server';

export const maxDuration = 60;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const UA_BROWSER = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36';
const UA_ANDROID = 'com.google.android.youtube/17.31.35 (Linux; U; Android 11) gzip';

// ── Timeout-safe fetch ────────────────────────────────────────────────────────
async function fetchSafe(url: string, init: RequestInit = {}, ms = 15000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

// ── ১. CORS প্রিফ্লাইট ────────────────────────────────────────────────────────
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS });
}

// ── ২. GET: Proxy Downloader ──────────────────────────────────────────────────
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const proxyUrl = searchParams.get('proxyUrl');
  const filename = searchParams.get('filename') || 'QalbeTalks_YT';
  const ext = searchParams.get('ext') || 'mp4';

  if (!proxyUrl)
    return NextResponse.json({ error: 'Proxy URL missing' }, { status: 400, headers: CORS });

  try {
    const upstream = await fetchSafe(proxyUrl, { headers: { 'User-Agent': UA_BROWSER } }, 50000);
    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        ...CORS,
        'Content-Type': upstream.headers.get('content-type') || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filename}.${ext}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Proxy failed' }, { status: 500, headers: CORS });
  }
}

// ── InnerTube: YouTube-এর নিজস্ব Internal API ────────────────────────────────
async function fetchInnerTube(videoId: string, clientName: string, clientVersion: string, extraContext: Record<string, unknown> = {}) {
  const INNERTUBE_KEY = 'AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8';
  const r = await fetchSafe(
    `https://www.youtube.com/youtubei/v1/player?key=${INNERTUBE_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': clientName === 'ANDROID' ? UA_ANDROID : UA_BROWSER,
        'X-YouTube-Client-Name': clientName === 'ANDROID' ? '3' : '1',
        'X-YouTube-Client-Version': clientVersion,
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': 'https://www.youtube.com',
      },
      body: JSON.stringify({
        videoId,
        context: {
          client: {
            clientName,
            clientVersion,
            hl: 'en',
            gl: 'US',
            ...extraContext,
          },
        },
        params: 'CgIQBg==',
      }),
    },
    18000
  );
  if (!r.ok) throw new Error(`InnerTube HTTP ${r.status}`);
  return r.json();
}

// ── ৩. POST: YouTube Fetcher ──────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { url } = body as { url?: string };

    if (!url || (!url.includes('youtube.com') && !url.includes('youtu.be'))) {
      return NextResponse.json(
        { success: false, error: 'Valid YouTube URL required' },
        { status: 400, headers: CORS }
      );
    }

    // ── URL Cleaning ──────────────────────────────────────────────────────────
    let cleanUrl = url;
    let videoId = '';
    try {
      const urlObj = new URL(url);
      if (url.includes('youtu.be/')) {
        videoId = urlObj.pathname.split('/')[1]?.split('?')[0] || '';
        cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;
      } else {
        const v = urlObj.searchParams.get('v');
        if (v) {
          videoId = v;
          cleanUrl = `https://www.youtube.com/watch?v=${v}`;
        }
      }
    } catch { /* ignore */ }

    if (!videoId) {
      return NextResponse.json(
        { success: false, error: 'YouTube Video ID বের করা সম্ভব হয়নি।' },
        { status: 400, headers: CORS }
      );
    }

    let formats: { quality: string; ext: string; url: string }[] = [];
    let title = 'YouTube Video';
    let thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    const errors: string[] = [];

    // ── Metadata: YouTube oEmbed ──────────────────────────────────────────────
    try {
      const r = await fetchSafe(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(cleanUrl)}&format=json`,
        { headers: { 'User-Agent': UA_BROWSER } },
        8000
      );
      if (r.ok) {
        const d = await r.json();
        if (d.title) title = d.title;
        if (d.thumbnail_url) thumbnail = d.thumbnail_url;
      }
    } catch (e: any) {
      errors.push(`oEmbed: ${e.message}`);
    }

    // ── ইঞ্জিন ১: YouTube InnerTube — ANDROID Client ─────────────────────────
    // YouTube-এর নিজস্ব API, Vercel IP block করতে পারে না
    try {
      console.log('Engine 1: InnerTube ANDROID...');
      const data = await fetchInnerTube(videoId, 'ANDROID', '17.31.35', { androidSdkVersion: 30 });

      if (data.videoDetails) {
        title = data.videoDetails.title || title;
        const thumbs = data.videoDetails.thumbnail?.thumbnails;
        if (thumbs?.length > 0) thumbnail = thumbs[thumbs.length - 1].url || thumbnail;
      }

      if (data.streamingData) {
        // Combined video+audio (360p, 720p) — সরাসরি download যোগ্য
        const combinedFmts: any[] = data.streamingData.formats || [];
        combinedFmts.forEach((f: any) => {
          if (f.url && !f.signatureCipher) {
            const q = f.qualityLabel || f.quality || 'HD';
            formats.push({ quality: `${q} Video`, ext: 'mp4', url: f.url });
          }
        });

        // Audio only — MP4A format (best quality)
        const adaptiveFmts: any[] = data.streamingData.adaptiveFormats || [];
        const audioFmts = adaptiveFmts
          .filter((f: any) => f.mimeType?.startsWith('audio/mp4') && f.url && !f.signatureCipher)
          .sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0));
        
        if (audioFmts.length > 0) {
          formats.push({ quality: 'High Quality Audio', ext: 'mp3', url: audioFmts[0].url });
        }

        console.log(`Engine 1 (ANDROID): ${formats.length} formats, signatureCipher=${combinedFmts.some((f:any) => f.signatureCipher)}`);
      }

      if (data.playabilityStatus?.status === 'ERROR' || data.playabilityStatus?.status === 'UNPLAYABLE') {
        errors.push(`Engine 1: Video is ${data.playabilityStatus.status} - ${data.playabilityStatus.reason || ''}`);
        formats = [];
      }
    } catch (e: any) {
      console.log('Engine 1 (InnerTube ANDROID) Failed:', e.message);
      errors.push(`Engine 1: ${e.message}`);
    }

    // ── ইঞ্জিন ২: YouTube InnerTube — IOS Client ─────────────────────────────
    if (formats.length === 0) {
      try {
        console.log('Engine 2: InnerTube IOS...');
        const data = await fetchInnerTube(videoId, 'IOS', '17.33.2', {
          deviceMake: 'Apple',
          deviceModel: 'iPhone16,2',
          osName: 'iPhone',
          osVersion: '17.5.1.21F90',
        });

        if (data.videoDetails && !title) {
          title = data.videoDetails.title || title;
        }

        if (data.streamingData) {
          const combinedFmts: any[] = data.streamingData.formats || [];
          combinedFmts.forEach((f: any) => {
            if (f.url && !f.signatureCipher) {
              const q = f.qualityLabel || f.quality || 'HD';
              formats.push({ quality: `${q} Video`, ext: 'mp4', url: f.url });
            }
          });

          const adaptiveFmts: any[] = data.streamingData.adaptiveFormats || [];
          const audioFmts = adaptiveFmts
            .filter((f: any) => f.mimeType?.startsWith('audio/mp4') && f.url && !f.signatureCipher)
            .sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0));
          
          if (audioFmts.length > 0) {
            formats.push({ quality: 'High Quality Audio', ext: 'mp3', url: audioFmts[0].url });
          }

          console.log(`Engine 2 (IOS): ${formats.length} formats`);
        }
      } catch (e: any) {
        console.log('Engine 2 (InnerTube IOS) Failed:', e.message);
        errors.push(`Engine 2: ${e.message}`);
      }
    }

    // ── ইঞ্জিন ৩: YouTube InnerTube — TV Embedded Player ─────────────────────
    if (formats.length === 0) {
      try {
        console.log('Engine 3: InnerTube TVHTML5...');
        const data = await fetchInnerTube(videoId, 'TVHTML5_SIMPLY_EMBEDDED_PLAYER', '2.0');

        if (data.streamingData) {
          const combinedFmts: any[] = data.streamingData.formats || [];
          combinedFmts.forEach((f: any) => {
            if (f.url && !f.signatureCipher) {
              formats.push({ quality: `${f.qualityLabel || 'HD'} Video`, ext: 'mp4', url: f.url });
            }
          });
          console.log(`Engine 3 (TV): ${formats.length} formats`);
        }
      } catch (e: any) {
        console.log('Engine 3 (InnerTube TV) Failed:', e.message);
        errors.push(`Engine 3: ${e.message}`);
      }
    }

    // ── ইঞ্জিন ৪: VKR External API ───────────────────────────────────────────
    if (formats.length === 0) {
      try {
        console.log('Engine 4: VKR...');
        const r = await fetchSafe(
          `https://api.vkrdownloader.co.in/api?vkr=${encodeURIComponent(cleanUrl)}`,
          { headers: { 'User-Agent': UA_BROWSER } },
          12000
        );
        if (r.ok) {
          const d = await r.json();
          if (d.data?.downloads?.length > 0) {
            title = d.data.title || title;
            thumbnail = d.data.thumbnail || thumbnail;
            d.data.downloads.forEach((dl: any) => {
              if (!dl.url) return;
              const isAudio = dl.url.includes('.mp3') || dl.quality?.toLowerCase().includes('audio');
              formats.push({ quality: dl.quality || (isAudio ? 'Audio' : 'Video'), ext: isAudio ? 'mp3' : 'mp4', url: dl.url });
            });
          }
        }
        console.log(`Engine 4 (VKR): ${formats.length} formats`);
      } catch (e: any) {
        errors.push(`Engine 4: ${e.message}`);
      }
    }

    // ── ইঞ্জিন ৫: BK9 External API ───────────────────────────────────────────
    if (formats.length === 0) {
      try {
        console.log('Engine 5: BK9...');
        const r = await fetchSafe(
          `https://bk9.fun/download/youtube?url=${encodeURIComponent(cleanUrl)}`,
          { headers: { 'User-Agent': UA_BROWSER } },
          12000
        );
        if (r.ok) {
          const d = await r.json();
          if (d.status && d.BK9) {
            title = d.BK9.title || title;
            thumbnail = d.BK9.thumb || thumbnail;
            if (d.BK9.vid) formats.push({ quality: 'HD Video MP4', ext: 'mp4', url: d.BK9.vid });
            if (d.BK9.aud) formats.push({ quality: 'Audio MP3', ext: 'mp3', url: d.BK9.aud });
          }
        }
        console.log(`Engine 5 (BK9): ${formats.length} formats`);
      } catch (e: any) {
        errors.push(`Engine 5: ${e.message}`);
      }
    }

    if (formats.length === 0) {
      console.log('ALL ENGINES FAILED:', errors.join(' | '));
      throw new Error(`সব ইঞ্জিন ব্যর্থ হয়েছে: ${errors.join(' | ')}`);
    }

    // ── Deduplicate + Quality sort ────────────────────────────────────────────
    const uniqueFormats = Array.from(new Map(formats.map(f => [f.url, f])).values());

    return NextResponse.json(
      { success: true, data: { title, thumbnail, formats: uniqueFormats } },
      { status: 200, headers: CORS }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'ভিডিও পাওয়া যায়নি। লিংকটি চেক করুন।', details: err.message },
      { status: 500, headers: CORS }
    );
  }
}
