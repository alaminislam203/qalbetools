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

    // ১. Auto https:// Fixer
    let finalUrl = url.trim();
    if (!finalUrl.startsWith('http')) {
        finalUrl = 'https://' + finalUrl;
    }

    // ২. Googlebot সেজে ইনস্টাগ্রামকে বোকা বানানো (লগইন ব্লক বাইপাস)
    const response = await fetch(finalUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    });

    const html = await response.text();

    // ৩. Regex দিয়ে HTML এর ভেতর থেকে ভিডিও এবং ছবির ডিরেক্ট লিঙ্ক বের করা
    const videoMatch = html.match(/<meta property="og:video" content="([^"]+)"/);
    const imageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
    const titleMatch = html.match(/<title>(.*?)<\/title>/);

    // টাইটেল ক্লিন করা
    let title = 'Instagram Media';
    if (titleMatch && titleMatch[1]) {
        title = titleMatch[1].replace(' - Instagram', '').replace('&quot;', '"');
    }

    const formats = [];
    let thumbnail = 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=600&auto=format&fit=crop'; // ডিফল্ট কভার

    // HTML এনকোডেড লিঙ্ক ফিক্স করা (&amp; কে & তে রূপান্তর)
    if (imageMatch && imageMatch[1]) {
        thumbnail = imageMatch[1].replace(/&amp;/g, '&');
    }

    // ভিডিও লিঙ্ক থাকলে সেটি পুশ করা, না থাকলে ইমেজ পুশ করা
    if (videoMatch && videoMatch[1]) {
        formats.push({
            quality: 'HD Video MP4',
            ext: 'mp4',
            url: videoMatch[1].replace(/&amp;/g, '&')
        });
    } else if (imageMatch && imageMatch[1]) {
         formats.push({
            quality: 'High Res Image',
            ext: 'jpg',
            url: imageMatch[1].replace(/&amp;/g, '&')
        });
    }

    // কোনো মিডিয়াই না পাওয়া গেলে এরর থ্রো করবে
    if (formats.length === 0) {
        throw new Error('Media not found in HTML. The post might be strictly private.');
    }

    const mediaInfo = {
      title: title,
      thumbnail: thumbnail,
      formats: formats
    };

    return NextResponse.json({ success: true, data: mediaInfo }, { 
        status: 200, 
        headers: { 'Access-Control-Allow-Origin': '*' } 
    });

  } catch (error: any) {
    console.error('IG Scraper Error:', error.message);
    return NextResponse.json({ success: false, error: 'Failed to fetch media. The post is private or blocked by Instagram.' }, { 
        status: 500, 
        headers: { 'Access-Control-Allow-Origin': '*' } 
    });
  }
}
