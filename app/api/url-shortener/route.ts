import { NextResponse, NextRequest } from 'next/server';
import { validateApiToken } from '@/lib/api-auth';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-token',
};

// ── ১. CORS প্রিফ্লাইট ─────────────────────────────────────────────────────────
export async function OPTIONS() { return new NextResponse(null, { status: 200, headers: CORS }); }

// ── ২. POST: URL Shortener API ─────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // ── Pro Authentication ──────────────────────────────────────────────
  const auth = await validateApiToken(req);
  if (!auth.success) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401, headers: CORS });
  }

  try {
    const body = await req.json().catch(() => ({}));
    let { url } = body as { url?: string };

    if (!url || url.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'দয়া করে একটি ভ্যালিড লিঙ্ক দিন।' }, { status: 400, headers: CORS });
    }

    // যদি ইউজার http:// বা https:// দিতে ভুলে যায়, তবে অটোমেটিক অ্যাড করে দেওয়া
    if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
    }

    // is.gd এর ফাস্ট এবং ফ্রি API ব্যবহার করে লিঙ্ক শর্ট করা
    const response = await fetch(`https://is.gd/create.php?format=json&url=${encodeURIComponent(url)}`);
    const data = await response.json();

    if (data.errorcode) {
         throw new Error(data.errormessage || 'লিঙ্কটি শর্ট করা সম্ভব হয়নি।');
    }

    // QR কোডের লিঙ্ক জেনারেট করা (ফ্রি API ব্যবহার করে)
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.shorturl)}`;

    return NextResponse.json({ 
        success: true, 
        data: { 
            originalUrl: url, 
            shortUrl: data.shorturl,
            qrCode: qrCodeUrl
        } 
    }, { status: 200, headers: CORS });

  } catch (err: any) {
    console.error('https://docs.contentstudio.io/article/495-why-is-link-shortener-not-working:', err.message);
    return NextResponse.json(
      { success: false, error: 'সার্ভার সমস্যা। আবার চেষ্টা করুন।', details: err.message },
      { status: 500, headers: CORS }
    );
  }
}
