import { getFrameHtmlResponse } from '@coinbase/onchainkit';
import { NextRequest, NextResponse } from 'next/server';
import { kv } from "@vercel/kv";
import { Event, User, Bet } from '../../../types';
import { DEFAULT_USER, FrameNames, RequestProps, generateUrl, getRequestProps, validateFrameMessage } from '../../../../src/utils';

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Verify the frame request
  const message = await validateFrameMessage(req);

  const {followingBookies: isFollowing, button, fid} = message;
  
  let user : User | null = await kv.hgetall(fid.toString()) || DEFAULT_USER;

  const currentBalance = parseInt(user.availableBalance.toString());

  // Get eventName from req
  let {eventName, stake, prediction} = getRequestProps(req, [RequestProps.EVENT_NAME, RequestProps.STAKE, RequestProps.PREDICTION]);

  let event : Event | null = await kv.hget('events', eventName)
  if (event === null) throw new Error('Event not found');

  if (stake <= 0 || stake > currentBalance) {
    stake = -1
  }

  // Check if voted before and if the event is closed
  const betExists = event?.bets.hasOwnProperty(fid);

  const now = new Date().getTime();

  // Need to check bet does not exists, time is not past, and stake >= 1 and not rejected
  if (!betExists && now < event?.startDate && stake >= 1 && button != 2) {
    // Can bet
    const multi = kv.multi();

    event.poll[prediction]++;
    event.bets[fid] = {prediction:prediction, odd: event.odds[prediction], stake:stake, timeStamp:now} as Bet;

    let sendEvent : any = {}
    sendEvent[eventName] = event;

    await multi.hset('events', sendEvent);

    // Adjust user available balance
    user.availableBalance = currentBalance - stake;
    user.bets.push(eventName)

    await multi.hset(fid.toString(), user);

    // Adjust score in  leaderboard
    await multi.zadd('users', {score: user.availableBalance, member: fid});

    await multi.exec();
  } 
  else if (betExists) {
    // Event has started
    stake = 0;
    prediction = event.bets[fid].prediction;
  }
  else {
    prediction = -1
  }

  const imageUrl = generateUrl(`api/frames/${FrameNames.BET_CONFIRMATION}/image`, {[RequestProps.IS_FOLLOWING]: isFollowing, [RequestProps.STAKE]: stake, [RequestProps.PREDICTION]: prediction, [RequestProps.BUTTON_INDEX]: button}, true, true);

  return new NextResponse(
    getFrameHtmlResponse({
      image: `${imageUrl}`,
      buttons: [{ label: "Check out /bookies!", action: 'link', target: 'https://warpcast.com/~/channel/bookies'}]
    }),
  );
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
} 


export const revalidate = 0;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
