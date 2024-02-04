import { FrameRequest, getFrameMessage, getFrameHtmlResponse } from '@coinbase/onchainkit';
import { NextRequest, NextResponse } from 'next/server';
import { kv } from "@vercel/kv";

async function getResponse(req: NextRequest): Promise<NextResponse> {
  let accountAddress: string | undefined = '';
  let buttonIndex: number = 0;

  const body: FrameRequest = await req.json();
  const { isValid, message } = await getFrameMessage(body);

  if (isValid) {

    buttonIndex = message?.buttonIndex || 0;
    const fid = message?.fid || 0;

    // Check if voted before
    const voteExists = await kv.sismember(`voted`, fid)
    if (!voteExists) {
      let multi = kv.multi();
      if (buttonIndex === 2) {
        // Increment value for 49ers in kv database
        multi.incr('49ers');
      }
      else if (buttonIndex === 1) {
        // Increment value for Chiefs in kv database
        multi.incr('Chiefs');
      }
      multi.sadd(`voted`, fid);
      await multi.exec();
    }
  } 

  const imageUrl = `${process.env['HOST']}/api/image?buttonIndex=${buttonIndex}`;

  return new NextResponse(
    getFrameHtmlResponse({
      image: `${imageUrl}`,
      post_url: `${process.env['HOST']}/api/vote`,
    }),
  );
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
} 


export const dynamic = 'force-dynamic';
