import { NextResponse } from 'next/server';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// ── Rotating User-Agents ──────────────────────────────────────────────────────
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
];
const UA = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

// ── Shortcode extractor ───────────────────────────────────────────────────────
function extractShortcode(url: string): string | null {
  const m = url.match(/\/(p|reel|tv|reels)\/([A-Za-z0-9_-]{6,})/);
  return m ? m[2] : null;
}

// ── URL decoder ───────────────────────────────────────────────────────────────
function decodeUrl(url: string): string {
  try {
    const decoded = url
      .replace(/\\u0026/gi, '&')
      .replace(/\\u003D/gi, '=')
      .replace(/\\u002F/gi, '/')
      .replace(/\\\//g, '/')
      .replace(/\\n/g, '')
      .replace(/\\/g, '');
    return decodeURIComponent(decoded);
  } catch {
    return url;
  }
}

// ── Interfaces ────────────────────────────────────────────────────────────────
interface Format {
  quality: string;
  url: string;
  filesize: string;
  ext?: string;
}

interface MediaResult {
  title: string;
  thumbnail: string;
  formats: Format[];
}

// ══════════════════════════════════════════════════════════════════════════════
// METHOD 1: SnapSave API (Most Reliable)
// ══════════════════════════════════════════════════════════════════════════════
async function trySnapSave(url: string): Promise<MediaResult> {
  const formData = new URLSearchParams();
  formData.append('url', url);

  const res = await fetch('https://snapsave.app/action.php', {
    method: 'POST',
    headers: {
      'User-Agent': UA,
      'Referer': 'https://snapsave.app/',
      'Origin': 'https://snapsave.app',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    body: formData.toString(),
    signal: AbortSignal.timeout(20000),
  });

  if (!res.ok) throw new Error(`SnapSave returned ${res.status}`);
  const html = await res.text();

  const formats: Format[] = [];

  // Extract video download links
  const videoRegex = /href="(https?:\/\/[^"]+(?:fbcdn\.net|instagram\.com)[^"]+)"/gi;
  let match;
  let count = 1;
  while ((match = videoRegex.exec(html)) !== null) {
    const mediaUrl = decodeUrl(match[1]);
    if (mediaUrl.includes('.mp4') || mediaUrl.includes('video')) {
      formats.push({ quality: `HD ${count}`, url: mediaUrl, filesize: 'Unknown', ext: 'mp4' });
      count++;
    }
  }

  // If no video, look for images
  if (formats.length === 0) {
    const imgRegex = /href="(https?:\/\/[^"]+(?:fbcdn\.net|instagram\.com)[^"]+\.jpg[^"]*)"[^>]*download/gi;
    while ((match = imgRegex.exec(html)) !== null) {
      const mediaUrl = decodeUrl(match[1]);
      formats.push({ quality: 'Image', url: mediaUrl, filesize: 'Unknown', ext: 'jpg' });
    }
  }

  if (formats.length === 0) throw new Error('SnapSave: No media links found in response');

  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].replace(/\s*-\s*SnapSave.*$/i, '').trim() : 'Instagram Media';
  const thumbMatch = html.match(/<img[^>]+src="(https?:\/\/[^"]+(?:fbcdn\.net|instagram\.com)[^"]+\.jpg[^"]*)"[^>]*>/i);
  const thumbnail = thumbMatch ? decodeUrl(thumbMatch[1]) : '';

  return { title, thumbnail, formats };
}

// ══════════════════════════════════════════════════════════════════════════════
// METHOD 2: Instagram oEmbed API (Official - for thumbnail & title)
// ══════════════════════════════════════════════════════════════════════════════
async function tryOEmbed(url: string): Promise<{ title: string; thumbnail: string }> {
  const apiUrl = `https://www.instagram.com/api/v1/oembed/?url=${encodeURIComponent(url)}&maxwidth=640`;
  const res = await fetch(apiUrl, {
    headers: {
      'User-Agent': UA,
      'Accept': 'application/json',
    },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`oEmbed returned ${res.status}`);
  const data = await res.json() as any;
  return {
    title: data.title || data.author_name || 'Instagram Media',
    thumbnail: data.thumbnail_url || '',
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// METHOD 3: SaveIG.app (Alternative reliable scraper)
// ══════════════════════════════════════════════════════════════════════════════
async function trySaveIG(url: string): Promise<MediaResult> {
  const res = await fetch(`https://v3.saveig.app/api/ajaxSearch`, {
    method: 'POST',
    headers: {
      'User-Agent': UA,
      'Referer': 'https://saveig.app/',
      'Origin': 'https://saveig.app',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest',
      'Accept': '*/*',
    },
    body: `q=${encodeURIComponent(url)}&t=media&lang=en`,
    signal: AbortSignal.timeout(20000),
  });

  if (!res.ok) throw new Error(`SaveIG returned ${res.status}`);
  const data = await res.json() as any;

  if (!data?.data) throw new Error('SaveIG: Empty response');

  // Parse HTML from data.data
  const html: string = data.data;
  const formats: Format[] = [];

  // Extract download links from rendered HTML
  const linkRegex = /href="([^"]+)"[^>]*class="[^"]*btn[^"]*download[^"]*"/gi;
  const altLinkRegex = /download-url[^"]*"[^>]*href="([^"]+)"/gi;
  const genericLinkRegex = /<a[^>]+href="(https?:\/\/[^"]+(?:fbcdn\.net|cdninstagram\.com|instagram\.com)[^"]+)"[^>]*>/gi;

  let match;
  const seen = new Set<string>();
  
  for (const regex of [linkRegex, altLinkRegex, genericLinkRegex]) {
    while ((match = regex.exec(html)) !== null) {
      const mediaUrl = decodeUrl(match[1]);
      if (!seen.has(mediaUrl)) {
        seen.add(mediaUrl);
        const isVideo = mediaUrl.includes('.mp4') || mediaUrl.includes('video');
        formats.push({
          quality: isVideo ? `HD ${formats.length + 1}` : 'Image',
          url: mediaUrl,
          filesize: 'Unknown',
          ext: isVideo ? 'mp4' : 'jpg',
        });
      }
    }
    if (formats.length > 0) break;
  }

  if (formats.length === 0) throw new Error('SaveIG: No download links found');

  const thumbMatch = html.match(/<img[^>]+src="(https?:\/\/[^"]+)"[^>]*class="[^"]*thumb[^"]*"/i)
    || html.match(/<img[^>]+src="(https?:\/\/(?:[^"]+\.fbcdn\.net|[^"]+\.cdninstagram\.com)[^"]+)"/i);
  const thumbnail = thumbMatch ? decodeUrl(thumbMatch[1]) : '';
  const titleMatch = html.match(/<[^>]+class="[^"]*title[^"]*"[^>]*>([^<]+)</i);
  const title = titleMatch ? titleMatch[1].trim() : 'Instagram Media';

  return { title, thumbnail, formats };
}

// ══════════════════════════════════════════════════════════════════════════════
// METHOD 4: Cobalt API v2 (Updated endpoint)
// ══════════════════════════════════════════════════════════════════════════════
async function tryCobaltV2(url: string): Promise<MediaResult> {
  // Try multiple Cobalt instances
  const cobaltInstances = [
    'https://cobalt.api.lostfiles.online',
    'https://co.wuk.sh',
    'https://api.cobalt.tools',
  ];

  for (const base of cobaltInstances) {
    try {
      const res = await fetch(`${base}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': UA,
        },
        body: JSON.stringify({
          url,
          videoQuality: 'max',
          filenameStyle: 'pretty',
        }),
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) continue;
      const data = await res.json() as any;

      if (data.status === 'error' || (!data.url && !data.picker)) continue;

      const formats: Format[] = [];
      if (data.url) {
        formats.push({ quality: 'HD', url: data.url, filesize: 'Unknown', ext: 'mp4' });
      }
      if (data.picker) {
        (data.picker as any[]).forEach((item, idx) => {
          if (item.url) {
            formats.push({
              quality: `Media ${idx + 1}`,
              url: item.url,
              filesize: 'Unknown',
              ext: item.type === 'video' ? 'mp4' : 'jpg',
            });
          }
        });
      }

      if (formats.length === 0) continue;
      return { title: 'Instagram Media', thumbnail: '', formats };
    } catch {
      continue;
    }
  }

  throw new Error('All Cobalt instances failed');
}

// ══════════════════════════════════════════════════════════════════════════════
// METHOD 5: RapidAPI Instagram Downloader (via instagramsave or similar)
// ══════════════════════════════════════════════════════════════════════════════
async function tryInstaDownloader(url: string): Promise<MediaResult> {
  const shortcode = extractShortcode(url);
  if (!shortcode) throw new Error('InstaDownloader: Could not extract shortcode');

  const res = await fetch(`https://instagram-downloader-download-instagram-videos-stories.p.rapidapi.com/index?url=${encodeURIComponent(url)}`, {
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || '',
      'X-RapidAPI-Host': 'instagram-downloader-download-instagram-videos-stories.p.rapidapi.com',
      'User-Agent': UA,
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) throw new Error(`RapidAPI returned ${res.status}`);
  const data = await res.json() as any;

  if (!data?.media) throw new Error('RapidAPI: No media found');

  const formats: Format[] = [];
  if (Array.isArray(data.media)) {
    data.media.forEach((item: any, idx: number) => {
      formats.push({
        quality: item.quality || `HD ${idx + 1}`,
        url: item.url,
        filesize: 'Unknown',
        ext: item.type || 'mp4',
      });
    });
  } else if (data.media) {
    formats.push({ quality: 'HD', url: data.media, filesize: 'Unknown', ext: 'mp4' });
  }

  if (formats.length === 0) throw new Error('RapidAPI: Empty formats');

  return {
    title: data.title || 'Instagram Media',
    thumbnail: data.thumbnail || '',
    formats,
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// METHOD 6: Instagram GraphQL (Direct, no third-party)
// ══════════════════════════════════════════════════════════════════════════════
async function tryInstagramGraphQL(url: string): Promise<MediaResult> {
  const shortcode = extractShortcode(url);
  if (!shortcode) throw new Error('GraphQL: Could not extract shortcode');

  // Try Instagram's embed endpoint first (no auth needed)
  const embedRes = await fetch(`https://www.instagram.com/p/${shortcode}/embed/captioned/`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!embedRes.ok) throw new Error(`Embed page returned ${embedRes.status}`);
  const html = await embedRes.text();

  const formats: Format[] = [];

  // Look for video URL in embed page
  const videoPatterns = [
    /video_url":"(https?:\\u002F\\u002F[^"]+\.mp4[^"]*)/,
    /"video_url"\s*:\s*"([^"]+)"/,
    /src="(https?:\/\/[^"]+\.mp4[^"]*)"/,
  ];

  for (const pattern of videoPatterns) {
    const m = html.match(pattern);
    if (m) {
      const videoUrl = decodeUrl(m[1]);
      formats.push({ quality: 'HD', url: videoUrl, filesize: 'Unknown', ext: 'mp4' });
      break;
    }
  }

  // Look for image if no video
  if (formats.length === 0) {
    const imgPatterns = [
      /"display_url"\s*:\s*"([^"]+)"/,
      /property="og:image"\s+content="([^"]+)"/,
      /<img[^>]+class="[^"]*EmbeddedMediaImage[^"]*"[^>]+src="([^"]+)"/i,
    ];

    for (const pattern of imgPatterns) {
      const m = html.match(pattern);
      if (m) {
        const imageUrl = decodeUrl(m[1]);
        formats.push({ quality: 'Image', url: imageUrl, filesize: 'Unknown', ext: 'jpg' });
        break;
      }
    }
  }

  if (formats.length === 0) throw new Error('GraphQL Embed: No media found');

  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].replace(/ on Instagram$/, '').trim() : 'Instagram Media';
  const thumbMatch = html.match(/property="og:image"\s+content="([^"]+)"/i)
    || html.match(/"thumbnail_src"\s*:\s*"([^"]+)"/);
  const thumbnail = thumbMatch ? decodeUrl(thumbMatch[1]) : '';

  return { title, thumbnail, formats };
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN ORCHESTRATOR
// ══════════════════════════════════════════════════════════════════════════════
async function downloadInstagram(url: string): Promise<MediaResult> {
  // Normalize URL
  const cleanUrl = url.split('?')[0].replace(/\/$/, '');

  const methods = [
    { name: 'SaveIG', fn: () => trySaveIG(cleanUrl) },
    { name: 'SnapSave', fn: () => trySnapSave(cleanUrl) },
    { name: 'GraphQL Embed', fn: () => tryInstagramGraphQL(cleanUrl) },
    { name: 'Cobalt v2', fn: () => tryCobaltV2(cleanUrl) },
    { name: 'RapidAPI', fn: () => tryInstaDownloader(cleanUrl) },
  ];

  // Remove RapidAPI from list if no key configured
  const activeMethods = methods.filter(m => {
    if (m.name === 'RapidAPI' && !process.env.RAPIDAPI_KEY) return false;
    return true;
  });

  const errors: string[] = [];
  let partialResult: Partial<MediaResult> = {};

  // Try to get title/thumbnail from oEmbed in parallel
  tryOEmbed(cleanUrl)
    .then(meta => { partialResult = meta; })
    .catch(() => {});

  for (const method of activeMethods) {
    try {
      const result = await method.fn();
      console.log(`[IG] ✅ ${method.name} succeeded`);

      // Enrich with oEmbed metadata if available
      if (partialResult.title && !result.title.includes('Instagram Media')) {
        // keep scraper title
      } else if (partialResult.title) {
        result.title = partialResult.title;
      }
      if (!result.thumbnail && partialResult.thumbnail) {
        result.thumbnail = partialResult.thumbnail;
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

    return NextResponse.json(
      { success: true, data: result },
      { status: 200, headers: CORS }
    );
  } catch (err: any) {
    console.error('[IG] Fatal:', err.message);
    return NextResponse.json(
      {
        success: false,
        error: 'Could not download this media. The account may be private or the post unavailable.',
        details: err.message,
      },
      { status: 500, headers: CORS }
    );
  }
}