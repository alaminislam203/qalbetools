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

    if (!url || !url.includes('facebook.com') && !url.includes('fb.watch')) {
      return NextResponse.json({ success: false, error: 'Valid Facebook URL required' }, { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    // ১. প্রথমে রিডাইরেক্ট লিঙ্ক (যেমন /share/v/) সলভ করে আসল লিঙ্ক বের করা
    let finalUrl = url;
    try {
        const redirectRes = await fetch(url, { method: 'HEAD', redirect: 'follow' });
        finalUrl = redirectRes.url;
    } catch (e) {
        console.log("Redirect check failed, using original URL.");
    }

    // ২. ফেসবুকের পেজ থেকে সরাসরি HTML ডাটা স্ক্র্যাপ করা (ব্রাউজারের ছদ্মবেশে)
    const response = await fetch(finalUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-Mode': 'navigate',
      }
    });

    const html = await response.text();

    // ৩. Regex দিয়ে HTML এর ভেতর থেকে ভিডিওর ডিরেক্ট লিঙ্ক বের করা
    const hdMatch = html.match(/"hd_src":"([^"]+)"/);
    const sdMatch = html.match(/"sd_src":"([^"]+)"/);
    const titleMatch = html.match(/<title>(.*?)<\/title>/);

    let title = 'Facebook Video';
    if (titleMatch && titleMatch[1]) {
        // টাইটেল থেকে অপ্রয়োজনীয় লেখা বাদ দেওয়া
        title = titleMatch[1].replace(' | Facebook', '').replace('&quot;', '"');
    }

    const formats = [];

    // ডিরেক্ট লিঙ্কগুলোকে ডিকোড করা (ফেসবুকের \/ কে / তে রূপান্তর করা)
    if (hdMatch && hdMatch[1] !== 'null') {
        formats.push({
            quality: 'HD Quality',
            url: hdMatch[1].split('\\/').join('/'),
            filesize: 'Ready'
        });
    }

    if (sdMatch && sdMatch[1] !== 'null') {
        formats.push({
            quality: 'SD Quality',
            url: sdMatch[1].split('\\/').join('/'),
            filesize: 'Ready'
        });
    }

    if (formats.length === 0) {
        throw new Error('No public video source found in the page HTML.');
    }

    const mediaInfo = {
      title: title,
      thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?q=80&w=600&auto=format&fit=crop', // ডিফল্ট কভার
      formats: formats
    };

    return NextResponse.json({ success: true, data: mediaInfo }, { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } });

  } catch (error: any) {
    console.error('Regex Scraper Error:', error.message);
    return NextResponse.json({ success: false, error: 'ভিডিওটি প্রাইভেট অথবা ফেসবুক লিঙ্কটি ব্লক করে রেখেছে।' }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
}
