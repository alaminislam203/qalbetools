import { NextResponse } from 'next/server';
import ytdl from '@distube/ytdl-core';

export const maxDuration = 60; // Vercel Timeout Fix

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// ── ১. CORS প্রিফ্লাইট ─────────────────────────────────────────────────────────
export async function OPTIONS() { return new NextResponse(null, { status: 200, headers: CORS }); }

// ── ২. GET: Proxy Downloader ───────────────────────────────────────────────────
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const proxyUrl = searchParams.get('proxyUrl');
  const filename = searchParams.get('filename') || 'QalbeTalks_YT';
  const ext = searchParams.get('ext') || 'mp4';
  
  if (!proxyUrl) return NextResponse.json({ error: 'Proxy URL missing' }, { status: 400, headers: CORS });
  
  try {
    const upstream = await fetch(proxyUrl, { signal: AbortSignal.timeout(50000) });
    return new NextResponse(upstream.body, { 
        status: 200, 
        headers: { 
            ...CORS, 
            'Content-Type': upstream.headers.get('content-type') || 'application/octet-stream', 
            'Content-Disposition': `attachment; filename="${filename}.${ext}"` 
        } 
    });
  } catch (error) { return NextResponse.json({ error: 'Proxy failed' }, { status: 500, headers: CORS }); }
}

// ── ৩. POST: YouTube Fetcher (@distube/ytdl-core) ────────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { url } = body as { url?: string };

    if (!url || (!url.includes('youtube.com') && !url.includes('youtu.be'))) {
      return NextResponse.json({ success: false, error: 'Valid YouTube URL required' }, { status: 400, headers: CORS });
    }

    // ইউটিউব থেকে অরিজিনাল ইনফরমেশন বের করা
    const info = await ytdl.getInfo(url);
    
    const title = info.videoDetails.title || 'YouTube Video';
    // সবচেয়ে বড় রেজুলেশনের থাম্বনেইলটি নেওয়া
    const thumbnail = info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url;

    let formats: any[] = [];

    // ১. ভিডিও এবং অডিও একসাথে আছে এমন লিঙ্ক ফিল্টার করা (যেমন 720p, 360p)
    const videoAudioFormats = ytdl.filterFormats(info.formats, 'videoandaudio');
    videoAudioFormats.forEach(f => {
        formats.push({
            quality: (f.qualityLabel || 'HD') + ' Video',
            ext: 'mp4',
            url: f.url
        });
    });

    // ২. শুধুমাত্র অডিও লিঙ্ক ফিল্টার করা (MP3 এর জন্য)
    const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
    if (audioFormats.length > 0) {
        // সবচেয়ে ভালো কোয়ালিটির অডিওটি নেব
        formats.push({
            quality: 'High Quality Audio',
            ext: 'mp3',
            url: audioFormats[0].url
        });
    }

    if (formats.length === 0) throw new Error('Could not extract valid formats.');

    return NextResponse.json({ success: true, data: { title, thumbnail, formats } }, { status: 200, headers: CORS });

  } catch (err: any) {
    console.error('[YT Fetch Error]:', err.message);
    return NextResponse.json(
      { success: false, error: 'ভিডিও পাওয়া যায়নি। এটি হয়তো প্রাইভেট বা বয়স-নির্ধারিত (Age-restricted)।', details: err.message },
      { status: 500, headers: CORS }
    );
  }
}
