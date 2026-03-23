import { NextResponse } from 'next/server';
import youtubedl from 'youtube-dl-exec';

export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url || !url.includes('facebook.com')) {
      return NextResponse.json({ success: false, error: 'Valid Facebook URL required' }, { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    // youtube-dl-exec ব্যবহার করে ভিডিও ডাটা ফেচ করা
    const output = await youtubedl(url, {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
      // ফেসবুককে ধোঁকা দেওয়ার জন্য ব্রাউজারের মতো ইউজার-এজেন্ট পাঠানো
      addHeader: [
        'referer:facebook.com',
        'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ]
    });

    const data = output as any;

    const mediaInfo = {
      title: data.title || 'Facebook Video',
      thumbnail: data.thumbnail || '',
      duration: data.duration || 0,
      formats: (data.formats || [])
        .filter((f: any) => f.vcodec !== 'none' && f.ext === 'mp4') 
        .map((f: any) => ({
          quality: f.format_note || (f.height ? `${f.height}p` : 'HD'),
          url: f.url,
          filesize: f.filesize ? (f.filesize / 1024 / 1024).toFixed(2) + ' MB' : 'Unknown',
        }))
        .sort((a: any, b: any) => parseInt(b.quality) - parseInt(a.quality)),
    };

    return NextResponse.json({ success: true, data: mediaInfo }, { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } });

  } catch (error) {
    console.error('FB Download Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch video. Vercel IP might be blocked by Facebook.' }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
}
