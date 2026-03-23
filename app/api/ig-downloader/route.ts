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
];
const UA = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

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

// ══════════════════════════════════════════════════════════════════════════════
// METHOD 1 ★ Instagram Embed Page (Proven working - GraphQL Embed)
// ══════════════════════════════════════════════════════════════════════════════
async function tryInstagramEmbed(url: string): Promise<MediaResult> {
  const shortcode = extractShortcode(url);
  if (!shortcode) throw new Error('Embed: Cannot extract shortcode from URL');

  // Try both embed variants
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
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
        },
        signal: AbortSignal.timeout(20000),
      });
      if (res.ok) {
        html = await res.text();
        break;
      }
    } catch { continue; }
  }

  if (!html) throw new Error('Embed: All embed URLs failed');

  const formats: Format[] = [];
  const seenUrls = new Set<string>();

  // ── Extract Video URLs ───────────────────────────────────────────
  const videoPatterns = [
    /"video_url"\s*:\s*"([^"]+)"/g,
    /"playable_url"\s*:\s*"([^"]+)"/g,
    /src="(https?:\/\/[^"]+\.mp4[^"]*)"/g,
    /property="og:video(?::url)?"\s+content="([^"]+)"/gi,
    /content="([^"]+)"\s+property="og:video(?::url)?"/gi,
  ];

  for (const pattern of videoPatterns) {
    let m: RegExpExecArray | null;
    pattern.lastIndex = 0;
    while ((m = pattern.exec(html)) !== null) {
      const videoUrl = decodeIgUrl(m[1]);
      if (
        !seenUrls.has(videoUrl) &&
        (videoUrl.includes('fbcdn.net') || videoUrl.includes('cdninstagram.com') || videoUrl.includes('.mp4'))
      ) {
        seenUrls.add(videoUrl);
        formats.push({ quality: `HD ${formats.length + 1}`, url: videoUrl, filesize: 'Unknown', ext: 'mp4' });
      }
    }
    if (formats.length > 0) break;
  }

  // ── Extract Image URLs (if no video) ────────────────────────────
  if (formats.length === 0) {
    const imagePatterns = [
      /"display_url"\s*:\s*"([^"]+)"/g,
      /property="og:image"\s+content="([^"]+)"/gi,
      /content="([^"]+)"\s+property="og:image"/gi,
      /"thumbnail_src"\s*:\s*"([^"]+)"/g,
    ];

    for (const pattern of imagePatterns) {
      let m: RegExpExecArray | null;
      pattern.lastIndex = 0;
      while ((m = pattern.exec(html)) !== null) {
        const imageUrl = decodeIgUrl(m[1]);
        if (
          !seenUrls.has(imageUrl) &&
          (imageUrl.includes('fbcdn.net') || imageUrl.includes('cdninstagram.com'))
        ) {
          seenUrls.add(imageUrl);
          formats.push({ quality: 'Image', url: imageUrl, filesize: 'Unknown', ext: 'jpg' });
          break;
        }
      }
      if (formats.length > 0) break;
    }
  }

  // ── Extract carousel/sidecar items ──────────────────────────────
  if (formats.length <= 1) {
    const sidecarMatch = html.match(/"edge_sidecar_to_children"\s*:\s*\{[^}]+"edges"\s*:\s*(\[[^\]]+\])/);
    if (sidecarMatch) {
      try {
        const edges = JSON.parse(sidecarMatch[1]);
        edges.forEach((edge: any, i: number) => {
          const node = edge.node;
          if (node?.video_url && !seenUrls.has(node.video_url)) {
            seenUrls.add(node.video_url);
            formats.push({ quality: `Video ${i + 1}`, url: decodeIgUrl(node.video_url), filesize: 'Unknown', ext: 'mp4' });
          } else if (node?.display_url && !seenUrls.has(node.display_url)) {
            seenUrls.add(node.display_url);
            formats.push({ quality: `Image ${i + 1}`, url: decodeIgUrl(node.display_url), filesize: 'Unknown', ext: 'jpg' });
          }
        });
      } catch { /* ignore parse error */ }
    }
  }

  if (formats.length === 0) throw new Error('Embed: No media URLs found in embed page');

  // ── Metadata ─────────────────────────────────────────────────────
  const titleMatch =
    html.match(/property="og:title"\s+content="([^"]+)"/i) ||
    html.match(/content="([^"]+)"\s+property="og:title"/i) ||
    html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch
    ? titleMatch[1].replace(/ on Instagram$/, '').replace(/ • Instagram.*$/, '').trim()
    : 'Instagram Media';

  const thumbMatch =
    html.match(/property="og:image"\s+content="([^"]+)"/i) ||
    html.match(/content="([^"]+)"\s+property="og:image"/i) ||
    html.match(/"thumbnail_src"\s*:\s*"([^"]+)"/);
  const thumbnail = thumbMatch ? decodeIgUrl(thumbMatch[1]) : '';

  return { title, thumbnail, formats };
}

// ══════════════════════════════════════════════════════════════════════════════
// METHOD 2: Instagram oEmbed (Official - metadata enrichment)
// ══════════════════════════════════════════════════════════════════════════════
async function tryOEmbed(url: string): Promise<{ title: string; thumbnail: string }> {
  const apiUrl = `https://www.instagram.com/api/v1/oembed/?url=${encodeURIComponent(url)}&maxwidth=640`;
  const res = await fetch(apiUrl, {
    headers: { 'User-Agent': UA, 'Accept': 'application/json' },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`oEmbed ${res.status}`);
  const data = await res.json() as any;
  return {
    title: data.title || data.author_name || '',
    thumbnail: data.thumbnail_url || '',
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// METHOD 3: Cobalt v2 (Multiple instances fallback)
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
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': UA,
        },
        body: JSON.stringify({ url, videoQuality: 'max', filenameStyle: 'pretty' }),
        signal: AbortSignal.timeout(12000),
      });

      if (!res.ok) continue;
      const data = await res.json() as any;
      if (data.status === 'error' || (!data.url && !data.picker)) continue;

      const formats: Format[] = [];
      if (data.url) {
        formats.push({ quality: 'HD', url: data.url, filesize: 'Unknown', ext: 'mp4' });
      }
      if (data.picker) {
        (data.picker as any[]).forEach((item, i) => {
          if (item.url) {
            formats.push({
              quality: `Media ${i + 1}`,
              url: item.url,
              filesize: 'Unknown',
              ext: item.type === 'video' ? 'mp4' : 'jpg',
            });
          }
        });
      }
      if (formats.length === 0) continue;
      console.log(`[IG] ✅ Cobalt succeeded via ${base}`);
      return { title: 'Instagram Media', thumbnail: '', formats };
    } catch { continue; }
  }
  throw new Error('All Cobalt instances failed');
}

// ══════════════════════════════════════════════════════════════════════════════
// METHOD 4: igram.world (lightweight third-party)
// ══════════════════════════════════════════════════════════════════════════════
async function tryIgram(url: string): Promise<MediaResult> {
  const res = await fetch('https://igram.world/api/convert', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'User-Agent': UA,
      'Referer': 'https://igram.world/',
      'Origin': 'https://igram.world',
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: `link=${encodeURIComponent(url)}&token=`,
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) throw new Error(`igram returned ${res.status}`);
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) throw new Error('igram: Non-JSON response');

  const data = await res.json() as any;
  if (!data || (!Array.isArray(data) && !data.url)) throw new Error('igram: No data');

  const formats: Format[] = [];
  const items = Array.isArray(data) ? data : [data];
  items.forEach((item: any, i: number) => {
    const mediaUrl = item.url || item.download_url || item.src;
    if (mediaUrl) {
      const isVideo = (item.type || '').includes('video') || mediaUrl.includes('.mp4');
      formats.push({
        quality: isVideo ? `HD ${i + 1}` : `Image ${i + 1}`,
        url: mediaUrl,
        filesize: item.size ? `${(item.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown',
        ext: isVideo ? 'mp4' : 'jpg',
      });
    }
  });

  if (formats.length === 0) throw new Error('igram: No formats extracted');
  return { title: 'Instagram Media', thumbnail: '', formats };
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN ORCHESTRATOR
// ══════════════════════════════════════════════════════════════════════════════
async function downloadInstagram(rawUrl: string): Promise<MediaResult> {
  const cleanUrl = rawUrl.split('?')[0].replace(/\/$/, '');

  // Kick off oEmbed in background for metadata enrichment
  let oembedMeta: { title: string; thumbnail: string } | null = null;
  const oembedPromise = tryOEmbed(cleanUrl)
    .then(m => { oembedMeta = m; })
    .catch(() => {});

  const methods = [
    { name: 'GraphQL Embed', fn: () => tryInstagramEmbed(cleanUrl) },
    { name: 'Cobalt v2',     fn: () => tryCobalt(cleanUrl) },
    { name: 'igram.world',   fn: () => tryIgram(cleanUrl) },
  ];

  const errors: string[] = [];

  for (const method of methods) {
    try {
      const result = await method.fn();
      console.log(`[IG] ✅ ${method.name} succeeded`);

      // Wait briefly for oEmbed metadata
      await Promise.race([oembedPromise, new Promise(r => setTimeout(r, 1000))]);

      // Enrich with oEmbed if scraper got generic values
      if (oembedMeta) {
        if (!result.title || result.title === 'Instagram Media') {
          result.title = oembedMeta.title || result.title;
        }
        if (!result.thumbnail) {
          result.thumbnail = oembedMeta.thumbnail;
        }
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
        error: 'Could not download this media. The account may be private or the post unavailable.',
        details: err.message,
      },
      { status: 500, headers: CORS }
    );
  }
}
