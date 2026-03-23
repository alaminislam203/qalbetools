import { NextResponse } from 'next/server';

// CORS Handle for QalbeTalks Frontend
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url || !url.includes('instagram.com')) {
      return NextResponse.json({ success: false, error: 'Valid Instagram URL required' }, { 
          status: 400, 
          headers: { 'Access-Control-Allow-Origin': '*' } 
      });
    }

    // Cobalt API দিয়ে ইনস্টাগ্রামের লগইন ব্লক বাইপাস করা
    const cobaltRes = await fetch('https://api.cobalt.tools/api/json', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
      },
      body: JSON.stringify({
        url: url,
        filenamePattern: "classic"
      })
    });

    const data = await cobaltRes.json();

    if (data.status === 'error') {
        throw new Error(data.text || 'Instagram API blocked the request');
    }

    const formats = [];
    let thumbnail = 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=600&auto=format&fit=crop'; // ডিফল্ট ইনস্টাগ্রাম কভার

    // ১. যদি পোস্টে একাধিক ছবি বা ভিডিও থাকে (Carousel / Slider)
    if (data.picker && data.picker.length > 0) {
        data.picker.forEach((item: any, index: number) => {
            formats.push({
                quality: item.type === 'video' ? 'HD Video' : 'High Res Image',
                ext: item.type === 'video' ? 'mp4' : 'jpg',
                url: item.url,
            });
            // প্রথম আইটেমের থাম্বনেইল কভার হিসেবে সেট করা
            if (index === 0 && item.thumb) thumbnail = item.thumb;
        });
    } 
    // ২. যদি পোস্টে একটি মাত্র ভিডিও বা রিলস (Reels) থাকে
    else if (data.url) {
        // লিঙ্কে .mp4 থাকলে ভিডিও, না থাকলে ছবি ধরে নেওয়া
        const isVideo = data.url.includes('.mp4') || !url.includes('/p/');
        formats.push({
            quality: isVideo ? 'HD Video' : 'High Res Image',
            ext: isVideo ? 'mp4' : 'jpg',
            url: data.url,
        });
    }

    if (formats.length === 0) {
        throw new Error('No media found in this URL.');
    }

    // ফ্রন্টএন্ডের জন্য ডাটা প্যাক করা
    const mediaInfo = {
      title: 'Instagram Post / Reels',
      thumbnail: thumbnail,
      formats: formats
    };

    return NextResponse.json({ success: true, data: mediaInfo }, { 
        status: 200, 
        headers: { 'Access-Control-Allow-Origin': '*' } 
    });

  } catch (error: any) {
    console.error('IG Scraper Error:', error.message);
    return NextResponse.json({ success: false, error: 'Failed to fetch Instagram media. The post might be private or unavailable.' }, { 
        status: 500, 
        headers: { 'Access-Control-Allow-Origin': '*' } 
    });
  }
}
