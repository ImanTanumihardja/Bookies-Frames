import { NextRequest, NextResponse } from 'next/server';
import { kv } from "@vercel/kv";
import { User} from '../../../types';
import { RequestProps, generateUrl, DEFAULT_USER, validateFrameMessage } from '../../../../src/utils';
import { getFrameHtml, Frame} from "frames.js";
import { FrameNames } from '../../../../src/utils';

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Verify the frame request
  // const message = await validateFrameMessage(req);

  const message = {
    followingBookies: true,
    fid: 3131859,
    button: 1
  }

  const {followingBookies: isFollowing, fid, button} = message;
  console.log('FID: ', fid.toString())

  let validCaptcha = true;
  // if (parseInt(req.nextUrl.searchParams.get('captcha') || "-1") != (button - 1)) {
  //   validCaptcha = false;
  // }

  var user : User = DEFAULT_USER;
  var isNewUser: boolean = false;
  var hasClaimed: boolean = false;

  if (isFollowing && validCaptcha) {
    isNewUser = await kv.zscore('users', fid) === null;

    const multi = kv.multi();
    if (isNewUser) {
        // New user
        user.balance = 100;
        user.availableBalance = 100;
        console.log('NEW USER: ', user)
      }
    else {
        user = await kv.hgetall(fid.toString()) || DEFAULT_USER;
        console.log('USER: ', user)
        
        hasClaimed = user.hasClaimed;
        if (!hasClaimed) {
          // Get daily 10 dice for old user
          user.balance = parseInt(user.balance.toString()) + 10;
          user.availableBalance = user.balance;
        }
      }

    user.hasClaimed = true;
    await multi.hset(fid.toString(), user);
    await multi.zadd('users', {score: user.balance, member: fid});
    await multi.exec();
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


export const revalidate = 0;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
