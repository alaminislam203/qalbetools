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
    const { text, tone = 'Standard', length = 'Standard' } = body;

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Please provide text to rewrite.' }, { status: 400, headers: CORS });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is missing.');

    // মাল্টি-ফিচার প্রম্পট (Tone এবং Length অনুযায়ী)
    const prompt = `You are an expert content writer and editor. Rewrite the following text based on the given instructions.

    Instructions:
    - Tone: ${tone} (Adjust the vocabulary and style to match this tone).
    - Length: ${length} (If 'Shorten', make it concise. If 'Expand', add relevant details. If 'Standard', keep the original length).
    - Maintain the core message and meaning of the original text.
    - Output ONLY the rewritten text. Do not include any conversational filler, quotes, or explanations.

    Original Text:
    ${text}`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { 
                temperature: 0.7, // ক্রিয়েটিভিটির জন্য টেম্পারেচার একটু বাড়ানো হলো
                maxOutputTokens: 2048
            }
        })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'AI API Error');

    const rewrittenText = data.candidates[0].content.parts[0].text.trim();

    return NextResponse.json({ success: true, data: { rewritten: rewrittenText } }, { status: 200, headers: CORS });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Failed to rewrite text.', details: err.message }, { status: 500, headers: CORS });
  }
}
