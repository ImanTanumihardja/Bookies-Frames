import { FrameRequest, getFrameMessage, getFrameHtmlResponse } from '@coinbase/onchainkit';
import { NextRequest, NextResponse } from 'next/server';
import { kv } from "@vercel/kv";
import { Event } from '../../../../types';

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Verify the frame request
  const body: FrameRequest = await req.json();
  const { isValid, message } = await getFrameMessage(body);

  if (isValid /*&& message.following*/) {
    const buttonIndex = message?.button || 0;
    let prediction = buttonIndex - 1; // zero indexed
    const fid = message?.interactor.fid || 0;

    // Get the poll data from database or init if not exists
    let event : Event = await kv.hgetall('SBLVIII') || {startDate: 1707694200000, poll: [0, 0], voted: {} as Record<string, any>, result: -1}

    const now = new Date().getTime();

    // Check if voted before and if the event is closed
    const voteExists = event?.voted.hasOwnProperty(fid);
    if (!voteExists && now < event?.startDate) {
      event.poll[prediction]++;
      event.voted[fid] = prediction;
      await kv.hset("SBLVIII", event);
    } 
    else {
      prediction = event.voted[fid];
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
        buttons: [
          {
            label: 'Chiefs',
          },
          {
            label: '49ers',
          },
        ],
        image: `${process.env['HOST']}/superbowl.png`,
        post_url: `${process.env['HOST']}/api/frames/sblviii-winner/vote`,
      }),
    );
  }
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
} 


export const dynamic = 'force-dynamic';
