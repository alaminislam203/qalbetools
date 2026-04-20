const { spawn } = require('child_process');

const targetUrl = 'http://103.157.248.140:8000/play/a01p/index.m3u8';

console.log('>>> Testing FFmpeg Spawn...');

const ffmpeg = spawn('ffmpeg', [
  '-i', targetUrl,
  '-c:v', 'copy',
  '-t', '2', // Run for 2 seconds
  '-f', 'mpegts',
  'pipe:1'
]);

let dataCount = 0;
ffmpeg.stdout.on('data', (chunk) => {
  dataCount += chunk.length;
});

ffmpeg.stderr.on('data', (data) => {
  console.log(`FFmpeg Log: ${data}`);
});

ffmpeg.on('close', (code) => {
  console.log(`FFmpeg closed with code: ${code}`);
  console.log(`Total data received: ${dataCount} bytes`);
});
