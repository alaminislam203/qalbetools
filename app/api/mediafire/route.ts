import { NextRequest, NextResponse } from 'next/server';

const { mediafire } = require('ab-downloader');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'MediaFire URL is required' }, { status: 400 });
    }

    const data = await mediafire(url);

    // MediaFire returns { result: { name, size, date, mime, link } }
    if (!data || !data.result || !data.result.link) {
      return NextResponse.json(
        { error: 'Could not fetch MediaFire file. Ensure the link is valid.' },
        { status: 500 }
      );
    }

    const fileInfo = data.result;

    // Normalize for UniversalDownloader
    const normalizedData = [
      {
        title: fileInfo.name || 'MediaFire File',
        thumbnail: '', // Files don't usually have thumbnails
        url: fileInfo.link,
        type: 'file',
        size: fileInfo.size || 'Unknown'
      }
    ];

    return NextResponse.json({
      success: true,
      data: normalizedData,
      title: fileInfo.name || 'MediaFire File'
    });

  } catch (error: any) {
    console.error('MediaFire Downloader Error:', error);
    return NextResponse.json(
      { error: error.message || 'An internal server error occurred' },
      { status: 500 }
    );
  }
}
