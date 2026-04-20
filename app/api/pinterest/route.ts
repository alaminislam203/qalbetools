import { NextRequest, NextResponse } from 'next/server';

const { pinterest } = require('ab-downloader');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'Pinterest URL is required' }, { status: 400 });
    }

    const data = await pinterest(url);

    if (!data || !data.result) {
      return NextResponse.json(
        { error: 'Could not fetch Pinterest content. Ensure the Pin is public.' },
        { status: 500 }
      );
    }

    // Determine if it's a search result or a single pin
    // The library returns result as an array of objects
    const items = Array.isArray(data.result) ? data.result : [data.result];
    
    const normalizedData = items.map((item: any, index: number) => ({
      title: `Pinterest Media ${index + 1}`,
      thumbnail: item.image || item.thumbnail || '',
      url: item.image || item.url || '',
      type: (item.image && item.image.includes('.mp4')) || (item.url && item.url.includes('.mp4')) ? 'video' : 'image'
    })).filter((item: any) => item.url);

    if (normalizedData.length === 0) {
      return NextResponse.json(
        { error: 'No media found for this Pin.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: normalizedData,
    });

  } catch (error: any) {
    console.error('Pinterest Downloader Error:', error);
    return NextResponse.json(
      { error: error.message || 'An internal server error occurred' },
      { status: 500 }
    );
  }
}
