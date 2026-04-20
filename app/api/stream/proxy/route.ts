import { NextRequest, NextResponse } from 'next/server';
import { Logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    const upstreamResponse = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Connection': 'keep-alive',
      },
      next: { revalidate: 0 } // Ensure no caching in Vercel/Next.js
    });

    if (!upstreamResponse.ok) {
       Logger.error(`HLS Proxy: Upstream failure ${targetUrl} (Status: ${upstreamResponse.status})`);
      throw new Error(`Upstream responded with ${upstreamResponse.status}`);
    }

    const contentType = upstreamResponse.headers.get('content-type') || '';
    const urlLower = targetUrl.toLowerCase();
    
    // Improved detection for binary segments
    const isBinaryValue = 
        urlLower.includes('.ts') || 
        urlLower.includes('.m4s') ||
        urlLower.includes('.mp4') ||
        urlLower.includes('.aac') ||
        contentType.includes('video/') || 
        contentType.includes('audio/') ||
        contentType.includes('application/octet-stream');

    if (isBinaryValue) {
        // Direct stream pipe for Vercel efficiency
        return new Response(upstreamResponse.body, {
            headers: {
                'Content-Type': contentType || 'video/MP2T',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
        });
    }

    // Playlist processing
    const m3u8Content = await upstreamResponse.text();
    const baseUrl = targetUrl.substring(0, targetUrl.lastIndexOf('/') + 1);
    const selfUrl = req.nextUrl.origin + req.nextUrl.pathname;
    
    // Faster string processing for large playlists
    const lines = m3u8Content.split(/\r?\n/);
    let output = '';
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line && !line.startsWith('#')) {
            let absoluteUrl = '';
            if (line.startsWith('http')) {
                absoluteUrl = line;
            } else if (line.startsWith('/')) {
                const urlObj = new URL(targetUrl);
                absoluteUrl = `${urlObj.protocol}//${urlObj.host}${line}`;
            } else {
                absoluteUrl = baseUrl + line;
            }
            output += `${selfUrl}?url=${encodeURIComponent(absoluteUrl)}\n`;
        } else {
            output += lines[i] + '\n';
        }
    }

    return new Response(output, {
      headers: {
        'Content-Type': 'application/vnd.apple.mpegurl',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error: any) {
    Logger.error(`HLS Proxy Error: ${error.message} for ${targetUrl}`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
