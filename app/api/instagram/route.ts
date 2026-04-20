import { NextRequest, NextResponse } from 'next/server';

// ab-downloader is a CommonJS package
const { igdl } = require('ab-downloader');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'Instagram URL is required' }, { status: 400 });
    }

    const data = await igdl(url);

    if (!data || !Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: 'Could not fetch Instagram content. Please ensure the post is public.' },
        { status: 500 }
      );
    }

    // Normalize Instagram response
    const normalizedData = data.map((item: any) => {
      const urlString = (item.url || '').toLowerCase();
      
      // Improved Video Detection Logic
      const isVideo = 
        item.type === 'video' || // Library metadata
        urlString.includes('.mp4') || 
        urlString.includes('fbcdn.net/v/') || 
        urlString.includes('_n.mp4') ||
        urlString.includes('video_dashinit') ||
        url.toLowerCase().includes('/reels/') || // Current URL context
        url.toLowerCase().includes('/tv/');

      return {
        thumbnail: item.thumbnail || '',
        url: item.url || '',
        type: isVideo ? 'video' : 'image',
        quality: isVideo ? 'HD' : 'Original',
        format: isVideo ? 'mp4' : 'jpg',
        size: isVideo ? 'Estimated 2-5 MB' : 'Estimated 500 KB'
      };
    });

    return NextResponse.json({
      success: true,
      data: normalizedData,
      title: 'Instagram Content'
    });

  } catch (error: any) {
    console.error('Instagram Downloader Error:', error);
    return NextResponse.json(
      { error: error.message || 'An internal server error occurred' },
      { status: 500 }
    );
  }
}
