const { youtube } = require('ab-downloader');

const url = 'https://www.youtube.com/watch?v=C8mJ8943X80';

async function testYouTube() {
  console.log('Testing YouTube with ab-downloader...');
  try {
    const data = await youtube(url);
    console.log('Full Response Keys:', Object.keys(data));
    console.log('Video Info:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testYouTube();
