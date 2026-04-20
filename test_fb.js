const { fbdown } = require('ab-downloader');

const url = 'https://www.facebook.com/watch/?v=1393572814172251';

console.log('Testing fbdown in project root...');

fbdown(url)
  .then(data => {
    console.log('✅ Success:', data);
  })
  .catch(err => {
    console.error('❌ Error:', err);
  });
