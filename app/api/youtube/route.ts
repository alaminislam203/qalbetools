import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'YouTube URL is required' }, { status: 400 });
    }

    // সরাসরি এক্সটারনাল এপিআই থেকে ডেটা ফেচ করা হচ্ছে
    // এটি 'ab-downloader' লাইব্রেরির চেয়ে অনেক দ্রুত এবং স্টেবল
    const apiResponse = await fetch(`https://eu.org{encodeURIComponent(url)}`);
    
    if (!apiResponse.ok) {
      throw new Error('External API failed to respond');
    }

    const data = await apiResponse.json();

    if (!data || data.status === false) {
      return NextResponse.json(
        { error: data.message || 'Could not fetch YouTube content. YouTube links are often restricted.' },
        { status: 500 }
      );
    }

    const title = data.title || 'YouTube Video';
    const thumbnail = data.thumbnail || '';
    const normalizedData = [];

    // Extract MP4 (Video) logic
    if (data.mp4) {
      const videoUrl = typeof data.mp4 === 'string' ? data.mp4 : (data.mp4.url || data.mp4.link || '');
      if (videoUrl) {
        normalizedData.push({
          title: title,
          thumbnail: thumbnail,
          url: videoUrl,
          type: 'video',
          quality: 'Video (MP4)',
          format: 'mp4'
        });
      }
    }

    // Extract MP3 (Audio) logic
    if (data.mp3) {
      const audioUrl = typeof data.mp3 === 'string' ? data.mp3 : (data.mp3.url || data.mp3.link || '');
      if (audioUrl) {
        normalizedData.push({
          title: title,
          thumbnail: thumbnail,
          url: audioUrl,
          type: 'audio',
          quality: 'Audio (MP3)',
          format: 'mp3'
        });
      }
    }

    // অন্যান্য ফরম্যাট চেক করা (যদি থাকে)
    if (data.formats && Array.isArray(data.formats)) {
      data.formats.forEach((fmt: any) => {
        normalizedData.push({
          title: title,
          thumbnail: thumbnail,
          url: fmt.url || fmt.link || '',
          type: (fmt.ext === 'mp3' || fmt.format === 'mp3') ? 'audio' : 'video',
          quality: fmt.quality || fmt.resolution || 'Standard',
          format: fmt.ext || fmt.format || 'mp4'
        });
      });
    }

    // যদি ডেটা না পাওয়া যায় কিন্তু একটি সাধারণ লিঙ্ক থাকে
    if (normalizedData.length === 0 && data.url) {
      normalizedData.push({
        title: title,
        thumbnail: thumbnail,
        url: data.url,
        type: 'media',
        quality: 'Original',
        format: 'mp4'
      });
    }

    if (normalizedData.length === 0) {
      return NextResponse.json(
        { error: 'No downloadable links found. YouTube might be blocking the request.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: normalizedData,
      title: title
    });

  } catch (error: any) {
    console.error('YouTube Downloader Error:', error);
    return NextResponse.json(
      { error: error.message || 'An internal server error occurred' },
      { status: 500 }
    );
  }
}
