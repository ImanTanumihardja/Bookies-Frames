import { NextRequest, NextResponse } from 'next/server';
import { calculatePayout, generateUrl, getRequestProps } from '@utils';
import { FrameNames, RequestProps, Transactions } from '@utils/constants';
import { Frame, FrameButtonsType, getFrameHtml} from "frames.js";
import { Market } from '@types';
import { kv } from '@vercel/kv';

export async function POST(req: NextRequest, { params: { marketId: marketId } }: { params: { marketId: string } }): Promise<Response> {
  return await GET(req, { params: { marketId: marketId } });
}

export async function GET(req: NextRequest, { params: { marketId } }: { params: { marketId: string } }): Promise<Response> {

  const {pick, odds, stake, fid, symbol} = getRequestProps(req, [RequestProps.PICK, RequestProps.ODDS, RequestProps.STAKE, RequestProps.FID, RequestProps.SYMBOL]);

  console.log('Pick: ', pick);
  console.log('Odds: ', odds);
  console.log('Stake: ', stake);
  console.log('Fid: ', fid);
  console.log('Symbol: ', symbol);
  if (pick == null || odds == null  || stake == null || fid == null || symbol == null) throw new Error('Invalid request');

  let event : Market | null = null;
  await Promise.all([kv.hgetall(marketId)]).then( (res) => {
    event = res[0] as Market || null;
  });

  event = event as unknown as Market || null;

  // Get info for bet
  if (event === null) throw new Error('Event not found');


  // Get the counter bet
  const oppositePick = pick === 0 ? 1 : 0;
  const oppositeOdd = odds[oppositePick];

  // Calculate the stake to match the opposite side
  const oppositeStake = calculatePayout(oppositeOdd, stake) - stake;

  const  buttons = [
      {
        label: 'Bet Against',
        action: 'tx',
        target: generateUrl(`api/bookies/transactions/${Transactions.APPROVE}`, {[RequestProps.ADDRESS]: event.address, [RequestProps.STAKE]: oppositeStake}, false),
      },
      {
        label: 'Copy Bet',
        action: 'tx',
        target: generateUrl(`api/bookies/transactions/${Transactions.APPROVE}`, {[RequestProps.ADDRESS]: event.address, [RequestProps.STAKE]: stake}, false),
      },
    ] as FrameButtonsType
    
  const postUrl = generateUrl(`api/bookies/${marketId}/${FrameNames.BETSLIP}`, {[RequestProps.ODDS]: odds, [RequestProps.PICK]: pick, [RequestProps.STAKE]: stake}, false)

  const imageUrl = generateUrl(`api/bookies/${marketId}/${FrameNames.SHARE_BET}/image`, {[RequestProps.PROMPT]: event.prompt, 
                                                                                        [RequestProps.PICK]: pick,
                                                                                        [RequestProps.ODDS]: odds,
                                                                                        [RequestProps.OPTIONS]: event.options,
                                                                                        [RequestProps.SYMBOL]: symbol,
                                                                                        [RequestProps.STAKE]: stake,
                                                                                        [RequestProps.FID]: fid}, true);

  const frame : Frame = {
    version: "vNext",
    buttons: buttons,
    image: imageUrl,
    postUrl: postUrl,
    imageAspectRatio: "1:1",
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
