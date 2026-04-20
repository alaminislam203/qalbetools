const { igdl } = require('ab-downloader');

const url = 'https://www.instagram.com/p/DBY_LwLz6V8/'; // Change to a public IG URL if needed

console.log('Testing igdl with URL:', url);

igdl(url)
  .then(data => {
    console.log('✅ Success:', JSON.stringify(data, null, 2));
  })
  .catch(err => {
    console.error('❌ Error:', err);
  });
