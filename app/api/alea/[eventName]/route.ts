import { NextRequest, NextResponse } from 'next/server';
import { generateUrl } from '@utils';
import { FrameNames, RequestProps, Accounts } from "@utils/constants";
import { Frame, getFrameHtml} from "frames.js";
import { kv } from '@vercel/kv';
import { Market } from '@types';

export async function POST(req: NextRequest, { params: { eventName } }: { params: { eventName: string } }): Promise<Response> {
  return await GET(req, { params: { eventName } });
}

export async function GET(_: NextRequest, { params: { eventName } }: { params: { eventName: string } }): Promise<Response> {
  console.log('Event Name: ', eventName)
  const event : Market | null = await kv.hgetall(eventName)
  if (event === null) throw new Error('Event not found');

  // Check if event is hosted by Alea
  if (event.host !== Accounts.ALEA && event.host !== Accounts.BOTH) {
    throw new Error('Event not hosted by Alea');
  }

  const startDate : number = event?.startDate
  const prompt: string = event?.prompt
  const creator: number = event?.creator 

  const imageUrl:string = generateUrl(`api/alea/${eventName}/image`, {[RequestProps.TIME]: startDate, [RequestProps.PROMPT]: prompt, [RequestProps.FID]: creator}, true)
  
  const frame : Frame = {
    version: "vNext",
    buttons: [
      {
        label: 'Place Bet',
        action: 'post',
      },
      {
        label: 'Your Bets',
        action: 'post',
        target: generateUrl(`api/alea/${eventName}/${FrameNames.BET_CONFIRMATION}`, {[RequestProps.STAKE]: -1, [RequestProps.PICK]: -1}, false),
      },
    ],
    image: imageUrl,
    postUrl: generateUrl(`api/alea/${eventName}/${FrameNames.PLACE_BET}`, {}, false),
  };
  return new NextResponse(
    getFrameHtml(frame),
    {
      headers: {
        'content-type': 'text/html',
      },
    },
  );
}

export const revalidate = 3600;
// export const dynamic = 'force-dynamic';
// export const fetchCache = 'force-no-store';
