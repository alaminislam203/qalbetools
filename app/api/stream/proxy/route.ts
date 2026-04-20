import { NextRequest, NextResponse } from 'next/server';
import { Logger } from '@/lib/logger';

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
       Logger.error(`HLS Proxy: Failed to fetch source ${targetUrl} (Status: ${response.status})`);
      throw new Error(`Failed to fetch stream: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    const isBinary = 
        targetUrl.toLowerCase().endsWith('.ts') || 
        targetUrl.toLowerCase().endsWith('.m4s') ||
        targetUrl.toLowerCase().endsWith('.mp4') ||
        contentType.includes('video/') || 
        contentType.includes('application/octet-stream');

    // If it's a binary segment file, pipe it directly
    if (isBinary) {
        const segmentHeaders = new Headers();
        segmentHeaders.set('Access-Control-Allow-Origin', '*');
        segmentHeaders.set('Content-Type', contentType || 'video/MP2T');
        
        return new NextResponse(response.body, {
            headers: segmentHeaders,
        });
    }

    // Otherwise, treat as an M3U8 playlist
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
    Logger.error(`HLS Proxy Error: ${error.message} for URL: ${targetUrl}`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
