import { FrameRequest, getFrameMessage, getFrameHtmlResponse } from '@coinbase/onchainkit';
import { NextRequest, NextResponse } from 'next/server';
import { kv } from "@vercel/kv";
import { User} from '../../../types';
import { FrameButtonMetadata } from '@coinbase/onchainkit/dist/types/core/types';

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Verify the frame request
  const body: FrameRequest = await req.json();
  const frameName: string = req.nextUrl.pathname.split('/').pop() || "";
  const { isValid, message } = await getFrameMessage(body, { neynarApiKey: 'NEYNAR_ONCHAIN_KIT' });

  if (isValid) {
    const fid: number = message?.interactor.fid || 0;
    const accountAddress: string = message?.interactor.custody_address || "";
    const hasClaimed: boolean = null !== (await kv.zscore('users', accountAddress));
    const isFollowing: boolean = message.following;

    if (isFollowing) {
      if (!hasClaimed) {
        let user : User = {fid: fid, points: 100, streak: 0, latestBet: {eventName: "", prediction: -1, wagerAmount: 0, timeStamp: 0}};

        const multi = kv.multi();
        await multi.zadd('users', {score: 100, member: accountAddress});
        await multi.hset(accountAddress, user);
        await multi.exec();
      }
    }

    const imageUrl = `${process.env['HOST']}/api/frames/${frameName}/image?hasClaimed=${hasClaimed}&isFollowing=${isFollowing}&timestamp=${new Date().getTime()}`;

    return new NextResponse(
      getFrameHtmlResponse({
        buttons: isFollowing ? [{ label: "View Profile" }] : [{ label: "Follow" }],
        image: `${imageUrl}`,
        post_url: isFollowing ? `${process.env['HOST']}/api/frames/${frameName}` : 'https://warpcast.com/bookies'
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
