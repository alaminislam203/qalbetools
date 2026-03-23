import { NextResponse } from 'next/server';

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
          status: 400, headers: { 'Access-Control-Allow-Origin': '*' } 
      });
    }

    let finalUrl = url.trim();
    if (!finalUrl.startsWith('http')) finalUrl = 'https://' + finalUrl;

    // Googlebot ইউজার এজেন্ট দিয়ে রিকোয়েস্ট
    const response = await fetch(finalUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    });

    const html = await response.text();
    let videoUrl = '';
    let imageUrl = '';

    // ১. Deep Scraping: JSON-LD স্কিমা থেকে ডিরেক্ট ভিডিও লিঙ্ক বের করা (রিলস এর জন্য সবচেয়ে কার্যকরী)
    const jsonLdMatch = html.match(/"contentUrl"\s*:\s*"([^"]+)"/);
    if (jsonLdMatch && jsonLdMatch[1]) {
        // ইনস্টাগ্রামের এনকোডেড ক্যারেক্টার (\u0026 এবং \/) ফিক্স করা
        videoUrl = jsonLdMatch[1].replace(/\\u0026/g, '&').replace(/\\\//g, '/');
    }

    // ২. ফলব্যাক: যদি JSON-LD তে না পায়, তবে মেটা ট্যাগ চেক করা
    if (!videoUrl) {
        const ogVideo = html.match(/<meta property="og:video" content="([^"]+)"/) || 
                        html.match(/<meta property="og:video:secure_url" content="([^"]+)"/);
        if (ogVideo && ogVideo[1]) {
            videoUrl = ogVideo[1].replace(/&amp;/g, '&');
        }
    }

    // ৩. থাম্বনেইল বা ইমেজ লিঙ্ক বের করা
    const ogImage = html.match(/<meta property="og:image" content="([^"]+)"/);
    if (ogImage && ogImage[1]) {
        imageUrl = ogImage[1].replace(/&amp;/g, '&').replace(/\\u0026/g, '&').replace(/\\\//g, '/');
    }

    const formats = [];

    // যদি ভিডিও লিঙ্ক পায়, তবে ভিডিও অপশন দেবে
    if (videoUrl) {
        formats.push({
            quality: 'HD Video MP4',
            ext: 'mp4',
            url: videoUrl
        });
    } 
    // যদি ভিডিও না পায়, শুধু ছবি থাকলে ছবির অপশন দেবে
    else if (imageUrl) {
         formats.push({
            quality: 'High Res Image',
            ext: 'jpg',
            url: imageUrl
        });
    }

    if (formats.length === 0) {
        throw new Error('No media found. The post might be strictly private.');
    }

    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    let title = 'Instagram Reels / Post';
    if (titleMatch && titleMatch[1]) {
        title = titleMatch[1].replace(' - Instagram', '').replace('&quot;', '"');
    }

    const mediaInfo = {
      title: title,
      thumbnail: imageUrl || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=600&auto=format&fit=crop',
      formats: formats
    };

    return NextResponse.json({ success: true, data: mediaInfo }, { 
        status: 200, headers: { 'Access-Control-Allow-Origin': '*' } 
    });

  } catch (error: any) {
    console.error('IG Deep Scraper Error:', error.message);
    return NextResponse.json({ success: false, error: 'ভিডিওটি পাওয়া যায়নি। এটি হয়তো প্রাইভেট রিলস।' }, { 
        status: 500, headers: { 'Access-Control-Allow-Origin': '*' } 
    });
  }
}
