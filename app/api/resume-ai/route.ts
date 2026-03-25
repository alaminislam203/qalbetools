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
    const { action, jobTitle, rawText } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is missing.');

    let prompt = '';

    // Action 1: Generate Professional Summary
    if (action === 'summary') {
        if (!jobTitle) return NextResponse.json({ success: false, error: 'Job title is required.' }, { status: 400, headers: CORS });
        prompt = `Act as an expert career coach. Write a highly professional, engaging, and concise Resume Summary (3-4 sentences) for a "${jobTitle}". 
        Highlight enthusiasm, core competencies, and readiness to contribute to a company. Do not use quotes or introductory text, just provide the summary.`;
    } 
    // Action 2: Enhance Experience Bullet Points
    else if (action === 'experience') {
        if (!rawText) return NextResponse.json({ success: false, error: 'Raw experience text is required.' }, { status: 400, headers: CORS });
        prompt = `Act as an expert resume writer. Rewrite the following raw work experience into 3-4 professional, impactful, and action-oriented bullet points suitable for a CV. 
        Raw text: "${rawText}"
        Format the output as a simple list with bullet points. Do not include any extra conversation.`;
    } else {
        return NextResponse.json({ success: false, error: 'Invalid action.' }, { status: 400, headers: CORS });
    }

    // Call Gemini API
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
        })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'AI API Error');

    const aiText = data.candidates[0].content.parts[0].text.trim();

    return NextResponse.json({ success: true, data: { result: aiText } }, { status: 200, headers: CORS });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Failed to generate AI content.', details: err.message }, { status: 500, headers: CORS });
  }
}
