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
    const hasMinted = null !== (await kv.zscore('users', accountAddress));

    if (!hasMinted) {
      let user : User = {fid: fid, points: 10, streak: 0};
      user.fid = fid;
      user.points += 100 as number;

      const multi = kv.multi();
      await multi.zadd('users', {score: user.points, member: accountAddress});
      await multi.hset(accountAddress, user);
      await multi.exec();
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
