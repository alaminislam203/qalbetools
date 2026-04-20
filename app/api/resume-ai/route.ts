import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const { personalInfo, experience, skills, jobDescription } = await req.json();

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
        // Return dummy data if API key is missing for demonstration
        return NextResponse.json({
            status: true,
            data: {
                summary: "AI Professional with deep expertise in full-stack development and automation. (API Key missing - using dummy data)",
                experience: [
                    { company: "Syntactic AI", role: "Sr. Developer", duration: "2022 - Present", details: "Led development of AI suites." },
                    { company: "Qalbe Devs", role: "Web Master", duration: "2020 - 2022", details: "Managed high-traffic media tools." }
                ],
                skills: ["React", "Next.js", "FFmpeg", "Node.js", "AI Integration"],
                education: [{ school: "Global University", degree: "B.Sc in Computer Science", year: "2020" }]
            }
        });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      You are a professional Resume Expert. Create a high-quality resume in JSON format based on the following information:
      
      PERSONAL INFO: ${JSON.stringify(personalInfo)}
      RAW EXPERIENCE: ${experience}
      SKILLS: ${skills}
      TARGET JOB DESCRIPTION (Optional): ${jobDescription}

      Return ONLY a JSON object with this exact structure:
      {
        "summary": "professional summary",
        "experience": [{"company": "", "role": "", "duration": "", "details": ""}],
        "skills": ["skill1", "skill2"],
        "education": [{"school": "", "degree": "", "year": ""}]
      }
      
      Optimize the content for Applicant Tracking Systems (ATS).
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up potential markdown code blocks in Gemini's response
    const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const data = JSON.parse(jsonStr);

    return NextResponse.json({ status: true, data });
  } catch (error: any) {
    console.error(">>> [Resume AI Error]", error);
    return NextResponse.json({ status: false, error: error.message }, { status: 500 });
  }
}
