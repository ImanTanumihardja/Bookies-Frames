import { getFrameHtmlResponse } from '@coinbase/onchainkit';
import { NextRequest, NextResponse } from 'next/server';
import { kv } from "@vercel/kv";
import { Event, User, Bet } from '../../../types';
import { DEFAULT_USER, RequestProps, generateImageUrl, getRequestProps, validateFrameMessage } from '../../../../src/utils';

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Verify the frame request
  const message = await validateFrameMessage(req);

  const {followingBookies: isFollowing, button, fid} = message;
  
  let user : User | null = await kv.hgetall(fid.toString()) || DEFAULT_USER

  const balance = parseInt(user.points.toString());

  // Get eventName from req
  let {eventName, stake, prediction} = getRequestProps(req, [RequestProps.EVENT_NAME, RequestProps.STAKE, RequestProps.PREDICTION]);

  let event : Event | null = await kv.hget('events', eventName)
  if (event === null) throw new Error('Event not found');

  if (stake <= 0 || stake > balance) {
    stake = -1
  }

  // Check if voted before and if the event is closed
  const betExists = event?.bets.hasOwnProperty(fid);

  const now = new Date().getTime();
  if (!betExists && now < event?.startDate && stake >= 1) {
    // Can bet
    const multi = kv.multi();

    event.poll[prediction]++;
    event.bets[fid] = {eventName: eventName, prediction:prediction, stake:stake, timeStamp: now} as Bet;

    let sendEvent : any = {}
    sendEvent[eventName] = event;

    await multi.hset('events', sendEvent);

    user.points = balance - stake;
    await multi.hset(fid.toString(), user);

    await multi.exec();
  } 
  else if (event.startDate >= now && betExists) {
    // Event has started
    stake = 0;
    prediction = event.bets[fid].prediction;
  }
  else {
    prediction = -1
  }

  const imageUrl = generateImageUrl('bet-confirmation', {[RequestProps.IS_FOLLOWING]: isFollowing, [RequestProps.STAKE]: stake, [RequestProps.PREDICTION]: prediction, [RequestProps.BUTTON_INDEX]: button});

  return new NextResponse(
    getFrameHtmlResponse({
      image: `${imageUrl}`,
    }),
  );
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
} 


export const dynamic = 'force-dynamic';
