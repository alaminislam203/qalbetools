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
    const { action, jobTitle, rawText, name, summary, jobDesc, skills, cvText } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is missing.');

    let prompt = '';

    // Action 1: Generate Professional Summary
    if (action === 'summary') {
        if (!jobTitle) return NextResponse.json({ success: false, error: 'Job title is required.' }, { status: 400, headers: CORS });
        prompt = `Act as an expert career coach. Write a highly professional, engaging, and concise Resume Summary (3-4 sentences) for a "${jobTitle}". 
        Highlight enthusiasm, core competencies, and readiness to contribute to a company. Do not use quotes or introductory text, just provide the summary directly.`;
    } 
    // Action 2: Enhance Experience Bullet Points
    else if (action === 'experience') {
        if (!rawText) return NextResponse.json({ success: false, error: 'Raw experience text is required.' }, { status: 400, headers: CORS });
        prompt = `Act as an expert resume writer. Rewrite the following raw work experience into 3-4 professional, impactful, and action-oriented bullet points suitable for a CV. 
        Use strong action verbs and quantify achievements where possible (e.g., "Increased X by Y%").
        Raw text: "${rawText}"
        Format the output as a simple list starting each line with "• ". Do not include any extra conversation or preamble.`;
    }
    // Action 3: Suggest Skills based on Job Title
    else if (action === 'skills') {
        if (!jobTitle) return NextResponse.json({ success: false, error: 'Job title is required.' }, { status: 400, headers: CORS });
        prompt = `You are a career expert. List 8-10 most in-demand professional skills (both hard and soft skills) for a "${jobTitle}" role.
        Format: one skill per line, starting with "• ". No explanations, no grouping headers, just the skill names.`;
    }
    // Action 4: Generate Cover Letter
    else if (action === 'coverLetter') {
        if (!name || !jobTitle) return NextResponse.json({ success: false, error: 'Name and job title are required.' }, { status: 400, headers: CORS });
        prompt = `Write a professional and compelling cover letter for ${name}, who is applying for a ${jobTitle} position.
        ${summary ? `Their professional summary: "${summary}"` : ''}
        ${skills ? `Their key skills: ${skills}` : ''}
        ${jobDesc ? `Job description to tailor for: "${jobDesc.substring(0, 500)}"` : ''}
        
        The cover letter should be 3-4 paragraphs: introduction, body highlighting relevant experience, and a strong closing with a call to action.
        Use a professional yet personable tone. Do not add placeholders like [Company Name] - keep it general and compelling.
        Start directly with "Dear Hiring Manager," and end with "Sincerely, ${name}".`;
    }
    // Action 5: ATS Score and Analysis
    else if (action === 'ats') {
        if (!cvText) return NextResponse.json({ success: false, error: 'CV text is required.' }, { status: 400, headers: CORS });
        prompt = `Act as an ATS (Applicant Tracking System) expert and career coach. Analyze this resume content:
        "${cvText.substring(0, 1500)}"
        ${jobDesc ? `Against this job description: "${jobDesc.substring(0, 500)}"` : ''}
        
        Provide a structured analysis with:
        1. ATS COMPATIBILITY SCORE: X/100
        2. KEYWORD MATCH: List matched and missing keywords
        3. FORMATTING ISSUES: Any problems found
        4. STRENGTHS: What's working well (2-3 points)
        5. IMPROVEMENTS NEEDED: Top 3 specific suggestions to improve the resume
        
        Be concise and actionable.`;
    }
    else {
        return NextResponse.json({ success: false, error: 'Invalid action.' }, { status: 400, headers: CORS });
    }

    // Call Gemini API
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 1500 }
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
