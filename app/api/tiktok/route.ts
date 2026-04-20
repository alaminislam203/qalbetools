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

    if (!data) {
      return NextResponse.json(
        { error: 'Could not fetch TikTok content. Ensure the video is public.' },
        { status: 500 }
      );
    }

    // Normalize TikTok response to include multiple qualities and audio
    const normalizedData: any[] = [];
    const title = data.title || 'TikTok Video';
    const thumbnail = data.thumbnail || '';

    // 1. Add Video (No Watermark usually prioritized)
    if (data.video && Array.isArray(data.video) && data.video.length > 0) {
      data.video.forEach((v: string, index: number) => {
        normalizedData.push({
          title: title,
          thumbnail: thumbnail,
          url: v,
          type: 'video',
          quality: index === 0 ? 'No Watermark (HD)' : `Option ${index + 1}`,
          format: 'mp4'
        });
      });
    } else if (data.video && typeof data.video === 'string') {
        normalizedData.push({
          title: title,
          thumbnail: thumbnail,
          url: data.video,
          type: 'video',
          quality: 'HD',
          format: 'mp4'
        });
    }

    // 2. Add Audio
    if (data.audio && Array.isArray(data.audio) && data.audio.length > 0) {
      data.audio.forEach((a: string) => {
        normalizedData.push({
          title: title,
          thumbnail: thumbnail,
          url: a,
          type: 'audio',
          quality: 'MP3 Audio',
          format: 'mp3'
        });
      });
    } else if (data.audio && typeof data.audio === 'string') {
        normalizedData.push({
          title: title,
          thumbnail: thumbnail,
          url: data.audio,
          type: 'audio',
          quality: 'MP3 Audio',
          format: 'mp3'
        });
    }

    if (normalizedData.length === 0) {
        return NextResponse.json({ error: 'No downloadable content found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: normalizedData,
      title: title
    });

  } catch (error: any) {
    console.error('TikTok Downloader Error:', error);
    return NextResponse.json(
      { error: error.message || 'An internal server error occurred' },
      { status: 500 }
    );
  }
}
