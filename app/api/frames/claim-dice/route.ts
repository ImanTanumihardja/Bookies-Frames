import { FrameRequest, getFrameMessage, getFrameHtmlResponse } from '@coinbase/onchainkit';
import { NextRequest, NextResponse } from 'next/server';
import { kv } from "@vercel/kv";
import { User} from '../../../types';
import { RequestProps, generateImageUrl } from '../../../../src/utils';

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Verify the frame request
  const body: FrameRequest = await req.json();
  const { isValid, message } = await getFrameMessage(body, { neynarApiKey: 'NEYNAR_ONCHAIN_KIT' });

  if (!isValid) throw new Error('Invalid frame message');

  const frameName: string = req.nextUrl.pathname.split('/').pop() || "";
  const accountAddress: string = message?.interactor.custody_address || "";
  let user : User = await kv.hgetall(accountAddress) || {} as User

  const timestamp = new Date().getTime();
  const hasClaimed = timestamp > user.lastClaimed;
  const isNewUser: boolean = null === (await kv.zscore('users', accountAddress));
  const isFollowing: boolean = !message?.following;

  if (isFollowing) {
    if (!hasClaimed) {
      user.lastClaimed = timestamp;

      const multi = kv.multi();
      if (isNewUser) {
        // New user
        user.points = 100;
        await multi.zadd('users', {score: 100, member: accountAddress});
      }
      else {
        // Get daily 10 dice for old user
        await multi.hincrby(accountAddress, 'points', 10);
        await multi.zadd('users', {score: user.points + 10, member: accountAddress});
      }
      await multi.hset(accountAddress, user);
      await multi.exec();
    }
  }

  const imageUrl = generateImageUrl(frameName, {[RequestProps.IS_FOLLOWING]: isFollowing, [RequestProps.HAS_CLAIMED]: hasClaimed, [RequestProps.AMOUNT]: isNewUser ? 100 : 10});

  console.log('imageUrl', imageUrl);

  return new NextResponse(
    getFrameHtmlResponse({
      buttons: isFollowing ? [{ label: "View Profile" }] : [{ label: "Follow", action: 'link', target: 'https://warpcast.com/bookies'}],
      image: `${imageUrl}`,
      post_url: `${process.env['HOST']}/api/frames/profile`
    }),
  );
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
} 


export const dynamic = 'force-dynamic';
