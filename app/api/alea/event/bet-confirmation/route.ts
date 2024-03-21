import { getFrameHtml} from "frames.js";
import { NextRequest, NextResponse } from 'next/server';
import { kv } from "@vercel/kv";
import { Event, User, Bet } from '../../../../types';
import { DEFAULT_USER, DatabaseKeys, FrameNames, RequestProps, generateUrl, getRequestProps, getFrameMessage, notFollowingResponse, ALEA_FID } from '../../../../../src/utils';

export async function POST(req: NextRequest): Promise<Response> {
  // Verify the frame request
  const message = await getFrameMessage(req, true, ALEA_FID);

  const {followingHost: isFollowing, button, fid} = message;

  // Get eventName from req
  let {eventName, stake, pick} = getRequestProps(req, [RequestProps.EVENT_NAME, RequestProps.STAKE, RequestProps.PICK]);

  if (!isFollowing) {
    // Call fetch to get not following thumbnail
    return notFollowingResponse(generateUrl(`/api/alea/${FrameNames.EVENT}/${eventName}`, {}, false))
  }

  // Wait for both user to be found and event to be found
  let user : User | null = null;
  let event : Event | null = null;
  let isNewUser: boolean = false;

  await Promise.all([kv.hgetall(fid.toString()), kv.hgetall(eventName)]).then( (res) => {
    user = res[0] as User || null;
    event = res[1] as Event || null;
  });

  event = event as unknown as Event || null;
  user = user as unknown as User || null;

  console.log('FID: ', fid.toString())

  // Check if new user if so add new user
  isNewUser = !user || (user as User).hasClaimed === undefined || (user as User).balance === undefined || (await kv.zscore(DatabaseKeys.LEADERBOARD, fid.toString())) === null;

  if (isNewUser) {
      // New user
      user = structuredClone(DEFAULT_USER)

      console.log('NEW USER: ', user)
  }
  else {
    console.log('USER: ', user)
  }

  if (user === null) throw new Error('User is null');

  const balance = parseFloat(user?.balance.toString());

  if (event === null) throw new Error('Event not found');

  if (stake <= 0 || stake > balance) {
    stake = -1
  }

  const now = new Date().getTime();

  // Need to check bet does not exists, time is not past, and stake >= 1 and not rejected
  if (now < event?.startDate && stake > 0 && parseInt(event?.result.toString()) === -1 && button != 2) {
    // Can bet
    const bet : Bet = {pick:pick, odd: 1/event.options.length, stake:stake, timeStamp: now, settled: false} as Bet;

    // Adjust user available balance
    user.balance = Math.round(balance - stake);

    if (user.bets[eventName] === undefined) user.bets[eventName] = [];
    user.bets[eventName].push(bet)

    // Set user
    await kv.hset(fid.toString(), user).then( async () => {
      // Set event
      await kv.sadd(`${eventName}:${DatabaseKeys.BETS}`, fid).catch(async (error) => {
        console.error('Error adding user to event:', error);
        // Try again
        await kv.sadd(`${eventName}:${DatabaseKeys.BETS}`, fid).catch((error) => {
          throw new Error('Error creating bet');
        })
      })

      // Update poll
      await kv.hincrby(`${eventName}:${DatabaseKeys.POLL}`, `${pick}`, 1).catch(async (error) => {
        console.error('Error adding user to event:', error);
        // Try again
        await kv.hincrby(`${eventName}:${DatabaseKeys.POLL}`, `${pick}`, 1).catch((error) => {
          throw new Error('Error creating bet');
        })
      })

      // If new user add to leaderboard
      if (isNewUser) {
        if (user !== null) await kv.zadd(DatabaseKeys.LEADERBOARD, {score: DEFAULT_USER.balance, member: fid}).catch(async (error) => {
          console.error('Error adding user to leaderboard:', error);
          // Try again
          if (user !== null) await kv.zadd(DatabaseKeys.LEADERBOARD, {score: DEFAULT_USER.balance, member: fid}).catch((error) => {
            throw new Error('Error adding user to leaderboard');
          })
        });
      }
    }).catch((error) => {
      throw new Error('Error creating bet');
    });   

    console.log('NEW BET: ', bet)
  } 
  else {
    pick = -1
    console.log('FAILED TO PLACE BET')
  }

  const imageUrl = generateUrl(`api/alea/${FrameNames.EVENT}/${FrameNames.BET_CONFIRMATION}/image`, {[RequestProps.STAKE]: stake, [RequestProps.PICK]: pick, [RequestProps.BUTTON_INDEX]: button, [RequestProps.FID]: fid, [RequestProps.EVENT_NAME]: eventName, [RequestProps.OPTIONS]: event.options, [RequestProps.TIME]: now, [RequestProps.RESULT]: event.result}, true);

  return new NextResponse(
    getFrameHtml({
      version: "vNext",
      image: `${imageUrl}`,
      buttons: 
      [
        { 
          label: "Check out /bookies!", 
          action: 'link', 
          target: 'https://warpcast.com/~/channel/bookies'
        }, 
        {
          label: 'Place Another Bet', 
          action:'post', 
          target: generateUrl(`/api/alea/${FrameNames.EVENT}/${FrameNames.PLACE_BET}`, {[RequestProps.EVENT_NAME]: eventName}, false)}
        ],
      postUrl: generateUrl(`/api/alea/${FrameNames.EVENT}/${FrameNames.BET_CONFIRMATION}`, {[RequestProps.EVENT_NAME]: eventName}, false),
    }),
  );
}


export const revalidate = 0;
// export const dynamic = 'force-dynamic';
// export const fetchCache = 'force-no-store';
