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
    const fid = message?.interactor.fid || 0;

    // Get the poll data from database or init if not exists
    let event : Event = await kv.hgetall('SBLVIII') || {startDate: 1707694200000, poll: [0, 0], voted: [] as number[], result: 0}

    const now = new Date().getTime();

    // Check if voted before and if the event is closed
    const voteExists = event?.voted.includes(fid);
    if (!voteExists && now < event?.startDate) {
      event.poll[buttonIndex-1]++;
      event.voted.push(fid);
      await kv.hset("SBLVIII", event);
    }

    const imageUrl = `${process.env['HOST']}/api/frames/sblviii-winner/image?buttonIndex=${buttonIndex}&niners=${event.poll[1]}&chiefs=${event.poll[0]}&result=${event.result}&timestamp=${now}`;

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
