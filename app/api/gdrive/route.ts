import { NextRequest, NextResponse } from 'next/server';

const { gdrive } = require('ab-downloader');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'Google Drive URL is required' }, { status: 400 });
    }

    const data = await gdrive(url);

    // GDrive returns { result: { downloadUrl, fileName, fileSize, ... } }
    if (!data || !data.result || !data.result.downloadUrl) {
      return NextResponse.json(
        { error: 'Could not fetch Google Drive file. Ensure the link is public and allows direct downloads.' },
        { status: 500 }
      );
    }

    const fileInfo = data.result;

    // Normalize for UniversalDownloader
    const normalizedData = [
      {
        title: fileInfo.fileName || 'Google Drive File',
        thumbnail: '', 
        url: fileInfo.downloadUrl,
        type: 'file',
        size: fileInfo.fileSize || 'Unknown'
      }
    ];

    return NextResponse.json({
      success: true,
      data: normalizedData,
    });

  } catch (error: any) {
    console.error('Google Drive Downloader Error:', error);
    return NextResponse.json(
      { error: error.message || 'An internal server error occurred' },
      { status: 500 }
    );
  }
}
