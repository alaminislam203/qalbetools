import { NextResponse } from 'next/server';

// ============================
// CORS Headers
// ============================
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36';

// ============================
// Helper: Decode Facebook-encoded URL strings
// ============================
function decodeFbUrl(url: string): string {
  return url
    .replace(/\\u0025/g, '%')
    .replace(/\\u002F/gi, '/')
    .replace(/\\/g, '')
    .replace(/&amp;/g, '&');
}

// ============================
// Method 1: Direct Facebook page scraping
// Facebook embeds video data as JSON inside script tags
// ============================
async function tryDirectFacebook(videoUrl: string) {
  // Normalize URL — mobile url'ও handle করো
  const normalizedUrl = videoUrl
    .replace('m.facebook.com', 'www.facebook.com')
    .replace('web.facebook.com', 'www.facebook.com');

  const res = await fetch(normalizedUrl, {
    headers: {
      'User-Agent': UA,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
    },
    signal: AbortSignal.timeout(20000),
  });

  if (!res.ok) throw new Error(`Facebook page returned ${res.status}`);
  const html = await res.text();

  const formats: { quality: string; url: string; filesize: string }[] = [];

  // ── Pattern 1: hd_src / sd_src in JSON ──────────────────────────────
  const hdMatch =
    html.match(/"hd_src":"([^"]+)"/) ||
    html.match(/hd_src\s*:\s*"([^"]+)"/) ||
    html.match(/"playable_url_quality_hd":"([^"]+)"/);

  const sdMatch =
    html.match(/"sd_src":"([^"]+)"/) ||
    html.match(/sd_src\s*:\s*"([^"]+)"/) ||
    html.match(/"playable_url":"([^"]+)"/);

  if (hdMatch?.[1]) {
    formats.push({ quality: 'HD', url: decodeFbUrl(hdMatch[1]), filesize: 'Unknown' });
  }
  if (sdMatch?.[1]) {
    formats.push({ quality: 'SD', url: decodeFbUrl(sdMatch[1]), filesize: 'Unknown' });
  }

  // ── Pattern 2: browser_native_hd_url / browser_native_sd_url ────────
  if (formats.length === 0) {
    const hdMatch2 = html.match(/"browser_native_hd_url":"([^"]+)"/);
    const sdMatch2 = html.match(/"browser_native_sd_url":"([^"]+)"/);
    if (hdMatch2?.[1]) formats.push({ quality: 'HD', url: decodeFbUrl(hdMatch2[1]), filesize: 'Unknown' });
    if (sdMatch2?.[1]) formats.push({ quality: 'SD', url: decodeFbUrl(sdMatch2[1]), filesize: 'Unknown' });
  }

  // ── Pattern 3: VideoObject schema.org JSON-LD ────────────────────────
  if (formats.length === 0) {
    const jsonLdMatch = html.match(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i);
    if (jsonLdMatch) {
      try {
        const ld = JSON.parse(jsonLdMatch[1]);
        const contentUrl = ld.contentUrl || ld.url;
        if (contentUrl) formats.push({ quality: 'HD', url: contentUrl, filesize: 'Unknown' });
      } catch { /* ignore */ }
    }
  }

  // ── Pattern 4: og:video meta tag fallback ────────────────────────────
  if (formats.length === 0) {
    const ogVideo = html.match(/<meta[^>]+property="og:video"[^>]+content="([^"]+)"/i)
      || html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:video"/i);
    if (ogVideo?.[1]) {
      formats.push({ quality: 'SD', url: decodeFbUrl(ogVideo[1]), filesize: 'Unknown' });
    }
  }

  if (formats.length === 0) throw new Error('Direct FB: no video URLs found in page');

  // ── Extract metadata ─────────────────────────────────────────────────
  const titleMatch =
    html.match(/"title":"([^"]{3,200})"/) ||
    html.match(/<title[^>]*>([^<]+)<\/title>/i) ||
    html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i);
  const title = titleMatch ? titleMatch[1].replace(/ \| Facebook$/, '').trim() : 'Facebook Video';

  const thumbMatch =
    html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i) ||
    html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:image"/i) ||
    html.match(/"thumbnailImage":\{"uri":"([^"]+)"/);
  const thumbnail = thumbMatch ? decodeFbUrl(thumbMatch[1]) : '';

  return { title, thumbnail, formats };
}

// ============================
// Method 2: savefrom.net API (Vercel-friendly, no bot block)
// ============================
async function trySavefrom(videoUrl: string) {
  const apiUrl = `https://worker.sf-tools.com/savefrom.php?sf_url=${encodeURIComponent(videoUrl)}&lang=en&app=1`;

  const res = await fetch(apiUrl, {
    headers: {
      'User-Agent': UA,
      'Referer': 'https://en.savefrom.net/',
      'Origin': 'https://en.savefrom.net',
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) throw new Error(`savefrom returned ${res.status}`);
  const data = await res.json() as any;

  if (!data?.url || data.url.length === 0) throw new Error('savefrom: no URLs found');

  const formats: { quality: string; url: string; filesize: string }[] = [];
  for (const item of data.url) {
    if (item.url && (item.id?.includes('720') || item.id?.includes('1080') || item.id?.includes('480') || item.id?.includes('360') || item.ext === 'mp4')) {
      formats.push({
        quality: item.id || 'HD',
        url: item.url,
        filesize: item.size ? `${(item.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown',
      });
    }
  }

  if (formats.length === 0) throw new Error('savefrom: no video formats');

  return {
    title: data.meta?.title || 'Facebook Video',
    thumbnail: data.meta?.thumb || '',
    formats,
  };
}

// ============================
// Method 3: cobalt.tools API (open source, no blocks)
// ============================
async function tryCobalt(videoUrl: string) {
  const res = await fetch('https://api.cobalt.tools/api/json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': UA,
    },
    body: JSON.stringify({ url: videoUrl, vQuality: 'max', isAudioOnly: false }),
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) throw new Error(`cobalt returned ${res.status}`);
  const data = await res.json() as any;

  if (data.status === 'error') throw new Error('cobalt: ' + data.text);
  if (!data.url && !data.picker) throw new Error('cobalt: no URL in response');

  const formats: { quality: string; url: string; filesize: string }[] = [];
  if (data.url) {
    formats.push({ quality: 'HD', url: data.url, filesize: 'Unknown' });
  }
  if (data.picker?.length) {
    for (const p of data.picker) {
      if (p.url) formats.push({ quality: 'SD', url: p.url, filesize: 'Unknown' });
    }
  }

  if (formats.length === 0) throw new Error('cobalt: no formats');

  return { title: 'Facebook Video', thumbnail: '', formats };
}

// ============================
// OPTIONS (CORS Preflight)
// ============================
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS });
}

// ============================
// POST Handler
// ============================
export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    const isFacebook =
      url &&
      (url.includes('facebook.com') ||
        url.includes('fb.watch') ||
        url.includes('fb.com'));

    if (!isFacebook) {
      return NextResponse.json(
        { success: false, error: 'Valid Facebook URL required' },
        { status: 400, headers: CORS }
      );
    }

    const errors: string[] = [];
    let result: { title: string; thumbnail: string; formats: any[] } | null = null;

    // ── Method 1: Direct Facebook scraping ──────────────────────────────
    try {
      result = await tryDirectFacebook(url);
      console.log('[FB] ✅ Direct Facebook scraping succeeded');
    } catch (e: any) {
      console.warn('[FB] ⚠️ Direct FB failed:', e.message);
      errors.push('direct: ' + e.message);
    }

    // ── Method 2: savefrom.net ──────────────────────────────────────────
    if (!result) {
      try {
        result = await trySavefrom(url);
        console.log('[FB] ✅ savefrom.net succeeded');
      } catch (e: any) {
        console.warn('[FB] ⚠️ savefrom failed:', e.message);
        errors.push('savefrom: ' + e.message);
      }
    }

    // ── Method 3: cobalt.tools ──────────────────────────────────────────
    if (!result) {
      try {
        result = await tryCobalt(url);
        console.log('[FB] ✅ cobalt.tools succeeded');
      } catch (e: any) {
        console.warn('[FB] ⚠️ cobalt failed:', e.message);
        errors.push('cobalt: ' + e.message);
      }
    }

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: 'All download methods failed. The video may be private, deleted, or georestricted.',
          details: errors,
        },
        { status: 500, headers: CORS }
      );
    }

    return NextResponse.json(
      { success: true, data: result },
      { status: 200, headers: CORS }
    );
  } catch (err: any) {
    console.error('[FB] Fatal error:', err.message);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: err.message },
      { status: 500, headers: CORS }
    );
  }
}
