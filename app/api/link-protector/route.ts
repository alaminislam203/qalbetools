import { NextResponse } from 'next/server';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() { return new NextResponse(null, { status: 200, headers: CORS }); }

// ── ১. GET: লিংকগুলো আনলক করার জন্য ───────────────────────────────────────────
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ success: false, error: 'Link ID is missing' }, { status: 400, headers: CORS });

  try {
    const response = await fetch(`https://bytebin.lucko.me/${id}`);
    if (!response.ok) throw new Error('Links not found');
    
    // JSON ডাটা হিসেবে রিড করা
    const data = await response.json();
    return NextResponse.json({ success: true, data: data }, { status: 200, headers: CORS });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'লিংকগুলো পাওয়া যায়নি অথবা ডিলিট হয়ে গেছে।' }, { status: 404, headers: CORS });
  }
}

// ── ২. POST: মাল্টি-লিংক প্রটেক্ট (সেভ) করার জন্য ────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { title, links } = body;

    if (!links || !Array.isArray(links) || links.length === 0) {
      return NextResponse.json({ success: false, error: 'কমপক্ষে একটি লিংক দিতে হবে!' }, { status: 400, headers: CORS });
    }

    // ডাটাগুলোকে JSON স্ট্রিং হিসেবে তৈরি করা
    const payload = JSON.stringify({
        title: title || 'Protected Links',
        links: links,
        createdAt: new Date().toISOString()
    });

    // ByteBin এ JSON ডাটা সেভ করা
    const res = await fetch('https://bytebin.lucko.me/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload
    });

    const data = await res.json();
    if (!data.key) throw new Error('Failed to generate protector ID');

    return NextResponse.json({ success: true, data: { id: data.key } }, { status: 200, headers: CORS });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'সার্ভার সমস্যা, আবার চেষ্টা করুন।' }, { status: 500, headers: CORS });
  }
}
