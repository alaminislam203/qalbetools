import { NextRequest } from 'next/server';
import { spawn } from 'child_process';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return new Response('URL parameter is required', { status: 400 });
  }

  // Create a ReadableStream from the FFmpeg output
  const stream = new ReadableStream({
    start(controller) {
      console.log('>>> [UltraEngine] Starting fMP4 stream for:', targetUrl);
      let isFinished = false;
      
      const ffmpeg = spawn('ffmpeg', [
        '-i', targetUrl,
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-tune', 'zerolatency',
        '-profile:v', 'baseline',
        '-level', '3.0',
        '-s', '1280x720',
        '-b:v', '1200k',           // Lower bitrate for smoother streaming
        '-maxrate', '1200k',
        '-bufsize', '2400k',
        '-pix_fmt', 'yuv420p',
        '-g', '30',                // Shorter GOP for faster seeking/join
        '-ac', '2',
        '-c:a', 'aac',
        '-b:a', '96k',             // Lower audio bitrate to save bandwidth
        '-f', 'mp4',
        // LOW LATENCY fMP4 FLAGS:
        '-movflags', 'frag_keyframe+empty_moov+default_base_moof+omit_tfhd_offset+frag_discont',
        '-frag_duration', '500000', // 0.5s fragments for instant delivery
        '-v', 'error',
        'pipe:1'
      ]);

      ffmpeg.stdout.on('data', (chunk) => {
        if (!isFinished) {
            try {
                controller.enqueue(chunk);
            } catch (e) {
                isFinished = true;
            }
        }
      });

      ffmpeg.stderr.on('data', (data) => {
        console.error(`>>> [UltraEngine Error] ${data}`);
      });

      ffmpeg.on('close', (code) => {
        console.log(`>>> [UltraEngine] Process closed with code ${code}`);
        if (!isFinished) {
            isFinished = true;
            try { controller.close(); } catch (e) {}
        }
      });

      // Cleanup on disconnect
      req.signal.addEventListener('abort', () => {
        console.log('>>> [UltraEngine] Client disconnected. Killing process...');
        isFinished = true;
        ffmpeg.kill('SIGKILL'); // Use SIGKILL for immediate termination on Windows
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'video/mp4',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Connection': 'keep-alive',
    },
  });
}
