import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch stream: ${response.statusText}`);
    }

    // If it's a segment (.ts) file, pipe it directly as binary
    if (targetUrl.toLowerCase().endsWith('.ts')) {
        const segmentHeaders = new Headers();
        segmentHeaders.set('Access-Control-Allow-Origin', '*');
        segmentHeaders.set('Content-Type', 'video/MP2T');
        
        return new NextResponse(response.body, {
            headers: segmentHeaders,
        });
    }

    let m3u8Content = await response.text();

    // Use our proxy API for EVERYTHING in the playlist
    const baseUrl = targetUrl.substring(0, targetUrl.lastIndexOf('/') + 1);
    const selfUrl = req.nextUrl.origin + req.nextUrl.pathname;
    
    const lines = m3u8Content.split('\n');
    const processedLines = lines.map(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        let absoluteUrl = '';
        if (trimmed.startsWith('http')) {
            absoluteUrl = trimmed;
        } else if (trimmed.startsWith('/')) {
            const urlObj = new URL(targetUrl);
            absoluteUrl = `${urlObj.protocol}//${urlObj.host}${trimmed}`;
        } else {
            absoluteUrl = baseUrl + trimmed;
        }
        
        // Return URL that points BACK to this proxy
        return `${selfUrl}?url=${encodeURIComponent(absoluteUrl)}`;
      }
      return line;
    });

    const finalM3U8 = processedLines.join('\n');

    return new NextResponse(finalM3U8, {
      headers: {
        'Content-Type': 'application/vnd.apple.mpegurl',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error: any) {
    console.error('HLS Proxy Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
