import { NextRequest, NextResponse } from 'next/server';
import { kv } from "@vercel/kv";
import { User, DEFAULT_USER} from '../../../../types';
import { RequestProps, generateImageUrl } from '../../../../../src/utils';
// import { getFrameMessage, getFrameHtml, Frame} from "frames.js";
import { FrameRequest, getFrameMessage, getFrameHtmlResponse } from '@coinbase/onchainkit';

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Verify the frame request
  const body = await req.json();
  const { isValid, message } = await getFrameMessage(body, { neynarApiKey: 'NEYNAR_ONCHAIN_KIT' });
    // let user : User = await kv.hgetall(accountAddress) || {} as User

    // // Check if I can parse the amount as integer
    // let wagerAmount;
    // try {
    //   wagerAmount = parseInt(message?.input || "0");
    // }
    // catch (e) {
    //   return new NextResponse(
    //     // Return a response with a error message
    //     getFrameHtmlResponse({
    //       image: `${process.env['HOST']}/superbowl.png`,
    //     }),
    //   );
    // }

    // // Check if the amount is valid
    // if (wagerAmount > user.points) {
    //   return new NextResponse(
    //     // Return a response with a error message
    //     getFrameHtmlResponse({
    //       image: `${process.env['HOST']}/superbowl.png`,
    //     }),
    //   );
    // }

    // // Get the poll data from database or init if not exists
    // let event : Event = await kv.hgetall(frameName) || {startDate: 1707694200000, poll: [0, 0], bets: {} as Record<number, Bet>, result: -1};

    // const now = new Date().getTime();

    // // Check if voted before and if the event is closed
    // const voteExists = event?.bets.hasOwnProperty(fid);
    // if (!voteExists && now < event?.startDate) {
    //   const multi = kv.multi();

    //   event.poll[prediction]++;
    //   event.bets[fid] = {eventName: frameName, wagerAmount: wagerAmount, prediction:prediction, timeStamp: now};
    //   await multi.hset(frameName, event);

    //   user.points -= wagerAmount;
    //   await multi.hset(accountAddress, user);

    //   await multi.exec();
    // } 
    // else if (event.startDate >= now) {
    //   prediction = event.bets[fid].prediction;
    // }
    // else {
    //   prediction = -1
    // }

    const imageUrl = `${process.env['HOST']}/superbowl.png`//`${process.env['HOST']}/api/frames/${frameName}/image?chiefs=${event.poll[0]}&niners=${event.poll[1]}&result=${event.result}&prediction=${prediction}&timestamp=${now}`;

    return new NextResponse(
      getFrameHtmlResponse({
        image: `${imageUrl}`,
        post_url: `${process.env['HOST']}/api/frames/`,
      }),
    );
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
} 


export const dynamic = 'force-dynamic';
