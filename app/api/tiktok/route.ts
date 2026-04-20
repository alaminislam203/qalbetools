import { NextRequest, NextResponse } from 'next/server';

const { ttdl } = require('ab-downloader');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'TikTok URL is required' }, { status: 400 });
    }

    const data = await ttdl(url);

    if (!data || (!data.video && !data.audio)) {
      return NextResponse.json(
        { error: 'Could not fetch TikTok content. Ensure the video is public.' },
        { status: 500 }
      );
    }

    // TikTok can return multiple qualities or just one
    // We normalize it to an array for our UniversalDownloader
    const normalizedData = [
      {
        title: data.title || 'TikTok Video',
        thumbnail: data.thumbnail || '',
        url: Array.isArray(data.video) ? data.video[0] : (data.video || data.audio),
        type: 'video'
      }
    ];

    return NextResponse.json({
      success: true,
      data: normalizedData,
    });

  } catch (error: any) {
    console.error('TikTok Downloader Error:', error);
    return NextResponse.json(
      { error: error.message || 'An internal server error occurred' },
      { status: 500 }
    );
  }
}
