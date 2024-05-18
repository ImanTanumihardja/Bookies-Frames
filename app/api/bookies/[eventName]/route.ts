import { NextRequest, NextResponse } from 'next/server';
import { FrameNames, RequestProps, generateUrl, Accounts, DatabaseKeys } from '../../../../src/utils';
import { Frame, FrameButtonsType, getFrameHtml} from "frames.js";
import { kv } from '@vercel/kv';
import { Event } from '../../../types';
import { start } from 'repl';

export async function POST(req: NextRequest, { params: { eventName } }: { params: { eventName: string } }): Promise<Response> {
  return await GET(req, { params: { eventName } });
}

export async function GET(req: NextRequest, { params: { eventName } }: { params: { eventName: string } }): Promise<Response> {
  console.log('Event Name: ', eventName)
  const event : Event | null = await kv.hgetall(eventName)
  if (event === null) throw new Error('Event not found');

  // Check if event is hosted by Bookies
  if (event.host !== Accounts.BOOKIES && event.host !== Accounts.BOTH) {
    throw new Error('Event not hosted by Bookies');
  }

  const startDate : number = event?.startDate

  const imageUrl:string = generateUrl(`api/bookies/${eventName}/image`, {[RequestProps.TIME]: startDate}, true)

  // Get bookies events
  // Get all alea events and filter out this eventName
  let bookiesEvents = (await kv.sscan(`${Accounts.BOOKIES}:${DatabaseKeys.EVENTS}`, 0, {count: 150}))[1] as string[];
  bookiesEvents = bookiesEvents.filter((e) => e !== String(eventName));
  
  let buttons: FrameButtonsType;

  if (bookiesEvents.length !== 0 && startDate < new Date().getTime() / 1000) {
    buttons = [
      {
        label: 'Bet on Another Event',
        action: 'post',
        target: generateUrl(`api/bookies/${bookiesEvents[Math.floor(Math.random() * bookiesEvents.length)]}/${FrameNames.PLACE_BET}`, {}, false)
      },
    ]
  }
  else {
    buttons = [
      {
        label: 'Place Bet',
        action: 'post',
        target: generateUrl(`api/bookies/${eventName}/${FrameNames.PLACE_BET}`, {}, false)
      },
    ]
  }
  
  buttons.push({
    label: 'View Bets',
    action: 'post',
    target: generateUrl(`api/bookies/${eventName}/${FrameNames.BET_CONFIRMATION}`, {[RequestProps.STAKE]: 0, [RequestProps.PICK]: 0, [RequestProps.TRANSACTION_HASH]: ""}, false)
  })
  
  const frame : Frame = {
    version: "vNext",
    buttons: buttons,
    image: imageUrl,
    postUrl: generateUrl(`api/bookies/${eventName}/${FrameNames.PLACE_BET}`, {}, false),
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
