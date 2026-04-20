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

    const items = Array.isArray(data.result) ? data.result : [data.result];
    const title = 'Pinterest Media';
    
    const normalizedData = items.map((item: any, index: number) => {
      const mediaUrl = item.image || item.url || '';
      const isVideo = mediaUrl.toLowerCase().includes('.mp4');
      
      return {
        title: `${title} ${index + 1}`,
        thumbnail: item.image || item.thumbnail || '',
        url: mediaUrl,
        type: isVideo ? 'video' : 'image',
        quality: isVideo ? 'High Quality' : 'Original',
        format: isVideo ? 'mp4' : 'jpg'
      };
    }).filter((item: any) => item.url);

    if (normalizedData.length === 0) {
      return NextResponse.json(
        { error: 'No media found for this Pin.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: normalizedData,
      title: title
    });

  } catch (error: any) {
    console.error('Pinterest Downloader Error:', error);
    return NextResponse.json(
      { error: error.message || 'An internal server error occurred' },
      { status: 500 }
    );
  }
}
