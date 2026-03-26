import { NextResponse } from 'next/server';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() { return new NextResponse(null, { status: 200, headers: CORS }); }

// 🔥 এটি হলো আপনার এক্সেল ডাটাবেজ (এখানে আপনার ফাইলগুলোর ইনফো অ্যাড করবেন)
const myDatabase = [
    { id: 1, title: "QalbeTalks Premium Typing Software", type: "Software", size: "150 MB", link: "https://drive.google.com/file/d/..." },
    { id: 2, title: "Islamic Nasheed Collection 2026", type: "Audio", size: "45 MB", link: "https://example.com/audio.mp3" },
    { id: 3, title: "Web Development Masterclass", type: "Video", size: "1.2 GB", link: "https://example.com/video.mp4" },
    { id: 4, title: "WordPress Premium Theme Bundle", type: "ZIP", size: "300 MB", link: "https://example.com/theme.zip" },
    { id: 5, title: "1000+ Prompt Engineering Guide", type: "PDF", size: "5 MB", link: "https://example.com/book.pdf" }
];

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { query } = body;

    if (!query) {
      return NextResponse.json({ success: false, error: 'দয়া করে কিছু লিখে সার্চ করুন।' }, { status: 400, headers: CORS });
    }

    const searchTerm = query.toLowerCase().trim();

    // ডাটাবেজ থেকে সার্চ করা (Title বা Type এর সাথে মিলিয়ে)
    const results = myDatabase.filter(item => 
        item.title.toLowerCase().includes(searchTerm) || 
        item.type.toLowerCase().includes(searchTerm)
    );

    return NextResponse.json({ success: true, data: results }, { status: 200, headers: CORS });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'সার্ভার এরর। ডাটাবেজ কানেক্ট করা যাচ্ছে না।' }, { status: 500, headers: CORS });
  }
}
