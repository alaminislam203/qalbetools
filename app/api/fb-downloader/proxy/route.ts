import { NextResponse } from 'next/server';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const videoUrl = searchParams.get('url');
  const filename = searchParams.get('filename') || 'facebook-video.mp4';

  if (!videoUrl) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  // Security: only allow video domain for Facebook CDN
  const allowedHosts = ['fbcdn.net', 'facebook.com', 'fb.com', 'fbsbx.com'];
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(videoUrl);
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  const isAllowed = allowedHosts.some(host => parsedUrl.hostname.endsWith(host));
  if (!isAllowed) {
    return NextResponse.json({ error: 'Only Facebook URLs are allowed' }, { status: 403 });
  }

  try {
    const upstream = await fetch(videoUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Referer': 'https://www.facebook.com/',
        'Accept': 'video/mp4,video/*,*/*',
      },
      signal: AbortSignal.timeout(60000), // longer timeout for larger videos
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Upstream returned ${upstream.status}` },
        { status: 502 }
      );
    }

    const contentType = upstream.headers.get('content-type') || 'video/mp4';
    const contentLength = upstream.headers.get('content-length');

    const headers: Record<string, string> = {
      ...CORS,
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    };

    if (contentLength) {
      headers['Content-Length'] = contentLength;
    }

    // Stream the body directly
    return new NextResponse(upstream.body, {
      status: 200,
      headers,
    });
  } catch (err: any) {
    console.error('[FB Proxy] Error:', err.message);
    return NextResponse.json(
      { error: 'Proxy fetch failed', details: err.message },
      { status: 500, headers: CORS }
    );
  }
}
