import { NextRequest, NextResponse } from 'next/server';
import { generateUrl, getRequestProps } from '@utils';
import {FrameNames, RequestProps, Accounts} from "@utils/constants"
import { Frame, getFrameHtml} from "frames.js";
import { kv } from '@vercel/kv';
import { Market } from '@types';

export async function POST(req: NextRequest, { params: { marketId: marketId } }: { params: { marketId: string } }): Promise<Response> {
  return await GET(req, { params: { marketId: marketId } });
}

export async function GET(req: NextRequest, { params: {  marketId } }: { params: { marketId: string } }): Promise<Response> {
  console.log('Event Name: ', marketId)
  const event : Market | null = await kv.hgetall(marketId)
  if (event === null) throw new Error('Event not found');

  // Check if event is hosted by Bookies
  if (event.host !== Accounts.BOOKIES && event.host !== Accounts.BOTH) {
    throw new Error('Event not hosted by Bookies');
  }

  let odds: number[] = event.odds
  try {
    const {propOdds} = getRequestProps(req, [RequestProps.ODDS]);

    // Check if null
    if (propOdds !== null) {
      odds = propOdds
    }
  }
  catch (e) {
      console.warn("No odds given in url.")
  }

  const startDate : number = event?.startDate
  const prompt: string = event?.prompt
  const creator: number = event?.creator

  const imageUrl:string = generateUrl(`api/bookies/${marketId}/image`, {[RequestProps.TIME]: startDate, [RequestProps.PROMPT]: prompt, [RequestProps.FID]: creator}, true)
  
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
        target: generateUrl(`api/bookies/${marketId}/${FrameNames.BET_CONFIRMATION}`, {[RequestProps.STAKE]: 0, [RequestProps.PICK]: 0, [RequestProps.TRANSACTION_HASH]: ""}, false)
      }
    ],
    image: imageUrl,
    postUrl: generateUrl(`api/bookies/${marketId}/${FrameNames.PLACE_BET}`, {[RequestProps.ODDS]: odds}, false),
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
