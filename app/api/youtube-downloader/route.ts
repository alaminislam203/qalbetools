import { NextResponse } from 'next/server';

export const maxDuration = 60;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const UA_BROWSER = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const UA_ANDROID = 'com.google.android.youtube/19.02.39 (Linux; U; Android 11) gzip';

// ── Timeout-safe fetch ────────────────────────────────────────────────────────
async function fetchSafe(url: string, init: RequestInit = {}, ms = 15000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (e) { clearTimeout(timer); throw e; }
}

// ── Extract direct stream URLs from InnerTube player data ─────────────────────
function extractFormats(data: any): { quality: string; ext: string; url: string }[] {
  const out: { quality: string; ext: string; url: string }[] = [];
  if (!data?.streamingData) return out;

  const combined: any[] = (data.streamingData.formats || [])
    .filter((f: any) => f.url && !f.signatureCipher && !f.cipher)
    .sort((a: any, b: any) => (parseInt(b.qualityLabel) || 0) - (parseInt(a.qualityLabel) || 0));

  combined.forEach((f: any) =>
    out.push({ quality: `${f.qualityLabel || f.quality || 'HD'} Video`, ext: 'mp4', url: f.url })
  );

  const audioOnly: any[] = (data.streamingData.adaptiveFormats || [])
    .filter((f: any) => f.mimeType?.startsWith('audio/mp4') && f.url && !f.signatureCipher && !f.cipher)
    .sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0));

  if (audioOnly.length > 0)
    out.push({ quality: 'High Quality Audio', ext: 'mp3', url: audioOnly[0].url });

  return out;
}

// ── InnerTube player request (generic) ───────────────────────────────────────
async function innerTubePlayer(videoId: string, opts: {
  clientName: string;
  clientVersion: string;
  clientId: string;
  userAgent: string;
  apiKey?: string;
  extra?: Record<string, unknown>;
}): Promise<any> {
  const keyParam = opts.apiKey ? `?key=${opts.apiKey}&prettyPrint=false` : '?prettyPrint=false';
  const r = await fetchSafe(
    `https://www.youtube.com/youtubei/v1/player${keyParam}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': opts.userAgent,
        'X-YouTube-Client-Name': opts.clientId,
        'X-YouTube-Client-Version': opts.clientVersion,
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': 'https://www.youtube.com',
      },
      body: JSON.stringify({
        videoId,
        context: {
          client: {
            clientName: opts.clientName,
            clientVersion: opts.clientVersion,
            hl: 'en',
            gl: 'US',
            utcOffsetMinutes: 0,
            ...(opts.extra || {}),
          },
        },
      }),
    },
    18000
  );
  if (!r.ok) {
    const text = await r.text().catch(() => '');
    throw new Error(`HTTP ${r.status}: ${text.slice(0, 150)}`);
  }
  return r.json();
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS });
}

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

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { url } = body as { url?: string };
    if (!url || (!url.includes('youtube.com') && !url.includes('youtu.be'))) {
      return NextResponse.json({ success: false, error: 'Valid YouTube URL required' }, { status: 400, headers: CORS });
    }

    // ── Video ID extraction ───────────────────────────────────────────────────
    let videoId = '';
    let cleanUrl = url;
    try {
      const u = new URL(url);
      if (url.includes('youtu.be/')) {
        videoId = u.pathname.split('/')[1]?.split('?')[0] || '';
      } else {
        videoId = u.searchParams.get('v') || '';
      }
      if (videoId) cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;
    } catch { /* ignore */ }

    if (!videoId) {
      return NextResponse.json({ success: false, error: 'YouTube Video ID বের করা যায়নি।' }, { status: 400, headers: CORS });
    }

    let formats: { quality: string; ext: string; url: string }[] = [];
    let title = 'YouTube Video';
    let thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    const errors: string[] = [];

    // ── Metadata: oEmbed (always run) ─────────────────────────────────────────
    try {
      const r = await fetchSafe(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(cleanUrl)}&format=json`,
        { headers: { 'User-Agent': UA_BROWSER } }, 8000
      );
      if (r.ok) { const d = await r.json(); if (d.title) title = d.title; if (d.thumbnail_url) thumbnail = d.thumbnail_url; }
    } catch { /* ignore */ }

    // ── Engine 1: ANDROID_TESTSUITE (no key, bypasses precondition) ───────────
    try {
      console.log('Engine 1: ANDROID_TESTSUITE...');
      const data = await innerTubePlayer(videoId, {
        clientName: 'ANDROID_TESTSUITE',
        clientVersion: '1.9',
        clientId: '30',
        userAgent: UA_ANDROID,
        // No API key — ANDROID_TESTSUITE works without key
        extra: { androidSdkVersion: 30 },
      });

      if (data?.videoDetails?.title) title = data.videoDetails.title;
      const thumbs = data?.videoDetails?.thumbnail?.thumbnails;
      if (thumbs?.length) thumbnail = thumbs[thumbs.length - 1].url || thumbnail;

      if (data?.playabilityStatus?.status === 'OK') {
        formats = extractFormats(data);
        console.log(`Engine 1 (ANDROID_TESTSUITE): ${formats.length} formats`);
      } else {
        errors.push(`Engine 1: ${data?.playabilityStatus?.status} — ${data?.playabilityStatus?.reason || ''}`);
      }
    } catch (e: any) {
      console.log('Engine 1 failed:', e.message);
      errors.push(`Engine 1: ${e.message}`);
    }

    // ── Engine 2: ANDROID_EMBEDDED_PLAYER ─────────────────────────────────────
    if (formats.length === 0) {
      try {
        console.log('Engine 2: ANDROID_EMBEDDED_PLAYER...');
        const data = await innerTubePlayer(videoId, {
          clientName: 'ANDROID_EMBEDDED_PLAYER',
          clientVersion: '17.31.35',
          clientId: '55',
          userAgent: UA_ANDROID,
          apiKey: 'AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8',
          extra: { androidSdkVersion: 30, embedUrl: `https://www.youtube.com/watch?v=${videoId}` },
        });
        if (data?.playabilityStatus?.status === 'OK') {
          formats = extractFormats(data);
          console.log(`Engine 2 (ANDROID_EMBEDDED): ${formats.length} formats`);
        } else {
          errors.push(`Engine 2: ${data?.playabilityStatus?.status}`);
        }
      } catch (e: any) {
        console.log('Engine 2 failed:', e.message);
        errors.push(`Engine 2: ${e.message}`);
      }
    }

    // ── Engine 3: WEB_EMBEDDED_PLAYER ────────────────────────────────────────
    if (formats.length === 0) {
      try {
        console.log('Engine 3: WEB_EMBEDDED_PLAYER...');
        const data = await innerTubePlayer(videoId, {
          clientName: 'WEB_EMBEDDED_PLAYER',
          clientVersion: '2.20210721.00.00',
          clientId: '56',
          userAgent: UA_BROWSER,
          apiKey: 'AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8',
          extra: { embedUrl: `https://www.youtube.com/watch?v=${videoId}` },
        });
        if (data?.playabilityStatus?.status === 'OK') {
          formats = extractFormats(data);
          console.log(`Engine 3 (WEB_EMBEDDED): ${formats.length} formats`);
        } else {
          errors.push(`Engine 3: ${data?.playabilityStatus?.status}`);
        }
      } catch (e: any) {
        console.log('Engine 3 failed:', e.message);
        errors.push(`Engine 3: ${e.message}`);
      }
    }

    // ── Engine 4: YouTube Page HTML → ytInitialPlayerResponse ─────────────────
    if (formats.length === 0) {
      try {
        console.log('Engine 4: Page HTML parsing...');
        const r = await fetchSafe(
          `https://www.youtube.com/watch?v=${videoId}&hl=en&bpctr=9999999999&has_verified=1`,
          {
            headers: {
              'User-Agent': UA_BROWSER,
              'Accept-Language': 'en-US,en;q=0.9',
              'Accept': 'text/html',
              'Cookie': 'CONSENT=YES+cb.20210328-17-p0.en+FX+999; VISITOR_INFO1_LIVE=; YSC=',
            },
          },
          20000
        );
        if (r.ok) {
          const html = await r.text();
          // Extract ytInitialPlayerResponse
          const match = html.match(/ytInitialPlayerResponse\s*=\s*(\{.+?\})\s*;[\s\S]*?<\/script>/);
          if (match) {
            const playerResp = JSON.parse(match[1]);
            if (playerResp?.videoDetails?.title) title = playerResp.videoDetails.title;
            const htmlThumbs = playerResp?.videoDetails?.thumbnail?.thumbnails;
            if (htmlThumbs?.length) thumbnail = htmlThumbs[htmlThumbs.length - 1].url || thumbnail;

            // HTML page URLs are cipher-protected, but let's try extracting direct ones
            const htmlFormats = extractFormats(playerResp);
            if (htmlFormats.length > 0) {
              formats = htmlFormats;
              console.log(`Engine 4 (HTML): ${formats.length} direct formats`);
            } else {
              errors.push('Engine 4: HTML stream URLs are cipher-protected');
              console.log('Engine 4: HTML parsed but URLs are cipher-protected');
            }
          } else {
            errors.push('Engine 4: ytInitialPlayerResponse not found in HTML');
          }
        } else {
          errors.push(`Engine 4: HTTP ${r.status}`);
        }
      } catch (e: any) {
        console.log('Engine 4 failed:', e.message);
        errors.push(`Engine 4: ${e.message}`);
      }
    }

    // ── Engine 5: VKR External API ────────────────────────────────────────────
    if (formats.length === 0) {
      try {
        console.log('Engine 5: VKR...');
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
          } else errors.push('Engine 5: VKR no data');
        } else errors.push(`Engine 5: VKR HTTP ${r.status}`);
        console.log(`Engine 5 (VKR): ${formats.length} formats`);
      } catch (e: any) { errors.push(`Engine 5: ${e.message}`); }
    }

    // ── Engine 6: BK9 External API ────────────────────────────────────────────
    if (formats.length === 0) {
      try {
        console.log('Engine 6: BK9...');
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
          } else errors.push('Engine 6: BK9 no data');
        } else errors.push(`Engine 6: BK9 HTTP ${r.status}`);
        console.log(`Engine 6 (BK9): ${formats.length} formats`);
      } catch (e: any) { errors.push(`Engine 6: ${e.message}`); }
    }

    if (formats.length === 0) {
      console.log('ALL ENGINES FAILED:', errors.join(' | '));
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
