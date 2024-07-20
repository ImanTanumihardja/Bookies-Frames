import { NextRequest, NextResponse } from 'next/server';
import { generateUrl, getRequestProps } from '@utils';
import { FrameNames, RequestProps, Transactions } from '@utils/constants';
import { Frame, FrameButtonsType, getFrameHtml} from "frames.js";
import { Market } from '@types';
import { kv } from '@vercel/kv';

export async function POST(req: NextRequest, { params: { marketId: marketId } }: { params: { marketId: string } }): Promise<Response> {
  return await GET(req, { params: { marketId: marketId } });
}

export async function GET(req: NextRequest, { params: { marketId } }: { params: { marketId: string } }): Promise<Response> {

  const {pick, odds, stake} = getRequestProps(req, [RequestProps.PICK, RequestProps.ODDS, RequestProps.STAKE]);

  let event : Market | null = null;
  await Promise.all([kv.hgetall(marketId)]).then( (res) => {
    event = res[0] as Market || null;
  });

  event = event as unknown as Market || null;

  // Get info for bet
  if (event === null) throw new Error('Event not found');

  const buttons = [
    {
      label: 'Bet Against',
      action: 'tx',
      target: generateUrl(`api/bookies/transactions/${Transactions.APPROVE}`, {[RequestProps.ADDRESS]: event.address}, false),
    },
    {
      label: 'Copy Bet',
      action: 'tx',
      target: generateUrl(`api/bookies/transactions/${Transactions.APPROVE}`, {[RequestProps.ADDRESS]: event.address}, false),
    },
  ] as FrameButtonsType
    
  const postUrl = generateUrl(`api/bookies/${marketId}/${FrameNames.BETSLIP}`, {[RequestProps.ODDS]: odds}, false)

  const imageUrl = generateUrl(`api/bookies/${marketId}/${FrameNames.PLACE_BET}/image`, {[RequestProps.PROMPT]: event.prompt, 
                                                                                    [RequestProps.PICK]: event.options[pick]}, true);

  const frame : Frame = {
    version: "vNext",
    buttons: buttons,
    image: imageUrl,
    postUrl: postUrl
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
