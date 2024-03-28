import { NextRequest, NextResponse } from 'next/server';
import { FrameNames, RequestProps, generateUrl, Accounts } from '../../../../src/utils';
import { Frame, getFrameHtml} from "frames.js";
import { kv } from '@vercel/kv';
import { Event } from '../../../types';

export async function POST(req: NextRequest, { params: { eventName } }: { params: { eventName: string } }): Promise<Response> {
  return await GET(req, { params: { eventName } });
}

export async function GET(req: NextRequest, { params: { eventName } }: { params: { eventName: string } }): Promise<Response> {

  console.log('Event Name: ', eventName)
  const event : Event | null = await kv.hgetall(eventName)
  if (event === null) throw new Error('Event not found');

  // Check if event is hosted by Alea
  if (event.host !== Accounts.ALEA && event.host !== Accounts.BOTH) {
    throw new Error('Event not hosted by Alea');
  }

  const startDate : number = event?.startDate

  const imageUrl:string = generateUrl(`api/alea/${eventName}/image`, {[RequestProps.TIME]: startDate}, true)
  
  const frame : Frame = {
    version: "vNext",
    buttons: [
      {
        label: 'Place Bet',
        action: 'post',
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

export const revalidate = 60;
// export const dynamic = 'force-dynamic';
// export const fetchCache = 'force-no-store';
