import { getFrameHtml} from "frames.js";
import { NextRequest, NextResponse } from 'next/server';
import { kv } from "@vercel/kv";
import { Event, User, Bet } from '../../../types';
import { DEFAULT_USER, FrameNames, RequestProps, generateUrl, getRequestProps, validateFrameMessage } from '../../../../src/utils';

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Verify the frame request
  const message = await validateFrameMessage(req);

  const {followingBookies: isFollowing, button, fid} = message;

  const kv_url = process.env.KV_URL;
  if (kv_url === undefined) {
    throw new Error('KV_URL not defined');
  }

  // Get eventName from req
  let {eventName, stake, pick} = getRequestProps(req, [RequestProps.EVENT_NAME, RequestProps.STAKE, RequestProps.PICK]);

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
  isNewUser = !user || (user as User).hasClaimed === undefined || (user as User).balance === undefined || await kv.zscore('users', fid.toString()) === null;

  if (isNewUser) {
      // New user
      user = structuredClone(DEFAULT_USER)
      user.hasClaimed = true;
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
    const bet : Bet = {eventName: eventName, pick:pick, odd: event.odds[pick], stake:stake, timeStamp: now, settled: false} as Bet;

    // Adjust user available balance
    user.balance = balance - stake;
    user.bets.push(bet)

    // Set user
    await kv.hset(fid.toString(), user).then( async () => {
      // Set event
      await kv.sadd(`${eventName}:bets`, fid).catch(async (error) => {
        console.error('Error adding user to event:', error);
        // Try again
        await kv.sadd(`${eventName}:bets`, fid).catch((error) => {
          throw new Error('Error creating bet');
        })
      })

      // Update poll
      await kv.hincrby(`${eventName}:poll`, `${pick}`, 1).catch(async (error) => {
        console.error('Error adding user to event:', error);
        // Try again
        await kv.hincrby(`${eventName}:poll`, `${pick}`, 1).catch((error) => {
          throw new Error('Error creating bet');
        })
      })

      // If new user add to leaderboard
      if (isNewUser) {
        if (user !== null) await kv.zadd('users', {score: DEFAULT_USER.balance, member: fid}).catch(async (error) => {
          console.error('Error adding user to leaderboard:', error);
          // Try again
          if (user !== null) await kv.zadd('users', {score: DEFAULT_USER.balance, member: fid}).catch((error) => {
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

  const imageUrl = generateUrl(`api/frames/${FrameNames.BET_CONFIRMATION}/image`, {[RequestProps.IS_FOLLOWING]: isFollowing, [RequestProps.STAKE]: stake, [RequestProps.PICK]: pick, [RequestProps.BUTTON_INDEX]: button}, true, true);

  return new NextResponse(
    getFrameHtml({
      version: "vNext",
      image: `${imageUrl}`,
            buttons: [{ label: "Check out /bookies!", action: 'link', target: 'https://warpcast.com/~/channel/bookies'}, {label: pick === -1 ? 'Try Again' : 'Place Another Bet', action:'link', target: 'https://warpcast.com/bookies/0x1a01ca64'}],
            postUrl: `${process.env['HOST']}/api/frames/${FrameNames.BET_CONFIRMATION}`,
          }),
        );
      }

      export async function POST(req: NextRequest): Promise<Response> {
        return getResponse(req);
      } 

export const revalidate = 0;
// export const dynamic = 'force-dynamic';
// export const fetchCache = 'force-no-store';
