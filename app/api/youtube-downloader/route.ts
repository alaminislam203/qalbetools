import { NextResponse } from 'next/server';

export const maxDuration = 60;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// ── Timeout-safe fetch ────────────────────────────────────────────────────────
async function fetchSafe(url: string, init: RequestInit = {}, ms = 12000): Promise<Response> {
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
    const upstream = await fetchSafe(proxyUrl, { headers: { 'User-Agent': UA } }, 50000);
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
        videoId = urlObj.pathname.split('/')[1] || '';
        cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;
      } else {
        const v = urlObj.searchParams.get('v');
        if (v) {
          videoId = v;
          cleanUrl = `https://www.youtube.com/watch?v=${v}`;
        }
      }
    } catch { /* ignore */ }

    let formats: { quality: string; ext: string; url: string }[] = [];
    let title = 'YouTube Video';
    let thumbnail = videoId
      ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      : '';
    const errors: string[] = [];

    // ── Metadata: YouTube oEmbed ──────────────────────────────────────────────
    try {
      const r = await fetchSafe(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(cleanUrl)}&format=json`,
        { headers: { 'User-Agent': UA } },
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

    // ── ইঞ্জিন ১: VKR API ────────────────────────────────────────────────────
    try {
      console.log('Engine 1: VKR...');
      const r = await fetchSafe(
        `https://api.vkrdownloader.co.in/api?vkr=${encodeURIComponent(cleanUrl)}`,
        { headers: { 'User-Agent': UA, 'Accept': 'application/json' } },
        12000
      );
      if (r.ok) {
        const d = await r.json();
        if (d.data?.downloads && Array.isArray(d.data.downloads) && d.data.downloads.length > 0) {
          title = d.data.title || title;
          thumbnail = d.data.thumbnail || thumbnail;
          d.data.downloads.forEach((dl: any) => {
            if (!dl.url) return;
            const isAudio =
              dl.url.includes('.mp3') ||
              dl.quality?.toLowerCase().includes('audio') ||
              dl.ext === 'mp3';
            formats.push({
              quality: dl.quality || (isAudio ? 'Audio MP3' : 'Video MP4'),
              ext: isAudio ? 'mp3' : 'mp4',
              url: dl.url,
            });
          });
          console.log(`Engine 1 (VKR): ${formats.length} formats found`);
        } else {
          errors.push('Engine 1 (VKR): no downloads in response');
        }
      } else {
        errors.push(`Engine 1 (VKR): HTTP ${r.status}`);
      }
    } catch (e: any) {
      console.log('Engine 1 (VKR) Failed:', e.message);
      errors.push(`Engine 1: ${e.message}`);
    }

    // ── ইঞ্জিন ২: BK9 API ────────────────────────────────────────────────────
    if (formats.length === 0) {
      try {
        console.log('Engine 2: BK9...');
        const r = await fetchSafe(
          `https://bk9.fun/download/youtube?url=${encodeURIComponent(cleanUrl)}`,
          { headers: { 'User-Agent': UA, 'Accept': 'application/json' } },
          12000
        );
        if (r.ok) {
          const d = await r.json();
          if (d.status && d.BK9) {
            title = d.BK9.title || title;
            thumbnail = d.BK9.thumb || thumbnail;
            if (d.BK9.vid) formats.push({ quality: 'HD Video MP4', ext: 'mp4', url: d.BK9.vid });
            if (d.BK9.aud) formats.push({ quality: 'Audio MP3', ext: 'mp3', url: d.BK9.aud });
            console.log(`Engine 2 (BK9): ${formats.length} formats found`);
          } else {
            errors.push('Engine 2 (BK9): status false or no data');
          }
        } else {
          errors.push(`Engine 2 (BK9): HTTP ${r.status}`);
        }
      } catch (e: any) {
        console.log('Engine 2 (BK9) Failed:', e.message);
        errors.push(`Engine 2: ${e.message}`);
      }
    }

    // ── ইঞ্জিন ৩: GoAPI ──────────────────────────────────────────────────────
    if (formats.length === 0) {
      try {
        console.log('Engine 3: GoAPI...');
        const r = await fetchSafe(
          `https://api.goapi.xyz/google/youtube?url=${encodeURIComponent(cleanUrl)}`,
          { headers: { 'User-Agent': UA, 'Accept': 'application/json' } },
          12000
        );
        if (r.ok) {
          const d = await r.json();
          if (d.data?.formats && Array.isArray(d.data.formats)) {
            title = d.data.title || title;
            thumbnail = d.data.thumbnail || thumbnail;
            d.data.formats.forEach((f: any) => {
              if (!f.url) return;
              formats.push({ quality: f.quality || 'HD Video', ext: f.ext || 'mp4', url: f.url });
            });
            console.log(`Engine 3 (GoAPI): ${formats.length} formats found`);
          } else {
            errors.push('Engine 3 (GoAPI): no format data');
          }
        } else {
          errors.push(`Engine 3 (GoAPI): HTTP ${r.status}`);
        }
      } catch (e: any) {
        console.log('Engine 3 (GoAPI) Failed:', e.message);
        errors.push(`Engine 3: ${e.message}`);
      }
    }

    // ── ইঞ্জিন ৪: yt1s.com ───────────────────────────────────────────────────
    if (formats.length === 0 && videoId) {
      try {
        console.log('Engine 4: yt1s...');
        // Step 1: Analyse
        const analyseRes = await fetchSafe('https://yt1s.com/api/ajaxSearch/index', {
          method: 'POST',
          headers: {
            'User-Agent': UA,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'Origin': 'https://yt1s.com',
            'Referer': 'https://yt1s.com/',
          },
          body: `q=${encodeURIComponent(cleanUrl)}&vt=home`,
        }, 12000);

        if (analyseRes.ok) {
          const analyseData = await analyseRes.json();
          if (analyseData.status === 'ok' && analyseData.vid) {
            title = analyseData.title || title;
            thumbnail = analyseData.thumbnail || thumbnail;
            const vid = analyseData.vid;
            const kval = analyseData.kc || Object.keys(analyseData.links?.mp4 || {})[0] || '18';

            // Step 2: Convert
            const convertRes = await fetchSafe('https://yt1s.com/api/ajaxConvert/convert', {
              method: 'POST',
              headers: {
                'User-Agent': UA,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                'Origin': 'https://yt1s.com',
                'Referer': 'https://yt1s.com/',
              },
              body: `vid=${vid}&k=${kval}`,
            }, 12000);

            if (convertRes.ok) {
              const convertData = await convertRes.json();
              if (convertData.status === 'ok' && convertData.dlink) {
                formats.push({ quality: 'HD Video MP4', ext: 'mp4', url: convertData.dlink });
              }
            }

            // Also try mp3
            const mp3key = Object.keys(analyseData.links?.mp3 || {})[0];
            if (mp3key) {
              const mp3Res = await fetchSafe('https://yt1s.com/api/ajaxConvert/convert', {
                method: 'POST',
                headers: {
                  'User-Agent': UA,
                  'Content-Type': 'application/x-www-form-urlencoded',
                  'Origin': 'https://yt1s.com',
                  'Referer': 'https://yt1s.com/',
                },
                body: `vid=${vid}&k=${mp3key}`,
              }, 12000);
              if (mp3Res.ok) {
                const mp3Data = await mp3Res.json();
                if (mp3Data.status === 'ok' && mp3Data.dlink) {
                  formats.push({ quality: 'Audio MP3', ext: 'mp3', url: mp3Data.dlink });
                }
              }
            }
            console.log(`Engine 4 (yt1s): ${formats.length} formats found`);
          } else {
            errors.push('Engine 4 (yt1s): status not ok');
          }
        } else {
          errors.push(`Engine 4 (yt1s): HTTP ${analyseRes.status}`);
        }
      } catch (e: any) {
        console.log('Engine 4 (yt1s) Failed:', e.message);
        errors.push(`Engine 4: ${e.message}`);
      }
    }

    // ── ইঞ্জিন ৫: y2mate.com ─────────────────────────────────────────────────
    if (formats.length === 0 && videoId) {
      try {
        console.log('Engine 5: y2mate...');
        const analyseRes = await fetchSafe('https://www.y2mate.com/mates/analyzeV2/ajax', {
          method: 'POST',
          headers: {
            'User-Agent': UA,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'Origin': 'https://www.y2mate.com',
            'Referer': 'https://www.y2mate.com/',
          },
          body: `k_query=${encodeURIComponent(cleanUrl)}&k_page=home&hl=en&q_auto=0`,
        }, 12000);

        if (analyseRes.ok) {
          const d = await analyseRes.json();
          if (d.status === 'ok' && d.vid) {
            title = d.title || title;
            thumbnail = d.thumbnail || thumbnail;
            // Get first available mp4 link key
            const mp4Links = d.links?.mp4 || {};
            const mp4Key = Object.keys(mp4Links)[0];
            if (mp4Key) {
              const convertRes = await fetchSafe('https://www.y2mate.com/mates/convertV2/index', {
                method: 'POST',
                headers: {
                  'User-Agent': UA,
                  'Content-Type': 'application/x-www-form-urlencoded',
                  'Origin': 'https://www.y2mate.com',
                  'Referer': 'https://www.y2mate.com/',
                },
                body: `vid=${d.vid}&k=${mp4Key}`,
              }, 12000);
              if (convertRes.ok) {
                const cd = await convertRes.json();
                if (cd.status === 'ok' && cd.dlink) {
                  formats.push({ quality: mp4Links[mp4Key]?.q || 'HD Video', ext: 'mp4', url: cd.dlink });
                }
              }
            }
            console.log(`Engine 5 (y2mate): ${formats.length} formats found`);
          } else {
            errors.push('Engine 5 (y2mate): no vid in response');
          }
        } else {
          errors.push(`Engine 5 (y2mate): HTTP ${analyseRes.status}`);
        }
      } catch (e: any) {
        console.log('Engine 5 (y2mate) Failed:', e.message);
        errors.push(`Engine 5: ${e.message}`);
      }
    }

    if (formats.length === 0) {
      console.log('All engines failed:', errors.join(' | '));
      throw new Error(`সব ইঞ্জিন ব্যর্থ হয়েছে। বিস্তারিত: ${errors.join(' | ')}`);
    }

    // ── Deduplicate ───────────────────────────────────────────────────────────
    const uniqueFormats = Array.from(new Map(formats.map(f => [f.url, f])).values());

    return NextResponse.json(
      { success: true, data: { title, thumbnail, formats: uniqueFormats } },
      { status: 200, headers: CORS }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'ভিডিও পাওয়া যায়নি। লিংকটি চেক করুন।',
        details: err.message,
      },
      { status: 500, headers: CORS }
    );
  }
}