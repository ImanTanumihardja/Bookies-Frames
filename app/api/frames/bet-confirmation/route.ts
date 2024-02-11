import { getFrameHtmlResponse } from '@coinbase/onchainkit';
import { NextRequest, NextResponse } from 'next/server';
import { kv } from "@vercel/kv";
import { Event, User, Bet } from '../../../types';
import { RequestProps, generateImageUrl, getRequestProps, validateFrameMessage } from '../../../../src/utils';

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Verify the frame request
  const message = await validateFrameMessage(req);

  const {followingBookies: isFollowing, button, fid} = message;
  let user : User | null = await kv.hgetall(fid.toString())

  if (user === null) throw new Error('User not found');
  
  let wagerAmount = parseInt(message?.input);
  
  // Check if the amount is valid
  if (wagerAmount < 0 && wagerAmount > user.points) {
    wagerAmount = -1;
  }

  // Get eventName from req
  const {eventName} = getRequestProps(req, [RequestProps.EVENT_NAME]);

  let event : Event | null = await kv.hget('events', eventName)
  if (event === null) throw new Error('Event not found');

  // Check if voted before and if the event is closed
  const betExists = event?.bets.hasOwnProperty(fid);
  let prediction: number = button - 1;

  const now = new Date().getTime();
  if (!betExists && now < event?.startDate) {
    // Can bet
    const multi = kv.multi();

    event.poll[prediction]++;
    event.bets[fid] = {eventName: eventName, wagerAmount: wagerAmount, prediction:prediction, timeStamp: now} as Bet;

    let sendEvent : any = {}
    sendEvent[eventName] = event;

    await multi.hset('events', sendEvent);

    user.points -= wagerAmount;
    await multi.hset(fid.toString(), user);

    await multi.exec();
  } 
  else if (event.startDate >= now && betExists) {
    // Event has started
    prediction = event.bets[fid].prediction;
  }
  else {
    prediction = -1
  }

  const imageUrl = generateImageUrl('betslip', {[RequestProps.IS_FOLLOWING]: isFollowing, [RequestProps.AMOUNT]: wagerAmount, [RequestProps.PREDICTION]: prediction, [RequestProps.STREAK]: user.streak, [RequestProps.MULTIPLIER]: event.multiplier, [RequestProps.TIMESTAMP]: now, [RequestProps.ODDS]: event.odds, [RequestProps.OPTIONS]: event.options, [RequestProps.BALANCE]: user.points, [RequestProps.POLL]: event.poll, [RequestProps.PROMPT]: event.prompt});

  return new NextResponse(
    getFrameHtmlResponse({
      image: `${imageUrl}`,
      post_url: `${process.env['HOST']}/api/frames/${eventName}`,
      buttons: [{label: "Confirm"}]
    }),
  );
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
} 


export const dynamic = 'force-dynamic';
