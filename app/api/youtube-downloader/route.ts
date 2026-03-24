import { NextResponse } from 'next/server';

export const maxDuration = 60;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const UA_BROWSER = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36';

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

// ── InnerTube client configs ──────────────────────────────────────────────────
const INNERTUBE_CLIENTS = {
  ANDROID: {
    apiKey: 'AIzaSyA8eiZmM1FaDVjRy-df2KTyQ_vz_yYM39w',
    clientName: 'ANDROID',
    clientId: '3',
    clientVersion: '19.02.39',
    userAgent: 'com.google.android.youtube/19.02.39 (Linux; U; Android 11) gzip',
    extra: { androidSdkVersion: 30 },
  },
  IOS: {
    apiKey: 'AIzaSyA8eiZmM1FaDVjRy-df2KTyQ_vz_yYM39w',
    clientName: 'IOS',
    clientId: '5',
    clientVersion: '19.09.3',
    userAgent: 'com.google.ios.youtube/19.09.3 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X)',
    extra: { deviceMake: 'Apple', deviceModel: 'iPhone16,2', osName: 'iPhone', osVersion: '17.5.1.21F90', iosUserInterfaceIdiom: 0 },
  },
  TV: {
    apiKey: 'AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8',
    clientName: 'TVHTML5_SIMPLY_EMBEDDED_PLAYER',
    clientId: '85',
    clientVersion: '2.0',
    userAgent: 'Mozilla/5.0 (SMART-TV; LINUX; Tizen 6.0) AppleWebKit/538.1 (KHTML, like Gecko) Version/6.0 TV Safari/538.1',
    extra: {},
  },
} as const;

async function innerTubeFetch(videoId: string, clientKey: keyof typeof INNERTUBE_CLIENTS): Promise<any> {
  const c = INNERTUBE_CLIENTS[clientKey];
  const r = await fetchSafe(
    `https://www.youtube.com/youtubei/v1/player?key=${c.apiKey}&prettyPrint=false`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': c.userAgent,
        'X-YouTube-Client-Name': c.clientId,
        'X-YouTube-Client-Version': c.clientVersion,
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': 'https://www.youtube.com',
        'Referer': 'https://www.youtube.com/',
      },
      body: JSON.stringify({
        videoId,
        context: {
          client: {
            clientName: c.clientName,
            clientVersion: c.clientVersion,
            hl: 'en',
            gl: 'US',
            utcOffsetMinutes: 0,
            ...c.extra,
          },
        },
      }),
    },
    18000
  );

  if (!r.ok) {
    const body = await r.text().catch(() => '');
    throw new Error(`HTTP ${r.status}: ${body.slice(0, 120)}`);
  }
  return r.json();
}

// ── Extract formats from InnerTube response ───────────────────────────────────
function extractFormats(data: any): { quality: string; ext: string; url: string }[] {
  const out: { quality: string; ext: string; url: string }[] = [];
  if (!data?.streamingData) return out;

  const combined: any[] = data.streamingData.formats || [];
  const adaptive: any[] = data.streamingData.adaptiveFormats || [];

  // Prefer combined video+audio: 720p first, then whatever
  const videoFmts = combined
    .filter((f: any) => f.url && !f.signatureCipher && !f.cipher)
    .sort((a: any, b: any) => (parseInt(b.qualityLabel) || 0) - (parseInt(a.qualityLabel) || 0));

  videoFmts.forEach((f: any) => {
    out.push({ quality: `${f.qualityLabel || f.quality || 'HD'} Video`, ext: 'mp4', url: f.url });
  });

  // Best audio (mp4a)
  const audioFmts = adaptive
    .filter((f: any) => f.mimeType?.startsWith('audio/mp4') && f.url && !f.signatureCipher && !f.cipher)
    .sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0));

  if (audioFmts.length > 0) {
    out.push({ quality: 'High Quality Audio', ext: 'mp3', url: audioFmts[0].url });
  }

  return out;
}

// ── CORS ──────────────────────────────────────────────────────────────────────
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS });
}

// ── GET: Proxy Downloader ─────────────────────────────────────────────────────
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

// ── POST: YouTube Fetcher ─────────────────────────────────────────────────────
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

    // ── Video ID extraction ───────────────────────────────────────────────────
    let videoId = '';
    let cleanUrl = url;
    try {
      const u = new URL(url);
      if (url.includes('youtu.be/')) {
        videoId = u.pathname.split('/')[1]?.split('?')[0] || '';
        cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;
      } else {
        videoId = u.searchParams.get('v') || '';
        if (videoId) cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;
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
    let playerData: any;

    // ── Metadata: oEmbed ──────────────────────────────────────────────────────
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
    } catch { /* ignore */ }

    // ── Engine 1: InnerTube ANDROID ───────────────────────────────────────────
    try {
      console.log('Engine 1: InnerTube ANDROID...');
      playerData = await innerTubeFetch(videoId, 'ANDROID');

      if (playerData?.videoDetails?.title) title = playerData.videoDetails.title;
      const thumbs = playerData?.videoDetails?.thumbnail?.thumbnails;
      if (thumbs?.length) thumbnail = thumbs[thumbs.length - 1].url || thumbnail;

      if (playerData?.playabilityStatus?.status === 'OK') {
        formats = extractFormats(playerData);
        console.log(`Engine 1 (ANDROID): ${formats.length} formats`);
      } else {
        const reason = playerData?.playabilityStatus?.reason || 'unknown';
        errors.push(`Engine 1: playability=${playerData?.playabilityStatus?.status} (${reason})`);
      }
    } catch (e: any) {
      console.log('Engine 1 ANDROID failed:', e.message);
      errors.push(`Engine 1: ${e.message}`);
    }

    // ── Engine 2: InnerTube IOS ───────────────────────────────────────────────
    if (formats.length === 0) {
      try {
        console.log('Engine 2: InnerTube IOS...');
        playerData = await innerTubeFetch(videoId, 'IOS');

        if (playerData?.playabilityStatus?.status === 'OK') {
          formats = extractFormats(playerData);
          if (playerData?.videoDetails?.title) title = playerData.videoDetails.title;
          console.log(`Engine 2 (IOS): ${formats.length} formats`);
        } else {
          errors.push(`Engine 2: playability=${playerData?.playabilityStatus?.status}`);
        }
      } catch (e: any) {
        console.log('Engine 2 IOS failed:', e.message);
        errors.push(`Engine 2: ${e.message}`);
      }
    }

    // ── Engine 3: InnerTube TV ────────────────────────────────────────────────
    if (formats.length === 0) {
      try {
        console.log('Engine 3: InnerTube TV...');
        playerData = await innerTubeFetch(videoId, 'TV');

        if (playerData?.playabilityStatus?.status === 'OK') {
          formats = extractFormats(playerData);
          console.log(`Engine 3 (TV): ${formats.length} formats`);
        } else {
          errors.push(`Engine 3: playability=${playerData?.playabilityStatus?.status}`);
        }
      } catch (e: any) {
        console.log('Engine 3 TV failed:', e.message);
        errors.push(`Engine 3: ${e.message}`);
      }
    }

    // ── Engine 4: VKR External ────────────────────────────────────────────────
    if (formats.length === 0) {
      try {
        console.log('Engine 4: VKR...');
        const r = await fetchSafe(
          `https://api.vkrdownloader.co.in/api?vkr=${encodeURIComponent(cleanUrl)}`,
          { headers: { 'User-Agent': UA_BROWSER } }, 12000
        );
        if (r.ok) {
          const d = await r.json();
          if (d.data?.downloads?.length > 0) {
            title = d.data.title || title;
            thumbnail = d.data.thumbnail || thumbnail;
            d.data.downloads.forEach((dl: any) => {
              if (!dl.url) return;
              const isAudio = dl.url.includes('.mp3') || dl.quality?.toLowerCase().includes('audio');
              formats.push({ quality: dl.quality || (isAudio ? 'Audio' : 'HD Video'), ext: isAudio ? 'mp3' : 'mp4', url: dl.url });
            });
          } else errors.push('Engine 4: VKR no data');
        } else errors.push(`Engine 4: VKR HTTP ${r.status}`);
        console.log(`Engine 4 (VKR): ${formats.length} formats`);
      } catch (e: any) { errors.push(`Engine 4: ${e.message}`); }
    }

    // ── Engine 5: BK9 External ────────────────────────────────────────────────
    if (formats.length === 0) {
      try {
        console.log('Engine 5: BK9...');
        const r = await fetchSafe(
          `https://bk9.fun/download/youtube?url=${encodeURIComponent(cleanUrl)}`,
          { headers: { 'User-Agent': UA_BROWSER } }, 12000
        );
        if (r.ok) {
          const d = await r.json();
          if (d.status && d.BK9) {
            title = d.BK9.title || title;
            thumbnail = d.BK9.thumb || thumbnail;
            if (d.BK9.vid) formats.push({ quality: 'HD Video', ext: 'mp4', url: d.BK9.vid });
            if (d.BK9.aud) formats.push({ quality: 'Audio MP3', ext: 'mp3', url: d.BK9.aud });
          } else errors.push('Engine 5: BK9 no data');
        } else errors.push(`Engine 5: BK9 HTTP ${r.status}`);
        console.log(`Engine 5 (BK9): ${formats.length} formats`);
      } catch (e: any) { errors.push(`Engine 5: ${e.message}`); }
    }

    if (formats.length === 0) {
      console.log('ALL FAILED:', errors.join(' | '));
      throw new Error(`সব ইঞ্জিন ব্যর্থ: ${errors.join(' | ')}`);
    }

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
