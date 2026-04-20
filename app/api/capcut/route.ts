import { NextRequest, NextResponse } from 'next/server';

const { capcut } = require('ab-downloader');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'CapCut URL is required' }, { status: 400 });
    }

    const data = await capcut(url);

    if (!data || (!data.video_url && !data.originalVideoUrl && !data.url && !data.video && !data.result)) {
      return NextResponse.json(
        { error: 'Could not fetch CapCut content. The link might be invalid or restricted.' },
        { status: 500 }
      );
    }

    const videoInfo = data.result || data;
    const finalUrl = videoInfo.originalVideoUrl || videoInfo.video_url || videoInfo.url || (Array.isArray(videoInfo.video) ? videoInfo.video[0] : videoInfo.video) || '';

    if (!finalUrl) {
      return NextResponse.json(
        { error: 'Downloadable video link not found.' },
        { status: 500 }
      );
    }

    const title = videoInfo.title || 'CapCut Video';
    const thumbnail = videoInfo.coverUrl || videoInfo.cover_url || videoInfo.thumbnail || videoInfo.cover || '';

    const normalizedData = [
      {
        title: title,
        thumbnail: thumbnail,
        url: finalUrl,
        type: 'video',
        quality: 'High Quality',
        format: 'mp4'
      }
    ];

    return NextResponse.json({
      success: true,
      data: normalizedData,
      title: title
    });

  } catch (error: any) {
    console.error('CapCut Downloader Error:', error);
    return NextResponse.json(
      { error: error.message || 'An internal server error occurred' },
      { status: 500 }
    );
  }
}
