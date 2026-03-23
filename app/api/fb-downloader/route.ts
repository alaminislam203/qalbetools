import { NextResponse } from 'next/server';
import youtubedl from 'youtube-dl-exec';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// CORS Handle
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url || (!url.includes('facebook.com') && !url.includes('fb.watch'))) {
      return NextResponse.json({ success: false, error: 'Valid Facebook URL required' }, { status: 400, headers: corsHeaders });
    }

    // Vercel Serverless environment এ চলার জন্য youtube-dl-exec ব্যবহার করছি
    // এটি নিজে থেকেই yt-dlp বাইনারি ইনস্টল করে নেয়
    const data: any = await youtubedl(url, {
      dumpSingleJson: true,
      noWarnings: true,
      noCheckCertificates: true,
      preferFreeFormats: true,
      referer: url
    });

    const mediaInfo = {
      title: data.title || 'Facebook Video',
      thumbnail: data.thumbnail || '',
      duration: data.duration || 0,
      formats: (data.formats || [])
        .filter((f: any) => f.vcodec !== 'none' && f.ext === 'mp4') 
        .map((f: any) => ({
          quality: f.format_note || (f.height ? f.height + 'p' : 'Unknown'),
          url: f.url,
          filesize: f.filesize ? (f.filesize / 1024 / 1024).toFixed(2) + ' MB' : 'Unknown',
        }))
        .sort((a: any, b: any) => parseInt(b.quality) - parseInt(a.quality)),
    };

    return NextResponse.json({ success: true, data: mediaInfo }, { status: 200, headers: corsHeaders });

  } catch (error: any) {
    console.error('FB Download Error:', error.message || error);
    return NextResponse.json({ success: false, error: 'Failed to fetch video. The post might be private or unsupported.' }, { status: 500, headers: corsHeaders });
  }
}
