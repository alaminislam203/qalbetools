import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const videoUrl = searchParams.get('url');
  const filename = searchParams.get('filename') || 'downloaded_file';

  if (!videoUrl) {
    return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
  }

  try {
    // Adding browser-like headers to bypass bot protection
    const response = await fetch(videoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.instagram.com/',
        'Accept': '*/*'
      }
    });

    if (!response.ok) {
      throw new Error(`Source responded with status ${response.status}: ${response.statusText}`);
    }

    // Get the content headers from the original source
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
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
      { error: `Failed to download: ${error.message}. Instagram might be blocking this request.` },
      { status: 500 }
    );
  }
}
