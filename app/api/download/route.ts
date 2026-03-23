import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const fileUrl = searchParams.get('url');
    const ext = searchParams.get('ext') || 'mp4';

    if (!fileUrl) {
        return new NextResponse('Media URL is required', { status: 400 });
    }

    try {
        // ইনস্টাগ্রামের সার্ভার থেকে ফাইলটি ফেচ করা (ফেক হেডার দিয়ে)
        const response = await fetch(fileUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://www.instagram.com/'
            }
        });

        if (!response.ok) throw new Error('Failed to fetch from Instagram CDN');

        // ফাইলটি সরাসরি ডাউনলোড হওয়ার জন্য হেডার সেট করা
        const headers = new Headers(response.headers);
        headers.set('Content-Disposition', `attachment; filename="QalbeTalks_IG_Media.${ext}"`);
        headers.set('Content-Type', 'application/octet-stream'); // ব্রাউজারকে বাধ্য করা ডাউনলোড করতে
        headers.set('Access-Control-Allow-Origin', '*');

        return new NextResponse(response.body, {
            status: 200,
            headers
        });
    } catch (error) {
        return new NextResponse('Download Failed. CDN Blocked.', { status: 500 });
    }
}