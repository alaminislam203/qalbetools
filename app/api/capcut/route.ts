import { NextRequest, NextResponse } from 'next/server';

const { capcut } = require('ab-downloader');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'CapCut URL is required' }, { status: 400 });
    }

    console.log('>>> [API/capcut] Request for URL:', url);
    const data = await capcut(url);
    console.log('>>> [API/capcut] Raw Response:', JSON.stringify(data, null, 2));

    // Normalize for UniversalDownloader
    // CapCut responses can vary, checking multiple possible structures
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

    const normalizedData = [
      {
        title: videoInfo.title || 'CapCut Video',
        thumbnail: videoInfo.coverUrl || videoInfo.cover_url || videoInfo.thumbnail || videoInfo.cover || '',
        url: finalUrl,
        type: 'video'
      }
    ];

    return NextResponse.json({
      success: true,
      data: normalizedData,
    });

  } catch (error: any) {
    console.error('CapCut Downloader Error:', error);
    return NextResponse.json(
      { error: error.message || 'An internal server error occurred' },
      { status: 500 }
    );
  }
}
