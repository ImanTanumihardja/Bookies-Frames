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

  var validCaptcha = true;
  if (parseInt(req.nextUrl.searchParams.get('captcha') || "-1") != (button - 1)) {
    validCaptcha = false;
  }

  var user : User = DEFAULT_USER;
  var isNewUser: boolean = false;
  var hasClaimed: boolean = false;

  if (isFollowing && validCaptcha) {
    user = await kv.hgetall(fid.toString()) || DEFAULT_USER;
    console.log(fid)
    hasClaimed = user.hasClaimed;
    console.log(user)
    if (!hasClaimed) {
      isNewUser = await kv.zscore('users', fid) === null;
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
      user.hasClaimed = true;
      await multi.hset(fid.toString(), {'hasClaimed': true});
      await multi.exec();
    }
  }

  const imageUrl = generateUrl(`api/frames/${FrameNames.CLAIM_DICE}/image`, {[RequestProps.IS_FOLLOWING]: isFollowing, [RequestProps.HAS_CLAIMED]: hasClaimed, [RequestProps.POINTS]: isNewUser ? 100 : 10, [RequestProps.VALID_CAPTCHA]: validCaptcha}, true, true);

  const frame: Frame = {
    version: "vNext",
    image: imageUrl,
    buttons: !validCaptcha ? [] : isFollowing ? [{ label: "Check out /bookies!", action: 'link', target: 'https://warpcast.com/~/channel/bookies'}] : [{ label: "Follow Us!", action: 'link', target: 'https://warpcast.com/bookies'}],
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
export const revalidate = 0;
