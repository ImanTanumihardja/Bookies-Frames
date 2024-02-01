import { FrameRequest, getFrameAccountAddress, getFrameMessage } from '@coinbase/onchainkit';
import { NextRequest, NextResponse } from 'next/server';
import {kv} from "@vercel/kv";

async function getResponse(req: NextRequest): Promise<NextResponse> {
  let accountAddress: string | undefined = '';
  let buttonIndex: number = 0;
  const body: FrameRequest = await req.json();
  const { isValid, message } = await getFrameMessage(body);

  if (isValid) {
    try {
      accountAddress = await getFrameAccountAddress(message, { NEYNAR_API_KEY: 'NEYNAR_API_DOCS' });
    } catch (err) {
      console.error(err);
    }
  

    buttonIndex = message?.buttonIndex || 0;
    const fid = message?.fid || 0;

    // Check if voted before
    const voteExists = await kv.sismember(`voted`, fid)
    if (!voteExists) {
      let multi = kv.multi();
      if (buttonIndex === 1) {
        // Increment value for 49ers in kv database
        multi.incr('49ers');
      }
      else if (buttonIndex === 2) {
        // Increment value for Chiefs in kv database
        multi.incr('Chiefs');
      }
      multi.sadd(`voted`, fid);
      await multi.exec();
    }
  } 

  const imageUrl = `https://bookies-frames.vercel.app/api/frame/image?`;
  // <meta property="fc:frame:image" content="https://bookies-frames.vercel.app/${buttonIndex === 1 ? "49ers.gif" : "chiefs.gif"}" />

  return new NextResponse(`<!DOCTYPE html><html><head>
    <meta property="fc:frame" content="vNext" />
    <meta name="fc:frame:image" content="${imageUrl}">
  </head></html>`);
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = 'force-dynamic';
