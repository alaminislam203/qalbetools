import { NextRequest } from 'next/server';
import { spawn } from 'child_process';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return new Response('URL parameter is required', { status: 400 });
  }

  // Create a ReadableStream from the FFmpeg output
    console.log('>>> [FFmpeg] Starting stream for:', targetUrl);
    
    const ffmpeg = spawn('ffmpeg', [
      '-headers', `Referer: ${targetUrl}\r\n`, // Spoof referer
      '-user_agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      '-i', targetUrl,            
      '-c:v', 'libx264',          
      '-preset', 'ultrafast',     
      '-tune', 'zerolatency',     
      '-profile:v', 'baseline',   
      '-s', '1280x720',           
      '-b:v', '2000k',            
      '-c:a', 'aac',              
      '-b:a', '96k',             
      '-ac', '2',
      '-f', 'flv',                // Use FLV for maximum stability with mpegts.js
      '-v', 'error',
      'pipe:1'
    ]);

    // Set headers for FLV stream
    return new Response(ffmpeg.stdout as any, {
      headers: {
        'Content-Type': 'video/x-flv',
        'Access-Control-Allow-Origin': '*',
        'Connection': 'keep-alive',
      },
    });
}
