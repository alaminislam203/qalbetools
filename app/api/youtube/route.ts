import { NextRequest, NextResponse } from 'next/server';

const { youtube } = require('ab-downloader');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'YouTube URL is required' }, { status: 400 });
    }

    console.log('>>> [API/youtube] Request received for URL:', url);
    const data = await youtube(url);
    console.log('>>> [API/youtube] Raw Response:', JSON.stringify(data, null, 2));

    if (!data || (data.status === false)) {
      return NextResponse.json(
        { error: data.message || 'Could not fetch YouTube content. YouTube links are often restricted.' },
        { status: 500 }
      );
    }

    // Normalize for UniversalDownloader
    const normalizedData = [];

    // Check for mp4 (Video)
    if (data.mp4) {
      const videoUrl = typeof data.mp4 === 'string' ? data.mp4 : (data.mp4.url || data.mp4.link || '');
      if (videoUrl) {
        normalizedData.push({
          title: (data.title || 'YouTube Video') + ' (MP4 Video)',
          thumbnail: data.thumbnail || '',
          url: videoUrl,
          type: 'video'
        });
      }
    }

    // Check for mp3 (Audio)
    if (data.mp3) {
      const audioUrl = typeof data.mp3 === 'string' ? data.mp3 : (data.mp3.url || data.mp3.link || '');
      if (audioUrl) {
        normalizedData.push({
          title: (data.title || 'YouTube Audio') + ' (MP3 Audio)',
          thumbnail: data.thumbnail || '',
          url: audioUrl,
          type: 'audio'
        });
      }
    }

    // Fallback if no specific mp3/mp4 but a generic url exists
    if (normalizedData.length === 0 && data.url) {
      normalizedData.push({
        title: (data.title || 'YouTube Content'),
        thumbnail: data.thumbnail || '',
        url: data.url,
        type: 'media'
      });
    }

    if (normalizedData.length === 0) {
       return NextResponse.json(
        { error: 'No downloadable links found. YouTube might be blocking the request.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: normalizedData,
    });

  } catch (error: any) {
    console.error('YouTube Downloader Error:', error);
    return NextResponse.json(
      { error: error.message || 'An internal server error occurred' },
      { status: 500 }
    );
  }
}
