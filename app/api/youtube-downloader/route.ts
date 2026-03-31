import { NextResponse } from 'next/server';

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
    return NextResponse.json(SHUTDOWN_MESSAGE, { status: 503, headers: CORS });
}

export async function POST() {
    return NextResponse.json(SHUTDOWN_MESSAGE, { status: 503, headers: CORS });
}
