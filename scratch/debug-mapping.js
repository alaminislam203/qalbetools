const { igdl, fbdown } = require('ab-downloader');

async function test() {
    console.log('>>> Testing Instagram Mapping...');
    const igUrl = 'https://www.instagram.com/p/DBB8777SyX9/'; // Just a placeholder url check
    try {
        const data = await igdl(igUrl);
        console.log('IG Response:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.log('IG Error (Expected if URL invalid):', e.message);
    }
}

test();
