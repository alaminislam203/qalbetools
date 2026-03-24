import { NextResponse } from 'next/server';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() { 
  return new NextResponse(null, { status: 200, headers: CORS }); 
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { content, title = "Untitled Paste", syntax = "text", expiry = "1" } = body;

    // ভ্যালিডেশন
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'কিছু তো লিখুন!' }, 
        { status: 400, headers: CORS }
      );
    }

    // expiry days কে সংখ্যায় কনভার্ট
    const expiryDays = parseInt(expiry, 10);
    
    // dpaste API এর জন্য প্যারামিটার তৈরি
    const params = new URLSearchParams({
      content: content.trim(),
      title: title.substring(0, 100), // টাইটেল লিমিট
      syntax: syntax,
      expiry_days: expiryDays.toString()
    });

    // dpaste API এ POST রিকোয়েস্ট
    const response = await fetch('https://dpaste.org/api/', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'QalbeTools/1.0' // কিছু API ইউজার এজেন্ট চেক করে
      },
      body: params
    });

    // রেসপন্স চেক
    if (!response.ok) {
      const errorText = await response.text();
      console.error('dpaste API error:', response.status, errorText);
      throw new Error(`dpaste API responded with ${response.status}`);
    }

    // dpaste URL পেতে রেসপন্স টেক্সট পড়া
    const pasteUrl = await response.text();
    
    // URL ভ্যালিডেশন
    if (!pasteUrl || !pasteUrl.startsWith('https://dpaste.org/')) {
      throw new Error('Invalid response from dpaste');
    }

    const trimmedUrl = pasteUrl.trim();
    
    // URL থেকে ID বের করা (যদি JSON না হয়)
    const urlParts = trimmedUrl.split('/');
    const pasteId = urlParts[urlParts.length - 1];
    
    if (!pasteId) {
      throw new Error('Could not extract paste ID');
    }

    return NextResponse.json(
      { 
        success: true, 
        data: { 
          url: trimmedUrl,
          rawUrl: `https://dpaste.org/${pasteId}.txt`,
          id: pasteId
        } 
      }, 
      { status: 200, headers: CORS }
    );

  } catch (err: any) {
    console.error('Paste creation error:', err);
    return NextResponse.json(
      { 
        success: false, 
        error: 'পেস্ট তৈরি করা যায়নি। আবার চেষ্টা করুন।',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      }, 
      { status: 500, headers: CORS }
    );
  }
}

// ── ২. GET: Fetch Paste Content (View Bin এর জন্য) ─────────────────────────
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { success: false, error: 'Paste ID is missing' }, 
      { status: 400, headers: CORS }
    );
  }

  // ID ক্লিন করা (যেকোনো অতিরিক্ত স্পেস বা স্ল্যাশ রিমুভ)
  const cleanId = id.trim().replace(/[\/\\]/g, '');
  
  if (!cleanId.match(/^[a-zA-Z0-9]+$/)) {
    return NextResponse.json(
      { success: false, error: 'Invalid paste ID format' }, 
      { status: 400, headers: CORS }
    );
  }

  try {
    // dpaste এর র-ডাটা ফেচ করা (.txt এক্সটেনশন দিয়ে)
    const dpasteUrl = `https://dpaste.org/${cleanId}.txt`;
    console.log('Fetching from:', dpasteUrl); // ডিবাগিং এর জন্য
    
    const response = await fetch(dpasteUrl, {
      headers: {
        'User-Agent': 'QalbeTools/1.0'
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Paste not found or expired');
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const content = await response.text();
    
    // কন্টেন্ট ভ্যালিডেশন
    if (!content || content.trim().length === 0) {
      throw new Error('Empty paste content');
    }

    return NextResponse.json(
      { 
        success: true, 
        data: { 
          content: content,
          id: cleanId
        } 
      }, 
      { status: 200, headers: CORS }
    );

  } catch (err: any) {
    console.error('Error fetching paste:', err);
    return NextResponse.json(
      { 
        success: false, 
        error: err.message || 'পেস্টটি পাওয়া যায়নি অথবা মেয়াদ শেষ হয়ে গেছে।',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      }, 
      { status: 404, headers: CORS }
    );
  }
}
