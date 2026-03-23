import { NextResponse } from 'next/server';

// CORS Handle for WordPress Frontend
export async function OPTIONS(req: Request) {
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

    if (!url || !url.includes('facebook.com')) {
      return NextResponse.json({ success: false, error: 'Valid Facebook URL required' }, { 
          status: 400, 
          headers: { 'Access-Control-Allow-Origin': '*' } 
      });
    }

    // Cobalt API কল করা হলো (এটি Vercel-এর IP বাইপাস করে কাজ করবে)
    const cobaltResponse = await fetch('https://api.cobalt.tools/api/json', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      body: JSON.stringify({
        url: url,
        vQuality: "720", // ডিফল্টভাবে HD কোয়ালিটি রিকোয়েস্ট করবে
        filenamePattern: "classic"
      })
    });

    const data = await cobaltResponse.json();

    // যদি Cobalt থেকে কোনো এরর আসে
    if (data.status === 'error') {
        throw new Error(data.text || 'Facebook block error');
    }

    // ভিডিওর আসল ডাউনলোড লিঙ্ক বের করা
    let downloadUrl = '';
    if (data.url) {
        downloadUrl = data.url;
    } else if (data.picker && data.picker.length > 0) {
        downloadUrl = data.picker[0].url; // মাল্টিপল সোর্স থাকলে প্রথমটি নেবে
    }

    // ওয়ার্ডপ্রেস ফ্রন্টএন্ডের জন্য ডাটা সাজানো
    const mediaInfo = {
      title: 'Facebook Video (HD)',
      thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?q=80&w=600&auto=format&fit=crop', // ডিফল্ট থাম্বনেইল
      formats: [
        {
          quality: 'HD / Auto',
          url: downloadUrl,
          filesize: 'Ready',
        }
      ]
    };

    return NextResponse.json({ success: true, data: mediaInfo }, { 
        status: 200, 
        headers: { 'Access-Control-Allow-Origin': '*' } 
    });

  } catch (error: any) {
    console.error('Bypass API Error:', error.message);
    return NextResponse.json({ success: false, error: 'Facebook API blocked the request or the video is strictly private.' }, { 
        status: 500, 
        headers: { 'Access-Control-Allow-Origin': '*' } 
    });
  }
}
