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
  let {eventName, stake, prediction} = getRequestProps(req, [RequestProps.EVENT_NAME, RequestProps.STAKE, RequestProps.PREDICTION]);

  // Wait for both user to be found and event to be found
  let user : User | null = DEFAULT_USER;
  let event : Event | null = null;
  let isNewUser: boolean = false;

  await Promise.all([kv.hgetall(fid.toString()), kv.hgetall(eventName)]).then( (res) => {
    user = res[0] as User || null;
    event = res[1] as Event || null;
  });

  event = event as unknown as Event || null;

  // Check if new user if so add new user
  isNewUser = !user || user.hasClaimed === undefined;
  console.log(isNewUser)

  if (isNewUser) {
      // New user
      user = DEFAULT_USER
      user.hasClaimed = true;
      console.log('NEW USER: ', user)
  }
  else {
    console.log('USER: ', user)    
  }

  if (user === null) throw new Error('User is null');

  console.log('FID: ', fid.toString())

  const balance = parseInt(user?.balance.toString());

  if (event === null) throw new Error('Event not found');

  if (stake <= 0 || stake > balance) {
    stake = -1
  }

  const now = new Date().getTime();

  // Need to check bet does not exists, time is not past, and stake >= 1 and not rejected
  console.log(stake, event?.startDate, now, event?.result, button)
  if (now < event?.startDate && stake >= 1 && event?.result === -1 && button != 2) {
    // Can bet
    const bet : Bet = {eventName: eventName, prediction:prediction, odd: event.odds[prediction], stake:stake, timeStamp: now, settled: false} as Bet;

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
      await kv.hincrby(`${eventName}:poll`, `${prediction}`, 1).catch(async (error) => {
        console.error('Error adding user to event:', error);
        // Try again
        await kv.hincrby(`${eventName}:poll`, `${prediction}`, 1).catch((error) => {
          throw new Error('Error creating bet');
        })
      })

      // If new user add to leaderboard
      if (isNewUser) {
        if (user !== null) await kv.zadd('users', {score: 100, member: fid}).catch(async (error) => {
          console.error('Error adding user to leaderboard:', error);
          // Try again
          if (user !== null) await kv.zadd('users', {score: user.balance, member: fid}).catch((error) => {
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
    prediction = -1
    console.log('FAILED TO PLACE BET')
  }

  const imageUrl = generateUrl(`api/frames/${FrameNames.BET_CONFIRMATION}/image`, {[RequestProps.IS_FOLLOWING]: isFollowing, [RequestProps.STAKE]: stake, [RequestProps.PREDICTION]: prediction, [RequestProps.BUTTON_INDEX]: button}, true, true);

  return new NextResponse(
    getFrameHtml({
      version: "vNext",
      image: `${imageUrl}`,
            buttons: [{ label: "Check out /bookies!", action: 'link', target: 'https://warpcast.com/~/channel/bookies'}, {label: prediction !== -1 ? 'Try Again' : 'Place Another Bet', action:'link', target: ''}],
            postUrl: `${process.env['HOST']}/api/frames/${FrameNames.BET_CONFIRMATION}`,
          }),
        );
      }

      export async function POST(req: NextRequest): Promise<Response> {
        return getResponse(req);
      } 

      export const revalidate = 0;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
