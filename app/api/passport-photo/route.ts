import { NextResponse, NextRequest } from 'next/server';
import { validateApiToken } from '@/lib/api-auth';

export const maxDuration = 60; // Vercel Timeout Fix

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-token',
};

// ── ১. CORS প্রিফ্লাইট ─────────────────────────────────────────────────────────
export async function OPTIONS() { return new NextResponse(null, { status: 200, headers: CORS }); }

// ── ২. POST: Remove Background (AI Engine) ────────────────────────────────────
export async function POST(req: NextRequest) {
  // ── Pro Authentication ──────────────────────────────────────────────
  const auth = await validateApiToken(req);
  if (!auth.success) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401, headers: CORS });
  }

  try {
    const formData = await req.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      return NextResponse.json({ success: false, error: 'No image file provided.' }, { status: 400, headers: CORS });
    }

    // আপনার থার্ড-পার্টি Background Removal API Key (Vercel-এ সেট করবেন)
    // উদাহরণ: removal.ai API
    const API_KEY = process.env.REMOVE_BG_API_KEY; 
    
    if (!API_KEY) {
        throw new Error('REMOVE_BG_API_KEY is missing.');
    }

    console.log("Processing image for background removal...");

    // থার্ড-পার্টি API কে কল করা (এখানে removal.ai এর উদাহরণ দেওয়া হলো)
    const externalApiData = new FormData();
    externalApiData.append('image_file', imageFile);
    // optional: externalApiData.append('bg_color', 'white'); // যদি সরাসরি কালার চান

    const res = await fetch('https://api.removal.ai/3.0/remove', {
        method: 'POST',
        headers: {
            'Rm-Token': API_KEY,
            // 'Content-Type' header automatically set by FormData
        },
        body: externalApiData
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || 'Failed to connect to removal AI.');
    }

    // API সাধারণত একটি Base64 বা ছবির URL রিটার্ন করে
    // removal.ai low-res ছবির URL দেয় ফ্রি টায়ারে।
    if (data.status === 1 && data.url) {
         // ছবির URL টিকে সরাসরি Vercel থেকে fetch করে base64 এ কনভার্ট করে পাঠানো
         // যাতে ফ্রন্টএন্ডে CORS এর ঝামেলা না হয়
         const imgRes = await fetch(data.url);
         const imgBuffer = await imgRes.arrayBuffer();
         const base64Image = Buffer.from(imgBuffer).toString('base64');
         const finalDataUrl = `data:image/png;base64,${base64Image}`;

         return NextResponse.json({ success: true, data: { base64: finalDataUrl } }, { status: 200, headers: CORS });
    } else {
         throw new Error('AI processing failed or low resolution.');
    }

  } catch (err: any) {
    console.error('[Passport Photo Error]:', err.message);
    return NextResponse.json(
      { success: false, error: 'ফটো প্রসেস করা যায়নি। API Key চেক করুন।', details: err.message },
      { status: 500, headers: CORS }
    );
  }
}
