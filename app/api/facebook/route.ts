import { NextRequest, NextResponse } from 'next/server';

// ab-downloader is a CommonJS package
const { fbdown } = require('ab-downloader');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'Facebook URL is required' }, { status: 400 });
    }

    const rawData = await fbdown(url);
    const videoData = rawData.result || rawData;

    // Flexible extraction of links
    const hdLink = videoData.HD || videoData.hd || videoData.video_hd || '';
    const sdLink = videoData.Normal_video || videoData.sd || videoData.video_sd || videoData.url || '';
    const thumbnail = videoData.thumbnail || videoData.thumb || videoData.image || videoData.cover || '';
    const title = videoData.title || videoData.caption || 'Facebook Video';

    if (!videoData || (!hdLink && !sdLink)) {
      return NextResponse.json(
        { error: 'Could not find any video links. Ensure the video is public.' },
        { status: 500 }
      );
    }

    // Normalize to unified array format
    const normalizedData = [];
    if (hdLink) {
      normalizedData.push({
        title: title,
        thumbnail: thumbnail,
        url: hdLink,
        type: 'video',
        quality: 'High Quality (HD)',
        format: 'mp4'
      });
    }
    if (sdLink) {
      normalizedData.push({
        title: title,
        thumbnail: thumbnail,
        url: sdLink,
        type: 'video',
        quality: 'Normal Quality (SD)',
        format: 'mp4'
      });
    }

    return NextResponse.json({
      success: true,
      data: normalizedData,
      title: title
    });

  } catch (error: any) {
    console.error('Facebook Downloader Error:', error);
    return NextResponse.json(
      { error: error.message || 'An internal server error occurred' },
      { status: 500 }
    );
  }
}
