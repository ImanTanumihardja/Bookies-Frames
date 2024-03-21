import { NextRequest, NextResponse } from 'next/server';
import { kv } from "@vercel/kv";
import { User} from '../../../types';
import { RequestProps, generateUrl, DEFAULT_USER, getFrameMessage, DatabaseKeys, notFollowingResponse, getRequestProps, ALEA_FID } from '../../../../src/utils';
import { getFrameHtml, Frame} from "frames.js";
import { FrameNames } from '../../../../src/utils';

export async function POST(req: NextRequest): Promise<Response> {
  // Verify the frame request
  const message = await getFrameMessage(req, true, ALEA_FID);

  const {followingBookies: isFollowing, fid, button} = message;
  console.log('FID: ', fid.toString())

  var validCaptcha = true;
  const {captchaIndex} = getRequestProps(req, [RequestProps.CAPTCHA_INDEX]);

  if (captchaIndex === -1) { // Show thumbnail
    return await GET(req); 
  }

  if (!isFollowing) {
    // Call fetch to get not following
    return notFollowingResponse(generateUrl(`/api/alea/${FrameNames.CLAIM_DICE}`, {[RequestProps.CAPTCHA_INDEX]: -1}, false))
  }

  if (captchaIndex !== (button - 1)) {
    validCaptcha = false;
  }
  var user : User | null = null;
  var isNewUser: boolean = false;
  var hasClaimed: boolean = true;

  if (validCaptcha) {
    user = await kv.hgetall(fid.toString()) || null;
    
    isNewUser = !user || user.hasClaimed === undefined || user.balance === undefined || await kv.zscore(DatabaseKeys.LEADERBOARD, fid.toString()) === null;

    if (isNewUser) {
        // New user
        hasClaimed = false;
        user = structuredClone(DEFAULT_USER);
        console.log('NEW USER: ', user)
        console.log('CLAIMED 100 DICE')
    }
    else if (user !== null && user.hasClaimed !== undefined) {
      console.log('USER: ', user)
      
      hasClaimed = user.hasClaimed;
      if (!hasClaimed) {
        // Get daily 10 dice for old user
        user.balance = parseFloat(user.balance.toString()) + 10;
        console.log('CLAIMED 10 DICE')
      } else {
        console.log('ALREADY CLAIMED')
      }
    }

    if (user === null) throw new Error('User is null');
    
    if (!hasClaimed) {
      user.hasClaimed = true;
      await kv.hset(fid.toString(), user).then( async () => {
       if (user !== null) await kv.zadd(DatabaseKeys.LEADERBOARD, {score: user.balance, member: fid}).catch(async (error) => {
          console.error('Error adding user to leaderboard:', error);
          // Try again
          if (user !== null) await kv.zadd(DatabaseKeys.LEADERBOARD, {score: user.balance, member: fid})
        });
      }).catch((error) => {
        throw new Error('Error updating user');
      });
    }
  }

  const imageUrl = generateUrl(`api/alea/${FrameNames.CLAIM_DICE}/image`, {[RequestProps.HAS_CLAIMED]: hasClaimed, [RequestProps.BALANCE]: isNewUser ? 100 : 10, [RequestProps.VALID_CAPTCHA]: validCaptcha}, true);

  const frame: Frame = {
    version: "vNext",
    image: imageUrl,
    buttons: !validCaptcha ? [] : [{ label: "Check out /bookies!", action: 'link', target: 'https://warpcast.com/~/channel/bookies'}],
    postUrl: generateUrl(`api/alea/${FrameNames.CLAIM_DICE}`, {}, false),
  };

  return new NextResponse(
    getFrameHtml(frame),
  );
}

export async function GET(req: NextRequest): Promise<Response> {
  const imageUrl = generateUrl(`thumbnails/${FrameNames.CLAIM_DICE}.gif`, {}, false)

  const frame : Frame = {
    version: "vNext",
    buttons: [
      {
        label: 'Claim Dice',
        action: 'post'
      },
    ],
    image: imageUrl,
    postUrl: generateUrl(`api/alea/${FrameNames.CAPTCHA}`, {}, false),
  };

  return new NextResponse(
    getFrameHtml(frame),
    {
      headers: {
        'content-type': 'text/html',
      },
    },
  );
}


export const revalidate = 60;
// export const dynamic = 'force-dynamic';
// export const fetchCache = 'force-no-store';
