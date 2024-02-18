import { NextRequest, NextResponse } from 'next/server';
import { FrameNames, validateFrameMessage } from '../../../../src/utils';
import { getFrameHtml} from "frames.js";


async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Verify the frame request
  const message = await validateFrameMessage(req);
    
  const images = ['🎩', '🏆', '🤑', '🏇'] 

  // Generate random number between 0 and 3
  const randomIndex = Math.floor(Math.random() * 4);

  const imageUrl = `${process.env['HOST']}/api/frames/captcha/image/?timestamp=${new Date().getTime()}&image=${images[randomIndex]}`;

  return new NextResponse(
    getFrameHtml({
      version: "vNext",
      image: imageUrl,
      buttons: [{label:'🎩', action:'post'}, {label:'🏆', action:'post'}, {label:'🤑', action:'post'}, {label:'🏇', action:'post'}],
      postUrl: `${process.env['HOST']}/api/frames/${FrameNames.CLAIM_DICE}?captcha=${randomIndex}`,
    }),
  );
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
} 

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
