import { NextRequest, NextResponse } from 'next/server';

const { twitter } = require('ab-downloader');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'Twitter URL is required' }, { status: 400 });
    }

    const data = await twitter(url);

    if (!data || !data.url || !Array.isArray(data.url)) {
      return NextResponse.json(
        { error: 'Could not fetch Twitter content. Ensure the post contains media and is public.' },
        { status: 500 }
      );
    }

    // Twitter returns an array of objects like [{hd: '...'}, {sd: '...'}]
    // We normalize it to our UniversalDownloader format
    const normalizedData = data.url.map((item: any) => {
      const q = item.hd ? 'HD' : 'SD';
      const videoLink = item.hd || item.sd;
      
      return {
        title: `${data.title || 'Twitter Video'} (${q})`,
        thumbnail: '', // Twitter API may not return a thumbnail easily
        url: videoLink,
        type: 'video'
      };
    });

    return NextResponse.json({
      success: true,
      data: normalizedData,
      title: data.title || 'Twitter Video'
    });

  } catch (error: any) {
    console.error('Twitter Downloader Error:', error);
    return NextResponse.json(
      { error: error.message || 'An internal server error occurred' },
      { status: 500 }
    );
  }
}
