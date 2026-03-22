import { NextResponse } from 'next/server';
import sharp from 'sharp';
import path from 'path';

// ডিভাইসের ডাটাবেস
const devices: Record<string, { file: string; width: number; height: number; top: number; left: number; frameW: number; frameH: number; radius: number }> = {
  iphone15: { file: 'iphone15-frame.png', width: 1290, height: 2796, top: 60, left: 65, frameW: 1420, frameH: 2916, radius: 140 },
  macbook: { file: 'macbook-frame.png', width: 2560, height: 1600, top: 120, left: 180, frameW: 2920, frameH: 2000, radius: 16 },
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// ১. CORS এর জন্য OPTIONS রিকোয়েস্ট হ্যান্ডলার যুক্ত করা হলো
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const image = formData.get('image') as File | null;
    const deviceId = formData.get('deviceId') as string | null;

    if (!image || !deviceId || !devices[deviceId]) {
      return NextResponse.json({ success: false, error: 'Invalid input data' }, { status: 400, headers: corsHeaders });
    }

    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const device = devices[deviceId];
    
    // Vercel-এ public ফোল্ডার রিড করার জন্য process.cwd() ব্যবহার
    const framePath = path.join(process.cwd(), 'public', 'frames', device.file);

    // রাউন্ডেড কর্নারের জন্য একটি SVG মাস্ক তৈরি করা
    const roundedCorners = Buffer.from(
      `<svg><rect x="0" y="0" width="${device.width}" height="${device.height}" rx="${device.radius}" ry="${device.radius}" fill="white"/></svg>`
    );

    const resizedUserImage = await sharp(buffer)
      .resize(device.width, device.height, { fit: 'cover' })
      .composite([{ input: roundedCorners, blend: 'dest-in' }])
      .toBuffer();

    const resizedFrameImage = await sharp(framePath)
      .resize(device.frameW, device.frameH, { fit: 'fill' })
      .toBuffer();

    const finalImageBuffer = await sharp({
      create: {
        width: device.frameW,
        height: device.frameH,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .composite([
      { input: resizedUserImage, top: device.top, left: device.left },
      { input: resizedFrameImage, top: 0, left: 0 }
    ])
    .png()
    .toBuffer();

    const base64Image = `data:image/png;base64,${finalImageBuffer.toString('base64')}`;

    // সফল রেসপন্সেও CORS হেডার
    return NextResponse.json({ success: true, image: base64Image }, { headers: corsHeaders });

  } catch (error) {
    console.error("Sharp Error:", error);
    return NextResponse.json({ success: false, error: 'Image processing failed. Check Vercel Logs.' }, { status: 500, headers: corsHeaders });
  }
}
