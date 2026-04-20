const { spawn } = require('child_process');

const targetUrl = 'http://103.157.248.140:8000/play/a01p/index.m3u8';

console.log('>>> Testing Ultra Engine (fMP4) Spawn...');

const ffmpeg = spawn('ffmpeg', [
  '-i', targetUrl,
  '-c:v', 'libx264',
  '-preset', 'ultrafast',
  '-tune', 'zerolatency',
  '-profile:v', 'baseline',
  '-level', '3.0',
  '-s', '1280x720',
  '-b:v', '2000k',
  '-c:a', 'aac',
  '-b:a', '128k',
  '-f', 'mp4',
  '-movflags', 'frag_keyframe+empty_moov+default_base_moof',
  '-t', '5', // Run for 5 seconds
  'pipe:1'
]);

let dataCount = 0;
ffmpeg.stdout.on('data', (chunk) => {
  dataCount += chunk.length;
  if (dataCount % 100000 < 50000) { // Log occasionally
      console.log(`Received ${dataCount} bytes...`);
  }
});

ffmpeg.stderr.on('data', (data) => {
  console.log(`Ultra Log: ${data}`);
});

ffmpeg.on('close', (code) => {
  console.log(`Ultra Engine closed with code: ${code}`);
  console.log(`Final Result: ${dataCount > 0 ? 'SUCCESS (' + dataCount + ' bytes)' : 'FAILED'}`);
});
