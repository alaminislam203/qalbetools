import { NextResponse } from 'next/server';
import { getSystemSettings } from '@/lib/system';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-token',
};

const SHUTDOWN_MESSAGE = {
    success: false,
    error: 'YouTube Downloader & API is temporarily shut down.',
    message: 'ইউটিউব ডাউনলোডার সাময়িক বন্ধ। অনুগ্রহ করে পরে চেষ্টা করুন বা অন্য টুল ব্যবহার করুন।',
    status: 'SHUT_DOWN'
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS });
}

export async function GET() {
    const settings = await getSystemSettings();
    if (!settings.youtube_enabled) {
        return NextResponse.json(SHUTDOWN_MESSAGE, { status: 503, headers: CORS });
    }
    return NextResponse.json({ success: true, message: 'YouTube API is online.' }, { status: 200, headers: CORS });
}

export async function POST() {
    const settings = await getSystemSettings();
    if (!settings.youtube_enabled) {
        return NextResponse.json(SHUTDOWN_MESSAGE, { status: 503, headers: CORS });
    }
    
    // In a real scenario, the downloader logic would be here.
    // For now, we are maintaining the shutdown state until the admin toggles it back on.
    return NextResponse.json(SHUTDOWN_MESSAGE, { status: 503, headers: CORS });
}
