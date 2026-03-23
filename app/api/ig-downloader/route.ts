import { NextResponse } from 'next/server';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36';

// ============================
// Helper: Decode URL strings
// ============================
function decodeUrl(url: string): string {
  try {
    return JSON.parse(`"${url}"`);
  } catch {
    return url.replace(/\\u0025/g, '%').replace(/\\u002F/gi, '/').replace(/\\/g, '').replace(/&amp;/g, '&');
  }
}

// ============================
// Method 1: Direct Instagram Scraping (HTML Meta Tags)
// ============================
async function tryDirectInstagram(url: string) {
  // Normalize URL
  const normalizedUrl = url.split('?')[0].replace(/\/$/, '') + '/';

  const res = await fetch(normalizedUrl, {
    headers: {
      'User-Agent': UA,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) throw new Error(`Instagram returned ${res.status}`);
  const html = await res.text();

  const formats: { quality: string; url: string; filesize: string }[] = [];

  // ── Video Patterns ────────────────────────────────────────────────────
  const videoMatches = [
    html.match(/<meta[^>]+property="og:video"[^>]+content="([^"]+)"/i),
    html.match(/"video_url":"([^"]+)"/),
    html.match(/"playable_url":"([^"]+)"/),
    html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:video"/i),
  ];
  
  for (const m of videoMatches) {
    if (m?.[1]) {
      const videoUrl = decodeUrl(m[1]);
      if (videoUrl.includes('fbcdn.net') || videoUrl.includes('instagram.com')) {
        formats.push({ quality: 'HD', url: videoUrl, filesize: 'Unknown' });
        break; // Found a valid video URL
      }
    }
  }

  // ── Image Pattern (if no video found) ──────────────────────────────────
  if (formats.length === 0) {
    const imageMatches = [
      html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i),
      html.match(/"display_url":"([^"]+)"/),
      html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:image"/i),
    ];
    for (const m of imageMatches) {
      if (m?.[1]) {
        const imageUrl = decodeUrl(m[1]);
        formats.push({ quality: 'Image', url: imageUrl, filesize: 'Unknown' });
        break;
      }
    }
  }

  if (formats.length === 0) throw new Error('Direct IG: No media URLs found');

  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    || html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i)
    || html.match(/"accessibility_caption":"([^"]+)"/);
  const title = titleMatch ? titleMatch[1].replace(/ • Instagram photos and videos$/, '').trim() : 'Instagram Media';

  const thumbMatch = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i)
    || html.match(/"thumbnail_src":"([^"]+)"/);
  const thumbnail = thumbMatch ? decodeUrl(thumbMatch[1]) : '';

  return { title, thumbnail, formats };
}

// ============================
// Method 2: Savefrom.net API (Improved Parsing)
// ============================
async function trySavefrom(url: string) {
  const apiUrl = `https://worker.sf-tools.com/savefrom.php?sf_url=${encodeURIComponent(url)}&lang=en&app=1`;

  const res = await fetch(apiUrl, {
    headers: { 
      'User-Agent': UA, 
      'Referer': 'https://en.savefrom.net/',
      'Origin': 'https://en.savefrom.net',
      'Accept': 'application/json, text/plain, */*'
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) throw new Error(`Savefrom returned ${res.status}`);
  const text = await res.text();
  
  // Savefrom can sometimes return plain "ok" or other non-JSON text
  if (!text.startsWith('{')) {
    throw new Error('Savefrom: Non-JSON response received');
  }

  const data = JSON.parse(text);
  if (!data?.url || data.url.length === 0) throw new Error('Savefrom: No URLs found');

  const formats = data.url.map((item: any) => ({
    quality: item.subname || (item.ext === 'mp4' ? 'HD' : 'SD'),
    url: item.url,
    filesize: item.size ? `${(item.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown',
  }));

  return {
    title: data.meta?.title || 'Instagram Media',
    thumbnail: data.meta?.thumb || '',
    formats,
  };
}

// ============================
// Method 3: Cobalt.tools API (Optimized)
// ============================
async function tryCobalt(url: string) {
  const res = await fetch('https://api.cobalt.tools/api/json', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json', 
      'Accept': 'application/json', 
      'User-Agent': UA,
      'Origin': 'https://cobalt.tools',
      'Referer': 'https://cobalt.tools/'
    },
    body: JSON.stringify({ 
      url: url, 
      vQuality: 'max', 
      isAudioOnly: false,
      isNoTTWatermark: true 
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) throw new Error(`Cobalt returned ${res.status}`);
  const data = await res.json() as any;

  if (data.status === 'error') throw new Error('Cobalt: ' + data.text);
  if (!data.url && !data.picker) throw new Error('Cobalt: No media found');

  const formats = [];
  if (data.url) {
    formats.push({ quality: 'HD', url: data.url, filesize: 'Unknown' });
  }
  
  // Instagram carousel support
  if (data.picker) {
    data.picker.forEach((item: any, idx: number) => {
      if (item.url) {
        formats.push({ quality: `Media ${idx + 1}`, url: item.url, filesize: 'Unknown' });
      }
    });
  }

  return { 
    title: data.status === 'picker' ? 'Instagram Carousel' : 'Instagram Media', 
    thumbnail: '', 
    formats 
  };
}

// ============================
// API Handlers
// ============================
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS });
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url || !url.includes('instagram.com')) {
      return NextResponse.json({ success: false, error: 'Valid Instagram URL required' }, { status: 400, headers: CORS });
    }

    let result = null;
    const errors: string[] = [];

    // ── Try Direct ──────────────────────
    try {
      result = await tryDirectInstagram(url);
      console.log('[IG] ✅ Direct scraping succeeded');
    } catch (e: any) {
      console.warn('[IG] ⚠️ Direct failed:', e.message);
      errors.push('direct: ' + e.message);
    }

    // ── Try Savefrom ────────────────────
    if (!result) {
      try {
        result = await trySavefrom(url);
        console.log('[IG] ✅ Savefrom succeeded');
      } catch (e: any) {
        console.warn('[IG] ⚠️ Savefrom failed:', e.message);
        errors.push('savefrom: ' + e.message);
      }
    }

    // ── Try Cobalt ──────────────────────
    if (!result) {
      try {
        result = await tryCobalt(url);
        console.log('[IG] ✅ Cobalt succeeded');
      } catch (e: any) {
        console.warn('[IG] ⚠️ Cobalt failed:', e.message);
        errors.push('cobalt: ' + e.message);
      }
    }

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'All download methods failed. The account might be private or post unavailable.', details: errors },
        { status: 500, headers: CORS }
      );
    }

    return NextResponse.json({ success: true, data: result }, { status: 200, headers: CORS });
  } catch (err: any) {
    console.error('[IG] Fatal error:', err.message);
    return NextResponse.json({ success: false, error: 'Internal server error', details: err.message }, { status: 500, headers: CORS });
  }
}

