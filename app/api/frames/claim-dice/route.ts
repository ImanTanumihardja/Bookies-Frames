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
  const hasClaimed: boolean = null !== (await kv.zscore('users', accountAddress));
  const isFollowing: boolean = message.following;

  if (isFollowing) {
    if (!hasClaimed) {
      let user : User = {} as User;

      const multi = kv.multi();
      await multi.zadd('users', {score: 100, member: accountAddress});
      await multi.hset(accountAddress, user);
      await multi.exec();
    }
  }

  const imageUrl = `${process.env['HOST']}/dice.gif` // generateImageUrl(frameName, {[RequestProps.IS_FOLLOWING]: isFollowing, [RequestProps.HAS_CLAIMED]: hasClaimed});

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
