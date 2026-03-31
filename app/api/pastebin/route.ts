import { NextResponse, NextRequest } from 'next/server';
import { validateApiToken } from '@/lib/api-auth';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-token',
};

export async function OPTIONS() { return new NextResponse(null, { status: 200, headers: CORS }); }

// ── ১. GET: পেস্ট রিড করার জন্য (View Page) ───────────────────────────────────
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ success: false, error: 'Paste ID is missing' }, { status: 400, headers: CORS });

  try {
    const response = await fetch(`https://bytebin.lucko.me/${id}`);
    if (!response.ok) throw new Error('Paste not found');
    
    const content = await response.text();
    return NextResponse.json({ success: true, data: { content } }, { status: 200, headers: CORS });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'পেস্টটি পাওয়া যায়নি!' }, { status: 404, headers: CORS });
  }
}

// ── ২. POST: পেস্ট তৈরি করার জন্য ──────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // ── Pro Authentication ──────────────────────────────────────────────
  const auth = await validateApiToken(req);
  if (!auth.success) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401, headers: CORS });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'কিছু তো লিখুন!' }, { status: 400, headers: CORS });
    }

    // ByteBin API: Extremely Fast & No DB required
    const res = await fetch('https://bytebin.lucko.me/post', {
        method: 'POST',
        headers: { 
            'Content-Type': 'text/plain',
            'User-Agent': 'QalbeTalks-Pastebin'
        },
        body: content
    });

    const data = await res.json();
    
    if (!data.key) throw new Error('Failed to generate paste ID');

    return NextResponse.json({ 
        success: true, 
        data: { id: data.key } // এটি শুধু একটি ছোট ID দেবে (যেমন: xyz123)
    }, { status: 200, headers: CORS });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'পেস্ট তৈরি করা যায়নি। আবার চেষ্টা করুন।' }, { status: 500, headers: CORS });
  }
}
