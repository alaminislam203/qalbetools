import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const videoUrl = searchParams.get('url');
  const filename = searchParams.get('filename') || 'downloaded_file';

  if (!videoUrl) {
    return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
  }

  try {
    const response = await fetch(videoUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch video: ${response.statusText}`);
    }

    // Get the content headers from the original source
    const contentType = response.headers.get('content-type') || 'video/mp4';
    const contentLength = response.headers.get('content-length');

    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    headers.set('Content-Type', contentType);
    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }

    // Stream the video back to the client
    return new Response(response.body, {
      status: 200,
      headers,
    });

  } catch (error: any) {
    console.error('Download Proxy Error:', error);
    return NextResponse.json(
      { error: 'Failed to download video. It might be blocked by the source.' },
      { status: 500 }
    );
  }
}
