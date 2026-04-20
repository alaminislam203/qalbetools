const { fbdown } = require('ab-downloader');

const url = 'https://www.facebook.com/reel/891459690618848';

console.log('Testing fbdown with Reel URL:', url);

fbdown(url)
  .then(data => {
    console.log('✅ Success:', JSON.stringify(data, null, 2));
  })
  .catch(err => {
    console.error('❌ Error:', err);
  });
