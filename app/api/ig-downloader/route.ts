import { NextResponse } from 'next/server';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

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

// ── Shortcode বের করা ─────────────────────────────────────────────────────────
function extractShortcode(url: string): string | null {
  const m = url.match(/\/(p|reel|tv|reels)\/([A-Za-z0-9_-]{6,})/);
  return m ? m[2] : null;
}

// ── Instagram JSON escape decode ──────────────────────────────────────────────
function decodeIgStr(s: string): string {
  return s
    .replace(/\\u0026/gi, '&')
    .replace(/\\u003D/gi, '=')
    .replace(/\\u003C/gi, '<')
    .replace(/\\u003E/gi, '>')
    .replace(/\\u002F/gi, '/')
    .replace(/\\\//g, '/')
    .replace(/&amp;/g, '&');
}

// ══════════════════════════════════════════════════════════════════════════════
// METHOD 1: Instagram Embed Page — সবচেয়ে নির্ভরযোগ্য (Googlebot UA)
// ══════════════════════════════════════════════════════════════════════════════
async function tryEmbedPage(url: string): Promise<MediaResult> {
  const shortcode = extractShortcode(url);
  if (!shortcode) throw new Error('shortcode বের করা যায়নি');

  const tryUrls = [
    `https://www.instagram.com/p/${shortcode}/embed/captioned/`,
    `https://www.instagram.com/p/${shortcode}/embed/`,
  ];

  let html = '';
  for (const u of tryUrls) {
    const r = await fetch(u, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
      signal: AbortSignal.timeout(20000),
    });
    if (r.ok) { html = await r.text(); break; }
  }
  if (!html) throw new Error('Embed page load failed');

  const formats: Format[] = [];
  const seen = new Set<string>();

  // ── ভিডিও URL খোঁজা ─────────────────────────────────────────────────────
  // Pattern 1: video_url JSON key (সবচেয়ে common)
  const vp1 = /"video_url"\s*:\s*"([^"]+)"/g;
  // Pattern 2: playable_url
  const vp2 = /"playable_url"\s*:\s*"([^"]+)"/g;
  // Pattern 3: og:video meta
  const vp3 = /property="og:video(?::url)?"\s+content="([^"]+)"/gi;
  const vp3b = /content="([^"]+)"\s+property="og:video(?::url)?"/gi;
  // Pattern 4: src .mp4
  const vp4 = /src="(https?:\/\/[^"]+\.mp4[^"]*)"/g;
  // Pattern 5: contentUrl (JSON-LD)
  const vp5 = /"contentUrl"\s*:\s*"([^"]+)"/g;

  for (const pat of [vp1, vp2, vp3, vp3b, vp4, vp5]) {
    let m: RegExpExecArray | null;
    pat.lastIndex = 0;
    while ((m = pat.exec(html)) !== null) {
      const v = decodeIgStr(m[1]);
      if (!seen.has(v) && (v.includes('fbcdn.net') || v.includes('cdninstagram.com') || v.includes('.mp4'))) {
        seen.add(v);
        formats.push({ quality: 'HD Video', url: v, filesize: 'Unknown', ext: 'mp4' });
      }
    }
    if (formats.length > 0) break;
  }

  // ── ছবি URL (ভিডিও না পেলে) ──────────────────────────────────────────────
  if (formats.length === 0) {
    const ip1 = /"display_url"\s*:\s*"([^"]+)"/g;
    const ip2 = /property="og:image"\s+content="([^"]+)"/gi;
    const ip2b = /content="([^"]+)"\s+property="og:image"/gi;

    for (const pat of [ip1, ip2, ip2b]) {
      let m: RegExpExecArray | null;
      pat.lastIndex = 0;
      while ((m = pat.exec(html)) !== null) {
        const v = decodeIgStr(m[1]);
        if (!seen.has(v) && (v.includes('fbcdn.net') || v.includes('cdninstagram.com'))) {
          seen.add(v);
          formats.push({ quality: 'Full Resolution Image', url: v, filesize: 'Unknown', ext: 'jpg' });
          break;
        }
      }
      if (formats.length > 0) break;
    }
  }

  // ── Carousel/Sidecar ────────────────────────────────────────────────────────
  // carousel এর ক্ষেত্রে একাধিক আইটেম থাকতে পারে
  const sidecarRaw = html.match(/"edge_sidecar_to_children".*?"edges"\s*:\s*(\[.*?\])\s*\}/s);
  if (sidecarRaw) {
    try {
      const edges = JSON.parse(sidecarRaw[1]);
      edges.forEach((edge: any, i: number) => {
        const node = edge?.node;
        const vu = node?.video_url ? decodeIgStr(node.video_url) : null;
        const iu = node?.display_url ? decodeIgStr(node.display_url) : null;
        if (vu && !seen.has(vu)) {
          seen.add(vu);
          formats.push({ quality: `Video ${i + 1}`, url: vu, filesize: 'Unknown', ext: 'mp4' });
        } else if (iu && !seen.has(iu)) {
          seen.add(iu);
          formats.push({ quality: `Image ${i + 1}`, url: iu, filesize: 'Unknown', ext: 'jpg' });
        }
      });
    } catch { /* ignore */ }
  }

  if (formats.length === 0) throw new Error('Embed: কোনো মিডিয়া URL পাওয়া যায়নি');

  const tm = html.match(/property="og:title"\s+content="([^"]+)"/i)
    || html.match(/content="([^"]+)"\s+property="og:title"/i)
    || html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = tm ? tm[1].replace(/ on Instagram$/, '').replace(/ • Instagram.*$/, '').trim() : 'Instagram Media';

  const thm = html.match(/property="og:image"\s+content="([^"]+)"/i)
    || html.match(/content="([^"]+)"\s+property="og:image"/i)
    || html.match(/"thumbnail_src"\s*:\s*"([^"]+)"/);
  const thumbnail = thm ? decodeIgStr(thm[1]) : '';

  return { title, thumbnail, formats };
}

// ══════════════════════════════════════════════════════════════════════════════
// METHOD 2: SnapInsta.to (action.php reverse-engineered)
// ══════════════════════════════════════════════════════════════════════════════
async function trySnapInsta(url: string): Promise<MediaResult> {
  const homeRes = await fetch('https://snapinsta.to/', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/123.0.0.0 Safari/537.36',
      'Accept': 'text/html',
    },
    signal: AbortSignal.timeout(15000),
  });
  const setCookie = homeRes.headers.get('set-cookie') || '';
  const cookieStr = setCookie.split(',').map(c => c.split(';')[0].trim()).filter(Boolean).join('; ');
  const homeHtml = await homeRes.text();
  const tokenMatch = homeHtml.match(/name="token"\s+value="([^"]+)"/i)
    || homeHtml.match(/["']token["']\s*:\s*["']([^"']+)["']/i);
  const token = tokenMatch?.[1] || '';

  const form = new URLSearchParams({ url, token, lang: 'en', button: '' });
  const res = await fetch('https://snapinsta.to/action.php', {
    method: 'POST',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/123.0.0.0 Safari/537.36',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest',
      'Accept': '*/*',
      'Origin': 'https://snapinsta.to',
      'Referer': 'https://snapinsta.to/',
      ...(cookieStr ? { Cookie: cookieStr } : {}),
    },
    body: form.toString(),
    signal: AbortSignal.timeout(20000),
  });

  if (!res.ok) throw new Error(`SnapInsta ${res.status}`);
  const ct = res.headers.get('content-type') || '';

  let html = '';
  let jsonData: any = null;

  if (ct.includes('application/json')) {
    jsonData = await res.json();
    if (typeof jsonData?.data === 'string') html = jsonData.data;
    else if (jsonData?.data?.medias) {
      const formats: Format[] = jsonData.data.medias
        .filter((m: any) => m?.url)
        .map((m: any, i: number) => ({
          quality: m.quality || `HD ${i + 1}`,
          url: m.url,
          filesize: m.size || 'Unknown',
          ext: m.extension || 'mp4',
        }));
      if (formats.length === 0) throw new Error('SnapInsta: no medias');
      return { title: jsonData.data.title || 'Instagram Media', thumbnail: jsonData.data.thumbnail || '', formats };
    }
  } else {
    html = await res.text();
  }

  if (!html) throw new Error('SnapInsta: empty response');

  // HTML에서 링크 추출
  const formats: Format[] = [];
  const seen = new Set<string>();
  const cdnRe = /https?:\/\/[a-z0-9\-]+\.(?:cdninstagram\.com|fbcdn\.net)\/[^\s"'<>\\]+/gi;
  let m: RegExpExecArray | null;
  while ((m = cdnRe.exec(html)) !== null) {
    let u = decodeIgStr(m[0].replace(/["'>\s]+$/, ''));
    if (seen.has(u)) continue;
    seen.add(u);
    const isVid = u.includes('.mp4') || u.includes('video');
    formats.push({ quality: isVid ? 'HD Video' : 'Image', url: u, filesize: 'Unknown', ext: isVid ? 'mp4' : 'jpg' });
  }

  if (formats.length === 0) throw new Error('SnapInsta: no links in HTML');

  const thumbM = html.match(/src="(https?:\/\/[^"]+(?:fbcdn|cdninstagram)[^"]+\.jpg[^"]*)"/i);
  return { title: 'Instagram Media', thumbnail: thumbM ? decodeIgStr(thumbM[1]) : '', formats };
}

// ══════════════════════════════════════════════════════════════════════════════
// METHOD 3: SnapSave.app
// ══════════════════════════════════════════════════════════════════════════════
async function trySnapSave(url: string): Promise<MediaResult> {
  const homeRes = await fetch('https://snapsave.app/', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/123.0.0.0 Safari/537.36', 'Accept': 'text/html' },
    signal: AbortSignal.timeout(15000),
  });
  const setCookie = homeRes.headers.get('set-cookie') || '';
  const cookieStr = setCookie.split(',').map(c => c.split(';')[0].trim()).filter(Boolean).join('; ');
  const homeHtml = await homeRes.text();
  const tokenMatch = homeHtml.match(/name="token"\s+value="([^"]+)"/i)
    || homeHtml.match(/["']token["']\s*:\s*["']([^"']+)["']/i);
  const token = tokenMatch?.[1] || '';

  const form = new URLSearchParams({ url, ...(token ? { token } : {}) });
  const res = await fetch('https://snapsave.app/action.php', {
    method: 'POST',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/123.0.0.0 Safari/537.36',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest',
      'Accept': '*/*',
      'Origin': 'https://snapsave.app',
      'Referer': 'https://snapsave.app/',
      ...(cookieStr ? { Cookie: cookieStr } : {}),
    },
    body: form.toString(),
    signal: AbortSignal.timeout(20000),
  });

  if (!res.ok) throw new Error(`SnapSave ${res.status}`);
  const ct = res.headers.get('content-type') || '';
  let html = '';

  if (ct.includes('application/json')) {
    const d = await res.json() as any;
    if (typeof d?.data === 'string') html = d.data;
    else if (d?.data?.medias) {
      const formats: Format[] = d.data.medias.filter((m: any) => m?.url).map((m: any, i: number) => ({
        quality: m.quality || `HD ${i + 1}`, url: m.url, filesize: m.size || 'Unknown', ext: m.extension || 'mp4',
      }));
      if (formats.length === 0) throw new Error('SnapSave: no medias');
      return { title: d.data.title || 'Instagram Media', thumbnail: d.data.thumbnail || '', formats };
    }
  } else {
    html = await res.text();
  }

  if (!html) throw new Error('SnapSave: empty response');

  const formats: Format[] = [];
  const seen = new Set<string>();
  const cdnRe = /https?:\/\/[a-z0-9\-]+\.(?:cdninstagram\.com|fbcdn\.net)\/[^\s"'<>\\]+/gi;
  let m: RegExpExecArray | null;
  while ((m = cdnRe.exec(html)) !== null) {
    let u = decodeIgStr(m[0].replace(/["'>\s]+$/, ''));
    if (seen.has(u)) continue;
    seen.add(u);
    const isVid = u.includes('.mp4') || u.includes('video');
    formats.push({ quality: isVid ? 'HD Video' : 'Image', url: u, filesize: 'Unknown', ext: isVid ? 'mp4' : 'jpg' });
  }

  if (formats.length === 0) throw new Error('SnapSave: no links');
  return { title: 'Instagram Media', thumbnail: '', formats };
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN ORCHESTRATOR
// ══════════════════════════════════════════════════════════════════════════════
async function downloadInstagram(rawUrl: string): Promise<MediaResult> {
  const cleanUrl = rawUrl.split('?')[0].replace(/\/$/, '');

  const methods = [
    { name: 'GraphQL Embed', fn: () => tryEmbedPage(cleanUrl) },
    { name: 'SnapInsta',     fn: () => trySnapInsta(cleanUrl) },
    { name: 'SnapSave',      fn: () => trySnapSave(cleanUrl) },
  ];

  const errors: string[] = [];
  for (const method of methods) {
    try {
      const result = await method.fn();
      console.log(`[IG] ✅ ${method.name} succeeded`);
      return result;
    } catch (e: any) {
      console.warn(`[IG] ⚠️ ${method.name} failed: ${e.message}`);
      errors.push(`${method.name}: ${e.message}`);
    }
  }
  throw new Error(errors.join(' | '));
}

// ══════════════════════════════════════════════════════════════════════════════
// PROXY DOWNLOAD ENDPOINT — Direct download এর জন্য
// GET /api/ig-downloader?proxyUrl=...&filename=...
// ══════════════════════════════════════════════════════════════════════════════
async function handleProxyDownload(req: Request): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const proxyUrl = searchParams.get('proxyUrl');
  const filename  = searchParams.get('filename') || 'instagram-media';

  if (!proxyUrl) {
    return NextResponse.json({ error: 'proxyUrl required' }, { status: 400, headers: CORS });
  }

  // শুধুমাত্র Instagram CDN URL অনুমতি দেওয়া
  const allowed = ['fbcdn.net', 'cdninstagram.com', 'instagram.com'];
  const isAllowed = allowed.some(d => proxyUrl.includes(d));
  if (!isAllowed) {
    return NextResponse.json({ error: 'Unauthorized URL' }, { status: 403, headers: CORS });
  }

  const upstream = await fetch(proxyUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      'Referer': 'https://www.instagram.com/',
      'Accept': '*/*',
    },
    signal: AbortSignal.timeout(60000),
  });

  if (!upstream.ok) {
    return NextResponse.json({ error: `Upstream ${upstream.status}` }, { status: 502, headers: CORS });
  }

  const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
  const ext = contentType.includes('video') ? 'mp4' : 'jpg';
  const safeFilename = filename.replace(/[^a-zA-Z0-9_\-\.]/g, '_');

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      ...CORS,
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${safeFilename}.${ext}"`,
      'Cache-Control': 'no-store',
    },
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// NEXT.JS ROUTE HANDLERS
// ══════════════════════════════════════════════════════════════════════════════
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS });
}

export async function GET(req: Request) {
  return handleProxyDownload(req);
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
      { success: false, error: 'মিডিয়া পাওয়া যায়নি। পোস্টটি প্রাইভেট হতে পারে।', details: err.message },
      { status: 500, headers: CORS }
    );
  }
}
