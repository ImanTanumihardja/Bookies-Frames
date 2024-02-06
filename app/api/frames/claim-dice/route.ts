import { FrameRequest, getFrameMessage, getFrameHtmlResponse } from '@coinbase/onchainkit';
import { NextRequest, NextResponse } from 'next/server';
import { kv } from "@vercel/kv";
import { User} from '../../../types';

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Verify the frame request
  const body: FrameRequest = await req.json();
  const eventName: string = req.nextUrl.searchParams.get("eventName") || "";
  const { isValid, message } = await getFrameMessage(body, { neynarApiKey: 'NEYNAR_ONCHAIN_KIT' });

  if (isValid) {
    const fid: number = message?.interactor.fid || 0;
    const accountAddress: string = message?.interactor.custody_address || "";
    const hasMinted: boolean = null !== (await kv.zscore('users', accountAddress));

    if (!hasMinted) {
      let user : User = {fid: fid, points: 100, streak: 0};

      const multi = kv.multi();
      await multi.zadd('users', {score: 100, member: accountAddress});
      await multi.hset(accountAddress, user);
      await multi.exec();
    }

    const imageUrl = `${process.env['HOST']}/api/frames/${eventName}/image?hasMinted=${hasMinted}&timestamp=${new Date().getTime()}`;

    return new NextResponse(
      getFrameHtmlResponse({
        image: `${imageUrl}`,
      }),
    );
  } 
  else {
    return new NextResponse(
      getFrameHtmlResponse({
        image: `${process.env['HOST']}/superbowl.png`,
      }),
    );
  }
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
} 


export const dynamic = 'force-dynamic';
