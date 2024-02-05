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
    const accountAddress: string = message?.interactor.verified_accounts[0] || "";
    const hasMinted = await kv.sismember('users', accountAddress);

    if (!hasMinted) {
      let user : User = await kv.hgetall(accountAddress) || {fid: fid, points: 0, streak: 0};
      user.fid = fid;
      user.points += 100;

      const multi = kv.multi();
      await multi.sadd('users', accountAddress);
      await multi.hset(accountAddress, user);
    }

    const imageUrl = `${process.env['HOST']}/api/frames/${eventName}/image?hasMinted=${hasMinted}`;

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
