import { NextResponse } from 'next/server';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// ── ১. CORS প্রিফ্লাইট ─────────────────────────────────────────────────────────
export async function OPTIONS() { return new NextResponse(null, { status: 200, headers: CORS }); }

// ── ২. POST: AI Grammar Checker (Powered by Gemini) ───────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { text } = body as { text?: string };

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Please provide some text to check.' }, { status: 400, headers: CORS });
    }

    // Vercel Environment Variable থেকে API Key নেওয়া
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is missing in Vercel Environment Variables.');
    }

    // AI-এর জন্য প্রম্পট রেডি করা
    const prompt = `You are an expert English grammar and spell checker. Please correct the following text. 
    Fix all grammatical, spelling, and punctuation errors. Improve the sentence structure and flow while strictly preserving the original meaning. 
    IMPORTANT: Do not add any conversational filler, explanations, or quotes around the output. Only return the final corrected text.
    
    Text to correct:
    ${text}`;

    // Gemini API কল
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { 
                temperature: 0.1, // গ্রামার চেকের জন্য টেম্পারেচার একদম কম রাখা ভালো
                maxOutputTokens: 2048
            }
        })
    });

    const data = await res.json();
    
    if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to connect to AI server.');
    }

    // AI এর রেসপন্স থেকে টেক্সট বের করা
    const correctedText = data.candidates[0].content.parts[0].text.trim();

    return NextResponse.json({ success: true, data: { original: text, corrected: correctedText } }, { status: 200, headers: CORS });

  } catch (err: any) {
    console.error('[Grammar Check Error]:', err.message);
    return NextResponse.json(
      { success: false, error: 'Failed to process text.', details: err.message },
      { status: 500, headers: CORS }
    );
  }
}
