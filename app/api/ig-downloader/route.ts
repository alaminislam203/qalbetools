import { NextResponse } from 'next/server';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// ── Interfaces ────────────────────────────────────────────────────────────────
interface Format {
  quality: string;
  url: string;
  filesize: string;
  ext: string;
}
interface MediaResult {
  title: string;
  thumbnail: string;
  formats: Format[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function extractShortcode(url: string): string | null {
  const m = url.match(/\/(p|reel|tv|reels)\/([A-Za-z0-9_-]{6,})/);
  return m ? m[2] : null;
}

function decodeIgUrl(raw: string): string {
  try {
    return raw
      .replace(/\\u0026/gi, '&')
      .replace(/\\u003D/gi, '=')
      .replace(/\\u002F/gi, '/')
      .replace(/\\\//g, '/')
      .replace(/\\n/g, '')
      .replace(/\\/g, '');
  } catch {
    return raw;
  }
}

// ── Extract all media links from HTML ─────────────────────────────────────────
function extractLinksFromHtml(html: string): Format[] {
  const formats: Format[] = [];
  const seen = new Set<string>();

  // Generic CDN URL patterns (fbcdn, cdninstagram, etc.)
  const cdnPatterns = [
    /https?:\/\/[a-z0-9\-]+\.cdninstagram\.com\/[^\s"'<>]+/gi,
    /https?:\/\/[a-z0-9\-]+\.fbcdn\.net\/[^\s"'<>]+/gi,
  ];

  for (const pattern of cdnPatterns) {
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(html)) !== null) {
      let u = m[0].replace(/['">\s]+$/, '').replace(/\\u0026/gi, '&');
      u = decodeIgUrl(u);
      if (seen.has(u)) continue;
      seen.add(u);
      const isVideo = u.includes('.mp4') || u.includes('video');
      formats.push({
        quality: isVideo ? `HD ${formats.length + 1}` : `Image ${formats.length + 1}`,
        url: u,
        filesize: 'Unknown',
        ext: isVideo ? 'mp4' : 'jpg',
      });
    }
  }

  return formats;
}

// ══════════════════════════════════════════════════════════════════════════════
// METHOD 1 ★ SnapInsta.to  (reverse-engineered exact API)
// POST https://snapinsta.to/action.php
// ══════════════════════════════════════════════════════════════════════════════
async function trySnapInsta(url: string): Promise<MediaResult> {
  // Step 1: Load the homepage to get any cookies / token
  const homeRes = await fetch('https://snapinsta.to/', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    signal: AbortSignal.timeout(15000),
  });

  const cookies = homeRes.headers.get('set-cookie') || '';
  const cookieStr = cookies.split(',').map(c => c.split(';')[0].trim()).join('; ');
  const homeHtml = await homeRes.text();

  // Extract token from homepage HTML
  const tokenMatch = homeHtml.match(/name="token"\s+value="([^"]+)"/i)
    || homeHtml.match(/["']token["']\s*:\s*["']([^"']+)["']/i)
    || homeHtml.match(/var\s+token\s*=\s*["']([^"']+)["']/i);
  const token = tokenMatch ? tokenMatch[1] : '';

  // Step 2: POST to action endpoint
  const formData = new URLSearchParams();
  formData.append('url', url);
  formData.append('token', token);
  formData.append('lang', 'en');
  formData.append('button', '');

  const res = await fetch('https://snapinsta.to/action.php', {
    method: 'POST',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest',
      'Accept': '*/*',
      'Origin': 'https://snapinsta.to',
      'Referer': 'https://snapinsta.to/',
      ...(cookieStr ? { 'Cookie': cookieStr } : {}),
    },
    body: formData.toString(),
    signal: AbortSignal.timeout(20000),
  });

  if (!res.ok) throw new Error(`SnapInsta action.php returned ${res.status}`);

  const contentType = res.headers.get('content-type') || '';
  let formats: Format[] = [];
  let title = 'Instagram Media';
  let thumbnail = '';

  if (contentType.includes('application/json')) {
    // JSON response
    const data = await res.json() as any;

    // Possible JSON structures
    if (data?.data) {
      const html: string = typeof data.data === 'string' ? data.data : JSON.stringify(data.data);
      formats = extractLinksFromHtml(html);

      const thumbMatch = html.match(/src="(https?:\/\/[^"]+(?:fbcdn|cdninstagram)[^"]+)"/i);
      thumbnail = thumbMatch ? decodeIgUrl(thumbMatch[1]) : '';
    } else if (data?.url) {
      formats.push({ quality: 'HD', url: data.url, filesize: 'Unknown', ext: 'mp4' });
    } else if (Array.isArray(data?.medias)) {
      data.medias.forEach((m: any, i: number) => {
        if (m?.url) {
          formats.push({
            quality: m.quality || `HD ${i + 1}`,
            url: m.url,
            filesize: m.size || 'Unknown',
            ext: m.extension || 'mp4',
          });
        }
      });
      thumbnail = data.thumbnail || data.thumb || '';
      title = data.title || 'Instagram Media';
    }
  } else {
    // HTML response — parse download links
    const html = await res.text();
    formats = extractLinksFromHtml(html);

    const thumbMatch = html.match(/src="(https?:\/\/[^"]+(?:fbcdn|cdninstagram)[^"]+\.jpg[^"]*)"/i);
    thumbnail = thumbMatch ? decodeIgUrl(thumbMatch[1]) : '';

    const titleMatch = html.match(/<p[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)/i)
      || html.match(/alt="([^"]{10,})"/i);
    title = titleMatch ? titleMatch[1].trim() : 'Instagram Media';
  }

  if (formats.length === 0) throw new Error('SnapInsta: No download links found');
  return { title, thumbnail, formats };
}

// ══════════════════════════════════════════════════════════════════════════════
// METHOD 2 ★ SnapSave.app  (reverse-engineered exact API)
// POST https://snapsave.app/action.php
// ══════════════════════════════════════════════════════════════════════════════
async function trySnapSave(url: string): Promise<MediaResult> {
  // Step 1: GET homepage for cookies + token
  const homeRes = await fetch('https://snapsave.app/', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    signal: AbortSignal.timeout(15000),
  });

  const cookies = homeRes.headers.get('set-cookie') || '';
  const cookieStr = cookies.split(',').map(c => c.split(';')[0].trim()).join('; ');
  const homeHtml = await homeRes.text();

  const tokenMatch = homeHtml.match(/name="token"\s+value="([^"]+)"/i)
    || homeHtml.match(/["']token["']\s*:\s*["']([^"']+)["']/i)
    || homeHtml.match(/var\s+token\s*=\s*["']([^"']+)["']/i);
  const token = tokenMatch ? tokenMatch[1] : '';

  // Step 2: POST request  
  const formData = new URLSearchParams();
  formData.append('url', url);
  if (token) formData.append('token', token);

  const res = await fetch('https://snapsave.app/action.php', {
    method: 'POST',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest',
      'Accept': '*/*',
      'Origin': 'https://snapsave.app',
      'Referer': 'https://snapsave.app/',
      ...(cookieStr ? { 'Cookie': cookieStr } : {}),
    },
    body: formData.toString(),
    signal: AbortSignal.timeout(20000),
  });

  if (!res.ok) throw new Error(`SnapSave action.php returned ${res.status}`);

  const contentType = res.headers.get('content-type') || '';
  let formats: Format[] = [];
  let title = 'Instagram Media';
  let thumbnail = '';

  if (contentType.includes('application/json')) {
    const data = await res.json() as any;

    if (typeof data?.data === 'string') {
      // HTML inside JSON
      const html: string = data.data;
      formats = extractLinksFromHtml(html);

      const thumbMatch = html.match(/src="(https?:\/\/[^"]+(?:fbcdn|cdninstagram)[^"]+\.jpg[^"]*)"/i);
      thumbnail = thumbMatch ? decodeIgUrl(thumbMatch[1]) : '';
    } else if (Array.isArray(data?.data?.medias)) {
      data.data.medias.forEach((m: any, i: number) => {
        if (m?.url) {
          formats.push({
            quality: m.quality || `HD ${i + 1}`,
            url: m.url,
            filesize: m.size || 'Unknown',
            ext: m.extension || 'mp4',
          });
        }
      });
      thumbnail = data.data.thumbnail || '';
      title = data.data.title || 'Instagram Media';
    } else if (data?.url) {
      formats.push({ quality: 'HD', url: data.url, filesize: 'Unknown', ext: 'mp4' });
    }
  } else {
    const html = await res.text();
    formats = extractLinksFromHtml(html);
    const thumbMatch = html.match(/src="(https?:\/\/[^"]+(?:fbcdn|cdninstagram)[^"]+\.jpg[^"]*)"/i);
    thumbnail = thumbMatch ? decodeIgUrl(thumbMatch[1]) : '';
  }

  if (formats.length === 0) throw new Error('SnapSave: No download links found');
  return { title, thumbnail, formats };
}

// ══════════════════════════════════════════════════════════════════════════════
// METHOD 3: Instagram oEmbed + Embed page combo
// ══════════════════════════════════════════════════════════════════════════════
async function tryInstagramEmbed(url: string): Promise<MediaResult> {
  const shortcode = extractShortcode(url);
  if (!shortcode) throw new Error('Embed: Cannot extract shortcode');

  const embedUrls = [
    `https://www.instagram.com/p/${shortcode}/embed/captioned/`,
    `https://www.instagram.com/p/${shortcode}/embed/`,
  ];

  let html = '';
  for (const embedUrl of embedUrls) {
    try {
      const res = await fetch(embedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: AbortSignal.timeout(20000),
      });
      if (res.ok) { html = await res.text(); break; }
    } catch { continue; }
  }

  if (!html) throw new Error('Embed: All embed URLs failed');

  const formats: Format[] = [];
  const seen = new Set<string>();

  // Video patterns
  const videoPatterns = [
    /"video_url"\s*:\s*"([^"]+)"/g,
    /"playable_url"\s*:\s*"([^"]+)"/g,
    /src="(https?:\/\/[^"]+\.mp4[^"]*)"/g,
    /property="og:video(?::url)?"\s+content="([^"]+)"/gi,
    /content="([^"]+)"\s+property="og:video(?::url)?"/gi,
  ];

  for (const p of videoPatterns) {
    let m: RegExpExecArray | null;
    p.lastIndex = 0;
    while ((m = p.exec(html)) !== null) {
      const v = decodeIgUrl(m[1]);
      if (!seen.has(v) && (v.includes('fbcdn.net') || v.includes('cdninstagram.com'))) {
        seen.add(v);
        formats.push({ quality: `HD ${formats.length + 1}`, url: v, filesize: 'Unknown', ext: 'mp4' });
      }
    }
    if (formats.length > 0) break;
  }

  // Image fallback
  if (formats.length === 0) {
    const imgPatterns = [
      /"display_url"\s*:\s*"([^"]+)"/g,
      /property="og:image"\s+content="([^"]+)"/gi,
      /content="([^"]+)"\s+property="og:image"/gi,
    ];
    for (const p of imgPatterns) {
      let m: RegExpExecArray | null;
      p.lastIndex = 0;
      while ((m = p.exec(html)) !== null) {
        const v = decodeIgUrl(m[1]);
        if (!seen.has(v) && (v.includes('fbcdn.net') || v.includes('cdninstagram.com'))) {
          seen.add(v);
          formats.push({ quality: 'Image', url: v, filesize: 'Unknown', ext: 'jpg' });
          break;
        }
      }
      if (formats.length > 0) break;
    }
  }

  if (formats.length === 0) throw new Error('Embed: No media found');

  const titleMatch = html.match(/property="og:title"\s+content="([^"]+)"/i)
    || html.match(/content="([^"]+)"\s+property="og:title"/i)
    || html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch
    ? titleMatch[1].replace(/ on Instagram$/, '').replace(/ • Instagram.*$/, '').trim()
    : 'Instagram Media';

  const thumbMatch = html.match(/property="og:image"\s+content="([^"]+)"/i)
    || html.match(/content="([^"]+)"\s+property="og:image"/i);
  const thumbnail = thumbMatch ? decodeIgUrl(thumbMatch[1]) : '';

  return { title, thumbnail, formats };
}

// ══════════════════════════════════════════════════════════════════════════════
// METHOD 4: Cobalt v2 (Multiple instances)
// ══════════════════════════════════════════════════════════════════════════════
async function tryCobalt(url: string): Promise<MediaResult> {
  const instances = [
    'https://cobalt.api.lostfiles.online',
    'https://co.wuk.sh',
    'https://api.cobalt.tools',
  ];
  for (const base of instances) {
    try {
      const res = await fetch(`${base}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ url, videoQuality: 'max' }),
        signal: AbortSignal.timeout(12000),
      });
      if (!res.ok) continue;
      const data = await res.json() as any;
      if (!data.url && !data.picker) continue;

      const formats: Format[] = [];
      if (data.url) formats.push({ quality: 'HD', url: data.url, filesize: 'Unknown', ext: 'mp4' });
      if (data.picker) {
        (data.picker as any[]).forEach((item, i) => {
          if (item.url) formats.push({ quality: `Media ${i + 1}`, url: item.url, filesize: 'Unknown', ext: item.type === 'video' ? 'mp4' : 'jpg' });
        });
      }
      if (formats.length === 0) continue;
      return { title: 'Instagram Media', thumbnail: '', formats };
    } catch { continue; }
  }
  throw new Error('All Cobalt instances failed');
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN ORCHESTRATOR
// ══════════════════════════════════════════════════════════════════════════════
async function downloadInstagram(rawUrl: string): Promise<MediaResult> {
  const cleanUrl = rawUrl.split('?')[0].replace(/\/$/, '');

  // oEmbed for metadata enrichment (background)
  let oembedMeta: { title: string; thumbnail: string } | null = null;
  const oembedPromise = fetch(
    `https://www.instagram.com/api/v1/oembed/?url=${encodeURIComponent(cleanUrl)}&maxwidth=640`,
    { headers: { 'User-Agent': 'Mozilla/5.0 Chrome/123.0.0.0' }, signal: AbortSignal.timeout(8000) }
  ).then(r => r.json()).then((d: any) => {
    oembedMeta = { title: d.title || d.author_name || '', thumbnail: d.thumbnail_url || '' };
  }).catch(() => {});

  const methods = [
    { name: 'SnapInsta',      fn: () => trySnapInsta(cleanUrl) },
    { name: 'SnapSave',       fn: () => trySnapSave(cleanUrl) },
    { name: 'GraphQL Embed',  fn: () => tryInstagramEmbed(cleanUrl) },
    { name: 'Cobalt v2',      fn: () => tryCobalt(cleanUrl) },
  ];

  const errors: string[] = [];

  for (const method of methods) {
    try {
      const result = await method.fn();
      console.log(`[IG] ✅ ${method.name} succeeded`);

      // Enrich metadata
      await Promise.race([oembedPromise, new Promise(r => setTimeout(r, 800))]);
      if (oembedMeta) {
        if (!result.title || result.title === 'Instagram Media') result.title = (oembedMeta as any).title || result.title;
        if (!result.thumbnail) result.thumbnail = (oembedMeta as any).thumbnail;
      }

      return result;
    } catch (e: any) {
      console.warn(`[IG] ⚠️ ${method.name} failed: ${e.message}`);
      errors.push(`${method.name}: ${e.message}`);
    }
  }

  throw new Error(`All methods failed:\n${errors.join('\n')}`);
}

// ══════════════════════════════════════════════════════════════════════════════
// NEXT.JS ROUTE HANDLERS
// ══════════════════════════════════════════════════════════════════════════════
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { url } = body as { url?: string };

    if (!url || !url.includes('instagram.com')) {
      return NextResponse.json(
        { success: false, error: 'Valid Instagram URL required' },
        { status: 400, headers: CORS }
      );
    }

    const result = await downloadInstagram(url);
    return NextResponse.json({ success: true, data: result }, { status: 200, headers: CORS });

  } catch (err: any) {
    console.error('[IG] Fatal:', err.message);
    return NextResponse.json(
      {
        success: false,
        error: 'Could not download. The account may be private or the post unavailable.',
        details: err.message,
      },
      { status: 500, headers: CORS }
    );
  }
}
