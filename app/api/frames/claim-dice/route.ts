import { NextRequest, NextResponse } from 'next/server';
import { kv } from "@vercel/kv";
import { User} from '../../../types';
import { RequestProps, generateUrl, DEFAULT_USER, validateFrameMessage } from '../../../../src/utils';
import { getFrameHtml, Frame} from "frames.js";
import { FrameNames } from '../../../../src/utils';

async function getResponse(req: NextRequest): Promise<NextResponse> {
  
  // Verify the frame request
  const message = await validateFrameMessage(req);

  const {followingBookies: isFollowing, fid, button} = message;

  if (parseInt(req.nextUrl.searchParams.get('captcha') || "") != (button - 1)) throw new Error('Invalid captcha');

  let user : User = await kv.hgetall(fid.toString()) || DEFAULT_USER;
  const isNewUser: boolean = await kv.zscore('users', fid) === null;

  if (isFollowing) {
    if (!user.hasClaimed) {
      const multi = kv.multi();
      if (isNewUser) {
        // New user
        user.points = 100;
        await multi.zadd('users', {score: 100, member: fid});
        await multi.hset(fid.toString(), user);
      }
      else {
        // Get daily 10 dice for old user
        await multi.hincrby(fid.toString(), 'points', 10);
        await multi.zincrby('users', 10, fid);
      }

      await multi.hset(fid.toString(), {'hasClaimed': true});
      await multi.exec();
    }
  }

  const imageUrl = generateUrl(`api/frames/${FrameNames.CLAIM_DICE}/image`, {[RequestProps.IS_FOLLOWING]: isFollowing, [RequestProps.HAS_CLAIMED]: user.hasClaimed, [RequestProps.POINTS]: isNewUser ? 100 : 10}, false, true);

  const frame: Frame = {
    version: "vNext",
    image: imageUrl,
    buttons: isFollowing ? [{ label: "Check out /bookies!", action: 'link', target: 'https://warpcast.com/~/channel/bookies'}] : [{ label: "Follow Us!", action: 'link', target: 'https://warpcast.com/bookies'}],
    postUrl: `${process.env['HOST']}/api/frames/${FrameNames.CLAIM_DICE}`,
  };

  return new NextResponse(
    getFrameHtml(frame),
  );
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
} 


export const dynamic = 'force-dynamic';
