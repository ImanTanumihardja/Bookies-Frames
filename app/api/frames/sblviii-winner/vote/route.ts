import { FrameRequest, getFrameMessage, getFrameHtmlResponse } from '@coinbase/onchainkit';
import { NextRequest, NextResponse } from 'next/server';
import { kv } from "@vercel/kv";
import { Event, User } from '../../../../types';

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Verify the frame request
  const body: FrameRequest = await req.json();
  const { isValid, message } = await getFrameMessage(body, { neynarApiKey: 'NEYNAR_ONCHAIN_KIT' });

  if (isValid && message.following) {
    const buttonIndex: number = message?.button || 0;
    let prediction: number = buttonIndex - 1; // zero indexed
    const fid: number = message?.interactor.fid || 0;
    const accountAddress = message?.interactor.verified_accounts[0] || "";
    const eventName: string = req.nextUrl.searchParams.get("eventName") || "";

    // Check if I can parse the amount as integer
    let wagerAmount;
    try {
      wagerAmount = parseInt(message?.input || "0");
    }
    catch (e) {
      return new NextResponse(
        // Return a response with a error message
        getFrameHtmlResponse({
          image: `${process.env['HOST']}/superbowl.png`,
        }),
      );
    }

    // Check if the amount is valid
    let user : User = await kv.hget('points', accountAddress) || {balance: 0, address: accountAddress};
    if (wagerAmount > user.points) {
      return new NextResponse(
        // Return a response with a error message
        getFrameHtmlResponse({
          image: `${process.env['HOST']}/superbowl.png`,
        }),
      );
    }

    // Get the poll data from database or init if not exists
    let event : Event = await kv.hgetall(eventName) || {startDate: 1707694200000, poll: [0, 0], voted: {} as Record<number, {prediction: number, timeStamp: number}>, result: -1};

    const now = new Date().getTime();

    // Check if voted before and if the event is closed
    const voteExists = event?.voted.hasOwnProperty(fid);
    if (!voteExists && now < event?.startDate) {
      const multi = kv.multi();

      event.poll[prediction]++;
      event.voted[fid] = { prediction, timeStamp: now};
      await multi.hset(eventName, event);

      user.points -= wagerAmount;
      await multi.hset("accountAddress", user);
      
      await multi.exec();
    } 
    else if (event.startDate >= now) {
      prediction = event.voted[fid].prediction;
    }
    else {
      prediction = -1
    }

    const imageUrl = `${process.env['HOST']}/api/frames/sblviii-winner/image?chiefs=${event.poll[0]}&niners=${event.poll[1]}&result=${event.result}&prediction=${prediction}&timestamp=${now}`;

    return new NextResponse(
      getFrameHtmlResponse({
        image: `${imageUrl}`,
        post_url: `${process.env['HOST']}/api/frames/sblviii-winner/vote`,
      }),
    );
  } 
  else {
    return new NextResponse(
      getFrameHtmlResponse({
        image: `${process.env['HOST']}/superbowl.png`,
      }),
    );
  }
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
} 


export const dynamic = 'force-dynamic';
