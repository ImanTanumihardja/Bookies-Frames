import { NextRequest, NextResponse } from 'next/server';
import { kv } from "@vercel/kv";
import { User, DEFAULT_USER} from '../../../types';
import { RequestProps, generateImageUrl } from '../../../../src/utils';
import { getFrameMessage, getFrameHtml, Frame} from "frames.js";

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Verify the frame request
  const body = await req.json();
  const { isValid, requesterFollowsCaster: isFollowing, requesterFid: fid}  = await getFrameMessage(body, { fetchHubContext: true });

  if (isValid) throw new Error('Invalid frame message');

  const frameName: string = req.nextUrl.pathname.split('/').pop() || "";
  let user : User = await kv.hgetall(fid.toString()) || DEFAULT_USER
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

  const imageUrl = generateImageUrl(frameName, {[RequestProps.IS_FOLLOWING]: isFollowing, [RequestProps.HAS_CLAIMED]: user.hasClaimed, [RequestProps.AMOUNT]: isNewUser ? 100 : 10});

  const frame: Frame = {
    version: "vNext",
    image: imageUrl,
    buttons: isFollowing ? [{ label: "Check out /bookies!", action: 'link', target: 'https://warpcast.com/~/channel/bookies'}, { label: "Refresh", action: 'post'}] : [{ label: "Follow Us!", action: 'link', target: 'https://warpcast.com/bookies'}, { label: "Refresh", action: 'post'}],
    postUrl: `${process.env['HOST']}/api/frames/${frameName}`,
  };

  return new NextResponse(
    getFrameHtml(frame),
  );
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
} 


export const dynamic = 'force-dynamic';
