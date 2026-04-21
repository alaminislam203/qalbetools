import { NextRequest, NextResponse } from 'next/server';
import { Logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const videoUrl = searchParams.get('url');
  const rawFilename = searchParams.get('filename');
  const providedExt = searchParams.get('ext');

  if (!videoUrl) {
    Logger.warn('Download attempt without URL');
    return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
  }

  let filename = rawFilename || `media_download_${Date.now()}`;

  // Smart Extension Detection:
  // 1. If a filename with an extension is provided, respect it.
  // 2. If no extension is detected in filename, use 'ext' parameter as fallback.
  // 3. Default to .mp4 if no extension can be determined.
  const hasExtension = /\.[a-z0-9]{1,5}$/i.test(filename);

  if (!hasExtension) {
    const fallbackExt = providedExt 
      ? (providedExt.startsWith('.') ? providedExt.slice(1) : providedExt) 
      : 'mp4';
    
    const separator = filename.endsWith('.') ? '' : '.';
    filename = `${filename}${separator}${fallbackExt}`;
  }

  Logger.info(`Initiating proxy download: ${filename} from ${videoUrl.substring(0, 50)}...`);

  try {
    // Dynamically determine Referer based on the target URL origin to bypass protections
    const urlObj = new URL(videoUrl);
    const referer = urlObj.origin + '/';

    // Adding browser-like headers to bypass bot protection
    const response = await fetch(videoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': referer,
        'Accept': '*/*',
        'Connection': 'keep-alive'
      }
    });

    if (!response.ok) {
      throw new Error(`Source responded with status ${response.status}: ${response.statusText}`);
    }

    // Get the content headers from the original source
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const contentLength = response.headers.get('content-length');

    const headers = new Headers();
    // Use the determined filename in Content-Disposition
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    headers.set('Content-Type', contentType);
    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }

    // Stream the body back to the client
    return new Response(response.body, {
      status: 200,
      headers,
    });

  } catch (error: any) {
    Logger.error(`Download Proxy Error: ${error.message} for URL: ${videoUrl}`);
    return NextResponse.json(
      { error: `Failed to download: ${error.message}. The source might be blocking this request.` },
      { status: 500 }
    );
  }
}
