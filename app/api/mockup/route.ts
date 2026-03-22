import { NextResponse } from 'next/server';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

// শুধু ফাইলের নাম এবং কর্নারের রাউন্ডনেস (০.১ মানে ১০%, ০.০১ মানে ১%)
// কোনো হার্ডকোডেড উইডথ/হাইট বা টপ/লেফট মাপের দরকার নেই!
const devices: Record<string, { file: string; radiusRatio: number }> = {
  iphone15: { file: 'iphone15-frame.png', radiusRatio: 0.1 },
  macbook: { file: 'macbook-frame.png', radiusRatio: 0.01 },
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

// ডাইনামিক ক্যালকুলেশন বারবার না হওয়ার জন্য ক্যাশে সেভ রাখা হচ্ছে
const boundingBoxCache: Record<string, { top: number, left: number, width: number, height: number, frameW: number, frameH: number }> = {};

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const image = formData.get('image') as File | null;
    const deviceId = formData.get('deviceId') as string | null;

    if (!image || !deviceId || !devices[deviceId]) {
      return NextResponse.json({ success: false, error: 'Invalid input data' }, { status: 400, headers: corsHeaders });
    }

    const device = devices[deviceId];
    const framePath = path.join(process.cwd(), 'public', 'frames', device.file);

    // এই ফাংশনটি স্বয়ংক্রিয়ভাবে ফ্রেমের ভেতরের স্বচ্ছ অংশের (Screen hole) মাপ বের করে নেয়
    if (!boundingBoxCache[deviceId]) {
      const frameBuffer = await fs.promises.readFile(framePath);
      const { data, info } = await sharp(frameBuffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      
      const cx = Math.floor(info.width / 2);
      const cy = Math.floor(info.height / 2);
      const getAlpha = (x: number, y: number) => data[(y * info.width + x) * 4 + 3];

      let top = cy; while(top > 0 && getAlpha(cx, top) < 250) top--;
      let bottom = cy; while(bottom < info.height - 1 && getAlpha(cx, bottom) < 250) bottom++;
      let left = cx; while(left > 0 && getAlpha(left, cy) < 250) left--;
      let right = cx; while(right < info.width - 1 && getAlpha(right, cy) < 250) right++;

      boundingBoxCache[deviceId] = {
          top: top + 1,
          left: left + 1,
          width: right - left - 1,
          height: bottom - top - 1,
          frameW: info.width,
          frameH: info.height
      };
    }

    const bbox = boundingBoxCache[deviceId];
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // কর্নারের গোল ভাব নির্ণয়
    const radius = Math.floor(bbox.width * (device.radiusRatio || 0));

    // ডাইনামিকালি পাওয়া মাপে ছবি রিসাইজ করা
    let resizedUserImage = sharp(buffer).resize(bbox.width, bbox.height, { fit: 'cover' });
    
    if (radius > 0) {
        const roundedCorners = Buffer.from(
          `<svg><rect x="0" y="0" width="${bbox.width}" height="${bbox.height}" rx="${radius}" ry="${radius}" fill="white"/></svg>`
        );
        resizedUserImage = resizedUserImage.composite([{ input: roundedCorners, blend: 'dest-in' }]);
    }
    
    const userImageBuffer = await resizedUserImage.toBuffer();

    const finalImageBuffer = await sharp({
      create: {
        width: bbox.frameW,
        height: bbox.frameH,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .composite([
      { input: userImageBuffer, top: bbox.top, left: bbox.left },
      { input: framePath, top: 0, left: 0 }
    ])
    .png()
    .toBuffer();

    const base64Image = `data:image/png;base64,${finalImageBuffer.toString('base64')}`;

    return NextResponse.json({ success: true, image: base64Image }, { headers: corsHeaders });

  } catch (error) {
    console.error("Sharp Error:", error);
    return NextResponse.json({ success: false, error: 'Image processing failed. Check Vercel Logs.' }, { status: 500, headers: corsHeaders });
  }
}
