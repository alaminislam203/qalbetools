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
// Helper: Extract video URLs from fdown.net HTML
// ============================
function parseFdownHtml(html: string) {
  const formats: { quality: string; url: string; filesize: string }[] = [];

  // fdown.net returns anchor tags like: <a href="...cdn-url..." ...>Download SD</a>
  const linkRegex = /<a[^>]+href="(https:\/\/[^"]+)"[^>]*>\s*(Download [^<]+)\s*<\/a>/gi;
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    const rawUrl = match[1];
    const label  = match[2].trim();
    if (!rawUrl.includes('facebook') && !rawUrl.includes('fbcdn') && !rawUrl.startsWith('https://')) continue;
    const quality = label.replace('Download ', '').trim(); // "SD" | "HD"
    if (quality) {
      formats.push({ quality, url: rawUrl, filesize: 'Unknown' });
    }
  }

  // title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].replace(' - FDown.net', '').trim() : 'Facebook Video';

  // thumbnail
  const thumbMatch = html.match(/<img[^>]+src="(https:\/\/[^"]+)"[^>]*class="[^"]*thumbnail[^"]*"/i)
    || html.match(/og:image[^>]+content="([^"]+)"/i)
    || html.match(/<img[^>]+src="(https:\/\/[^"]+fbcdn[^"]+)"/i);
  const thumbnail = thumbMatch ? thumbMatch[1] : '';

  return { title, thumbnail, formats };
}

// ============================
// Helper: Extract video URLs from snapsave.app HTML
// ============================
function parseSnapsaveHtml(html: string) {
  const formats: { quality: string; url: string; filesize: string }[] = [];

  // snapsave returns links like: <a href="...cdn..." ...> SD Video </a>
  const linkRegex = /<a[^>]+href="(https?:\/\/[^"]+)"[^>]*class="[^"]*btn[^"]*"[^>]*>\s*([^<]+)\s*<\/a>/gi;
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    const rawUrl = match[1];
    const label  = match[2].trim();
    if (rawUrl.includes('snapsave') || rawUrl.includes('javascript')) continue;
    if (label.toLowerCase().includes('hd') || label.toLowerCase().includes('sd') || label.toLowerCase().includes('download')) {
      const quality = label.includes('HD') ? 'HD' : label.includes('SD') ? 'SD' : 'Auto';
      formats.push({ quality, url: rawUrl, filesize: 'Unknown' });
    }
  }

  const thumbMatch = html.match(/<img[^>]+src="(https:\/\/[^"]+)"[^>]*style="[^"]*width:\s*160/i)
    || html.match(/<img[^>]+src="(https:\/\/[^"]+fbcdn[^"]+)"/i);
  const thumbnail = thumbMatch ? thumbMatch[1] : '';

  return { thumbnail, formats };
}

// ============================
// Method 1: fdown.net
// ============================
async function tryFdown(videoUrl: string) {
  const form = new URLSearchParams({ URLz: videoUrl });

  const res = await fetch('https://fdown.net/download.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': UA,
      'Referer': 'https://fdown.net/',
      'Origin': 'https://fdown.net',
    },
    body: form.toString(),
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) throw new Error(`fdown.net returned ${res.status}`);
  const html = await res.text();
  const parsed = parseFdownHtml(html);

  if (parsed.formats.length === 0) throw new Error('fdown.net: no download links found');
  return parsed;
}

// ============================
// Method 2: snapsave.app
// ============================
async function trySnapsave(videoUrl: string) {
  // Step 1: GET homepage to grab token
  const homeRes = await fetch('https://snapsave.app/', {
    headers: { 'User-Agent': UA },
    signal: AbortSignal.timeout(10000),
  });
  const homeHtml = await homeRes.text();

  const tokenMatch = homeHtml.match(/name="token"\s+value="([^"]+)"/i);
  const token = tokenMatch ? tokenMatch[1] : '';

  const form = new URLSearchParams({ url: videoUrl, token });

  const res = await fetch('https://snapsave.app/action.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': UA,
      'Referer': 'https://snapsave.app/',
      'Origin': 'https://snapsave.app',
    },
    body: form.toString(),
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) throw new Error(`snapsave returned ${res.status}`);
  const html = await res.text();
  const parsed = parseSnapsaveHtml(html);

  if (parsed.formats.length === 0) throw new Error('snapsave: no download links found');
  return { title: 'Facebook Video', ...parsed };
}

// ============================
// Method 3: youtube-dl-exec (yt-dlp)
// ============================
async function tryYtdlp(videoUrl: string) {
  const youtubedl = (await import('youtube-dl-exec')).default;

  const output = await youtubedl(videoUrl, {
    dumpSingleJson: true,
    noCheckCertificates: true,
    noWarnings: true,
    preferFreeFormats: true,
    addHeader: [
      'referer:https://www.facebook.com',
      `user-agent:${UA}`,
    ],
  }) as any;

  const formats = (output.formats || [])
    .filter((f: any) => f.vcodec !== 'none' && f.ext === 'mp4')
    .map((f: any) => ({
      quality: f.format_note || (f.height ? `${f.height}p` : 'HD'),
      url: f.url,
      filesize: f.filesize
        ? (f.filesize / 1024 / 1024).toFixed(2) + ' MB'
        : 'Unknown',
    }))
    .sort((a: any, b: any) => parseInt(b.quality) - parseInt(a.quality));

  if (formats.length === 0) throw new Error('yt-dlp: no video formats found');

  return {
    title:     output.title     || 'Facebook Video',
    thumbnail: output.thumbnail || '',
    formats,
  };
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

    // ── Method 1: fdown.net ──────────────────────────────────
    try {
      result = await tryFdown(url);
      console.log('[FB] ✅ fdown.net succeeded');
    } catch (e: any) {
      console.warn('[FB] ⚠️ fdown.net failed:', e.message);
      errors.push('fdown: ' + e.message);
    }

    // ── Method 2: snapsave.app ───────────────────────────────
    if (!result) {
      try {
        result = await trySnapsave(url);
        console.log('[FB] ✅ snapsave.app succeeded');
      } catch (e: any) {
        console.warn('[FB] ⚠️ snapsave.app failed:', e.message);
        errors.push('snapsave: ' + e.message);
      }
    }

    // ── Method 3: yt-dlp ────────────────────────────────────
    if (!result) {
      try {
        result = await tryYtdlp(url);
        console.log('[FB] ✅ yt-dlp succeeded');
      } catch (e: any) {
        console.warn('[FB] ⚠️ yt-dlp failed:', e.message);
        errors.push('ytdlp: ' + e.message);
      }
    }

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error:
            'All download methods failed. The video may be private, deleted, or georestricted.',
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
