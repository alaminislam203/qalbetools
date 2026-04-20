import { NextRequest, NextResponse } from 'next/server';

// ab-downloader is a CommonJS package
const { fbdown } = require('ab-downloader');

export async function POST(req: NextRequest) {
  console.log('>>> [API/facebook] Request received');
  try {
    const body = await req.json();
    const { url } = body;
    console.log('>>> [API/facebook] URL:', url);

    if (!url) {
      return NextResponse.json({ error: 'Facebook URL is required' }, { status: 400 });
    }

    console.log('>>> [API/facebook] Calling fbdown...');
    const rawData = await fbdown(url);
    console.log('>>> [API/facebook] Raw Response:', JSON.stringify(rawData, null, 2));

    // The library can return various field names for videos
    // We log the raw data for debugging and then try to extract links flexibly
    const videoData = rawData.result || rawData;

    // Flexible extraction
    const hdLink = videoData.HD || videoData.hd || videoData.video_hd || '';
    const sdLink = videoData.Normal_video || videoData.sd || videoData.video_sd || videoData.url || '';
    const thumbnail = videoData.thumbnail || videoData.thumb || videoData.image || videoData.cover || videoData.preview || '';

    if (!videoData || (!hdLink && !sdLink)) {
      return NextResponse.json(
        { error: 'Could not find any video links for this URL. Ensure the video is public.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        title: videoData.title || videoData.caption || 'Facebook Video',
        thumbnail: thumbnail,
        hd: hdLink,
        sd: sdLink,
      }
    });

  } catch (error: any) {
    console.error('>>> [API/facebook] Exception:', error);
    return NextResponse.json(
      { error: error.message || 'An internal server error occurred' },
      { status: 500 }
    );
  }
}
