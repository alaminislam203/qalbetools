import { NextResponse } from 'next/server';
import sharp from 'sharp';
import path from 'path';

// ডিভাইসের ডাটাবেস (কোঅর্ডিনেট এবং সাইজ)
const devices: Record<string, { file: string; width: number; height: number; top: number; left: number; frameW: number; frameH: number }> = {
  iphone15: { file: 'iphone15-frame.png', width: 1290, height: 2796, top: 60, left: 65, frameW: 1420, frameH: 2916 },
  macbook: { file: 'macbook-frame.png', width: 2560, height: 1600, top: 120, left: 180, frameW: 2920, frameH: 2000 },
};

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const image = formData.get('image') as File | null;
    const deviceId = formData.get('deviceId') as string | null;

    if (!image || !deviceId || !devices[deviceId]) {
      return NextResponse.json({ success: false, error: 'Invalid input data' }, { status: 400 });
    }

    // ইউজারের আপলোড করা ইমেজ বাফারে কনভার্ট
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const device = devices[deviceId];
    const framePath = path.join(process.cwd(), 'public', 'frames', device.file);

    // ১. ইউজারের ইমেজটিকে ডিভাইসের স্ক্রিন সাইজ অনুযায়ী রিসাইজ করা
    const resizedUserImage = await sharp(buffer)
      .resize(device.width, device.height, { fit: 'cover' })
      .toBuffer();

    // ২. একটি ট্রান্সপারেন্ট ক্যানভাস তৈরি করে সেখানে ইউজারের ছবি এবং তার ওপর ফ্রেম বসানো
    const finalImageBuffer = await sharp({
      create: {
        width: device.frameW,
        height: device.frameH,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .composite([
      { input: resizedUserImage, top: device.top, left: device.left }, // নিচে ইউজারের ছবি
      { input: framePath, top: 0, left: 0 } // ওপরে ডিভাইসের ট্রান্সপারেন্ট ফ্রেম
    ])
    .png()
    .toBuffer();

    // Base64 হিসেবে রিটার্ন
    const base64Image = `data:image/png;base64,${finalImageBuffer.toString('base64')}`;

    return NextResponse.json({ success: true, image: base64Image });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Image processing failed' }, { status: 500 });
  }
}
