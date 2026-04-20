import { exec } from "child_process";
import { promisify } from "util";
import { NextResponse } from "next/server";

const execPromise = promisify(exec);

export async function GET() {
  try {
    const health: any = {
      timestamp: new Date().toISOString(),
      systems: {
        ffmpeg: { status: "checking", version: null },
        gemini: { status: "checking" },
        storage: { status: "online" }
      },
      apis: [
        { name: "Facebook Downloader", endpoint: "/api/facebook", status: "online" },
        { name: "Ultra Stream Engine", endpoint: "/api/stream/ultra", status: "online" },
        { name: "Resume AI Engine", endpoint: "/api/resume-ai", status: "online" },
        { name: "YouTube Engine", endpoint: "/api/youtube", status: "online" }
      ]
    };

    // 1. Check FFmpeg Presence
    try {
      const { stdout } = await execPromise("ffmpeg -version");
      health.systems.ffmpeg.status = "online";
      health.systems.ffmpeg.version = stdout.split("\n")[0];
    } catch (e) {
      health.systems.ffmpeg.status = "offline";
      health.systems.ffmpeg.error = "FFmpeg not found in system PATH";
    }

    // 2. Check Gemini Config
    if (process.env.GOOGLE_GEMINI_API_KEY) {
      health.systems.gemini.status = "online";
    } else {
      health.systems.gemini.status = "offline";
      health.systems.gemini.error = "API Key missing in .env";
    }

    return NextResponse.json({ status: true, health });
  } catch (error: any) {
    return NextResponse.json({ status: false, error: error.message }, { status: 500 });
  }
}
