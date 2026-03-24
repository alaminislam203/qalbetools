import { NextResponse } from 'next/server';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() { return new NextResponse(null, { status: 200, headers: CORS }); }

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { content, title = "Untitled Paste", syntax = "text", expiry = "1" } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'কিছু তো লিখুন!' }, { status: 400, headers: CORS });
    }

    // dpaste API ব্যবহার করে পেস্ট তৈরি (এটি ১ দিন থেকে ৩০ দিন পর্যন্ত স্টোর থাকে)
    const res = await fetch('https://dpaste.org/api/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            content: content,
            title: title,
            syntax: syntax,
            expiry_days: expiry
        })
    });

    const pasteUrl = await res.text(); // এটি সরাসরি লিঙ্ক রিটার্ন করে

    if (!res.ok) throw new Error('dpaste API error');

    return NextResponse.json({ 
        success: true, 
        data: { 
            url: pasteUrl.trim(),
            rawUrl: pasteUrl.trim() + '.txt'
        } 
    }, { status: 200, headers: CORS });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'পেস্ট তৈরি করা যায়নি।' }, { status: 500, headers: CORS });
  }
}

// ── ২. GET: Fetch Paste Content (View Bin এর জন্য) ─────────────────────────
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ success: false, error: 'Paste ID is missing' }, { status: 400, headers: CORS });
  }

  try {
    // dpaste-এর .txt এক্সটেনশন দিয়ে সরাসরি র-ডাটা (Raw Data) ফেচ করা
    const response = await fetch(`https://dpaste.org/${id}.txt`);
    
    if (!response.ok) throw new Error('Paste not found or expired');
    
    const content = await response.text();

    return NextResponse.json({ success: true, data: { content } }, { status: 200, headers: CORS });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'পেস্টটি পাওয়া যায়নি অথবা মেয়াদ শেষ হয়ে গেছে।', details: err.message }, { status: 404, headers: CORS });
  }
}
