import { NextRequest, NextResponse } from 'next/server';

// ab-downloader is a CommonJS package
const { igdl } = require('ab-downloader');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'Instagram URL is required' }, { status: 400 });
    }

    const data = await igdl(url);

    if (!data || !Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: 'Could not fetch Instagram content. Please ensure the post is public.' },
        { status: 500 }
      );
    }

    // Normalize Instagram response (it returns an array of media objects)
    const normalizedData = data.map((item: any) => ({
      thumbnail: item.thumbnail || '',
      url: item.url || '',
      type: item.url && item.url.includes('.mp4') ? 'video' : 'image'
    }));

    return NextResponse.json({
      success: true,
      data: normalizedData,
      title: 'Instagram Post'
    });

  } catch (error: any) {
    console.error('Instagram Downloader Error:', error);
    return NextResponse.json(
      { error: error.message || 'An internal server error occurred' },
      { status: 500 }
    );
  }
}
