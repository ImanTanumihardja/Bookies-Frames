import { NextRequest, NextResponse } from 'next/server';
import { kv } from "@vercel/kv";
import { User} from '@types';
import { generateUrl, getFrameMessage, notFollowingResponse, getRequestProps } from '@utils';
import { ALEA_FID, DatabaseKeys, DEFAULT_USER, RequestProps, FrameNames, Accounts} from '@utils/constants';
import { getFrameHtml, Frame, FrameButtonsType} from "frames.js";

const CLAIM_AMOUNT = 50;

export async function POST(req: NextRequest): Promise<Response> {
  // Verify the frame request
  const message = await getFrameMessage(req, true, ALEA_FID);

  const {followingHost: isFollowing, fid, button, liked} = message;
  console.log('FID: ', fid.toString())

  var validCaptcha = true;
  const {captchaIndex} = getRequestProps(req, [RequestProps.CAPTCHA_INDEX]);

  if (captchaIndex === -1) { // Show thumbnail
    return await GET(req); 
  }

  if ((!isFollowing || !liked) && fid !== 313859) {
    // Call fetch to get not following
    return notFollowingResponse(generateUrl(`/api/alea/${FrameNames.CAPTCHA}`, {}, false))
  }

  if (captchaIndex !== (button - 1)) {
    validCaptcha = false;
  }
  var user : User | null = null;
  var isNewUser: boolean = false;
  var hasClaimed: boolean = true;
  var buttons = [
    {
      label: "Try Again", 
      action: 'post', 
      target: generateUrl(`/api/alea/${FrameNames.CAPTCHA}`, {}, false),
    }
  ];

  if (validCaptcha) {
    isNewUser = await kv.zscore(DatabaseKeys.LEADERBOARD, fid.toString()) === null;

    if (isNewUser) {
        // New user
        user = structuredClone(DEFAULT_USER);
        user.hasClaimed = false;

        // Save to leaderboard
        if (user !== null) await kv.zadd(DatabaseKeys.LEADERBOARD, {score: DEFAULT_USER.balance, member: fid}).catch(async (error) => {
          console.error('Error adding user to leaderboard:', error);
          // Try again
          if (user !== null) await kv.zadd(DatabaseKeys.LEADERBOARD, {score: DEFAULT_USER.balance, member: fid}).catch(() => {
            throw new Error('Error adding user to leaderboard');
          })
        });

        console.log('NEW USER: ', user)
    }
    else 
    {
      user = await kv.hgetall(fid.toString()) || null;
      console.log('USER: ', user)
    }

    if (user === null) throw new Error('User is null');

    // Get all alea events and filter out this eventName
    let activeEvents = (await kv.sscan(`${Accounts.ALEA}:${DatabaseKeys.EVENTS}`, 0, {count: 150}))[1] as string[];
 
    hasClaimed = user.hasClaimed;
    if (!hasClaimed) {
      // Claim dice
      user.balance = parseFloat(user.balance.toString()) + CLAIM_AMOUNT;
      console.log(`CLAIMED ${CLAIM_AMOUNT} DICE`)

      user.hasClaimed = true;
      await kv.hset(fid.toString(), user).then( async () => {
       if (user !== null) await kv.zincrby(DatabaseKeys.LEADERBOARD, CLAIM_AMOUNT, fid).catch(async (error) => {
          console.error('Error adding user to leaderboard:', error);
          // Try again
          if (user !== null) await kv.zincrby(DatabaseKeys.LEADERBOARD, CLAIM_AMOUNT, fid)
        });
      }).catch(() => {
        return new Response(JSON.stringify({ message: `Error updating user` }), { status: 400, headers: { 'content-type': 'application/json' } });
      });
    } else {
      console.log('ALREADY CLAIMED')
    }

    buttons = [
      { 
        label: "/bookies!", 
        action: 'link', 
        target: 'https://warpcast.com/~/channel/bookies'
      }, 
      { 
        label: "Profile Finder", 
        action: 'post', 
        target: generateUrl(`/api/alea/${FrameNames.PROFILE_FINDER}`, {[RequestProps.FID]: -1}, false)},
      {
        label: 'Leaderboard', 
        action:'post', 
        target: generateUrl(`/api/alea/${FrameNames.LEADERBOARD}`, {[RequestProps.OFFSET]: -1, [RequestProps.REDIRECT]: false}, false)
      },
    ]

    if (activeEvents.length > 0) {
      buttons.push({
        label: 'Place Bet', 
        action:'post', 
        target: generateUrl(`/api/alea/${activeEvents[Math.floor(Math.random() * activeEvents.length)]}`, {}, false)
      })
    }
  }

  const imageUrl = generateUrl(`api/alea/${FrameNames.CLAIM_DICE}/image`, {[RequestProps.HAS_CLAIMED]: hasClaimed, [RequestProps.BALANCE]: CLAIM_AMOUNT, [RequestProps.VALID_CAPTCHA]: validCaptcha}, true);

  const frame: Frame = {
    version: "vNext",
    image: imageUrl,
    buttons: buttons as FrameButtonsType,
    postUrl: generateUrl(`api/alea/${FrameNames.CLAIM_DICE}`, {}, false),
  };

  return new NextResponse(
    getFrameHtml(frame),
  );
}

export async function GET(_: NextRequest): Promise<Response> {
  const imageUrl = generateUrl(`thumbnails/${FrameNames.CLAIM_DICE}.gif`, {}, true)

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
