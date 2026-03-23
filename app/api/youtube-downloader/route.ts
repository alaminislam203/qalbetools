import { NextResponse } from 'next/server';
const { youtube } = require('ab-downloader');

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() { return new NextResponse(null, { status: 200, headers: CORS }); }

export async function GET(req: Request) {
  // Proxy Downloader (ডাইরেক্ট ডাউনলোডের জন্য)
  const { searchParams } = new URL(req.url);
  const proxyUrl = searchParams.get('proxyUrl');
  const filename = searchParams.get('filename') || 'QalbeTalks_YouTube';
  const ext = searchParams.get('ext') || 'mp4';
  if (!proxyUrl) return NextResponse.json({ error: 'Proxy URL missing' }, { status: 400, headers: CORS });
  try {
    const upstream = await fetch(proxyUrl, { signal: AbortSignal.timeout(60000) });
    return new NextResponse(upstream.body, { status: 200, headers: { ...CORS, 'Content-Type': upstream.headers.get('content-type') || 'application/octet-stream', 'Content-Disposition': `attachment; filename="${filename}.${ext}"` } });
  } catch (error) { return NextResponse.json({ error: 'Proxy failed' }, { status: 500, headers: CORS }); }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { url } = body as { url?: string };

    if (!url || (!url.includes('youtube.com') && !url.includes('youtu.be'))) {
      return NextResponse.json({ success: false, error: 'Valid YouTube URL required' }, { status: 400, headers: CORS });
    }

    let formats: any[] = [];
    let title = 'YouTube Video';
    let thumbnail = '';

    // === ইঞ্জিন ১: AB-Downloader ===
    try {
        const result = await youtube(url);
        if (result && result.data) {
            title = result.title || 'YouTube Video';
            thumbnail = result.thumbnail || '';
            
            // ভিডিও এবং অডিও লিঙ্ক ফিল্টার করা
            if (result.data.video) {
                formats.push({ quality: 'HD Video', ext: 'mp4', url: result.data.video });
            }
            if (result.data.audio) {
                formats.push({ quality: 'Audio MP3', ext: 'mp3', url: result.data.audio });
            }
        }
    } catch (e: any) { console.log("YT Engine 1 Failed:", e.message); }

    // === ইঞ্জিন ২: Fallback Public API ===
    if (formats.length === 0) {
        try {
            const res2 = await fetch(`https://api.vkrdownloader.co.in/api?vkr=${encodeURIComponent(url)}`);
            const json2 = await res2.json();
            if (json2.data && json2.data.downloads) {
                title = json2.data.title;
                thumbnail = json2.data.thumbnail;
                json2.data.downloads.forEach((dl: any) => {
                    formats.push({
                        quality: dl.quality || (dl.url.includes('.mp3') ? 'Audio' : 'Video'),
                        ext: dl.url.includes('.mp3') ? 'mp3' : 'mp4',
                        url: dl.url
                    });
                });
            }
        } catch (e: any) { console.log("YT Engine 2 Failed:", e.message); }
    }

    if (formats.length === 0) throw new Error('Could not fetch YouTube data.');

    return NextResponse.json({ success: true, data: { title, thumbnail, formats } }, { status: 200, headers: CORS });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'ভিডিও পাওয়া যায়নি। লিংকটি চেক করুন।', details: err.message }, { status: 500, headers: CORS });
  }
}
