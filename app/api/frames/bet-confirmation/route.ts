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
  let user : User = DEFAULT_USER;
  let event : Event | null = null;

  await Promise.all([kv.hgetall(fid.toString()), kv.hget('events', eventName)]).then( (res) => {
    user = res[0] as User || DEFAULT_USER;
    event = res[1] as Event || null;
  });

  event = event as unknown as Event || null;

  console.log('FID: ', fid.toString())

  const availableBal = parseInt(user.availableBalance.toString());

  if (event === null) throw new Error('Event not found');

  if (stake <= 0 || stake > availableBal) {
    stake = -1
  }

  // // Check if voted before and if the event is closed
  // const betExists = await kv.sismember(`${eventName}:bets`, fid.toString());

  const now = new Date().getTime();

  // Need to check bet does not exists, time is not past, and stake >= 1 and not rejected
  if (now < event?.startDate && stake >= 1 && event?.result === -1 && button != 2) {
    // Can bet
    event.poll[prediction]++;
    const bet : Bet = {eventName: eventName, fid: fid, prediction:prediction, odd: event.odds[prediction], stake:stake, timeStamp: now} as Bet;

    // Adjust user available balance
    user.availableBalance = availableBal - stake;
    user.bets[eventName] = bet

    // Set user
    await kv.hset(fid.toString(), user).then( async () => {
      // Set event
      await kv.sadd(`${eventName}:bets`, bet).catch(async (error) => {
        console.error('Error adding user to event:', error);
        // Try again
        await kv.sadd(`${eventName}:bets`, bet).catch((error) => {
          throw new Error('Error creating bet');
        })
      })
    }).catch((error) => {
      throw new Error('Error creating bet');
  });   

    console.log('NEW BET: ', bet)
  } 
  // else if (betExists) {
  //   stake = 0;
  //   console.log('BET EXISTS')
  // }
  else {
    prediction = -1
    console.log('FAILED TO PLACE BET')
  }

  const imageUrl = generateUrl(`api/frames/${FrameNames.BET_CONFIRMATION}/image`, {[RequestProps.IS_FOLLOWING]: isFollowing, [RequestProps.STAKE]: stake, [RequestProps.PREDICTION]: prediction, [RequestProps.BUTTON_INDEX]: button}, true, true);

  return new NextResponse(
    getFrameHtml({
      version: "vNext",
      image: `${imageUrl}`,
      buttons: [{ label: "Check out /bookies!", action: 'link', target: 'https://warpcast.com/~/channel/bookies'} ],
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
