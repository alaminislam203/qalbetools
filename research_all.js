const { igdl, ttdl, twitter, youtube, mediafire, capcut, gdrive, pinterest } = require('ab-downloader');

const tests = [
  { name: 'Instagram', fn: igdl, url: 'https://www.instagram.com/p/ByxKbUSnubS/' },
  { name: 'TikTok', fn: ttdl, url: 'https://www.tiktok.com/@mrbeast/video/7321472890123456789' },
  { name: 'Twitter', fn: twitter, url: 'https://twitter.com/username/status/1229369819511709697' },
  { name: 'Pinterest', fn: pinterest, url: 'https://pin.it/4CVodSq' }
];

async function runTests() {
  for (const test of tests) {
    console.log(`\n--- Testing ${test.name} ---`);
    try {
      const data = await test.fn(test.url);
      console.log(`${test.name} Success:`, JSON.stringify(data, null, 2));
    } catch (err) {
      console.error(`${test.name} Error:`, err.message);
    }
  }
}

runTests();
