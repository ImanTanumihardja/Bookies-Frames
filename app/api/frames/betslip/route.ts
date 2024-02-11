import { getFrameHtmlResponse } from '@coinbase/onchainkit';
import { NextRequest, NextResponse } from 'next/server';
import { kv } from "@vercel/kv";
import { RequestProps, generateImageUrl, getRequestProps, validateFrameMessage } from '../../../../src/utils';

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Verify the frame request
  const message = await validateFrameMessage(req);

  const {followingBookies: isFollowing, button, fid} = message;
  
  let wagerAmount = parseInt(message?.input);
  if (wagerAmount < 0 || Number.isNaN(wagerAmount) || !wagerAmount) {
    throw new Error('Invalid wager amount');  
  }

  // Get eventName from req
  const {eventName} = getRequestProps(req, [RequestProps.EVENT_NAME]);

  const imageUrl = generateImageUrl('betslip', {[RequestProps.IS_FOLLOWING]: isFollowing, [RequestProps.FID]: fid, [RequestProps.PREDICTION]: button-1, [RequestProps.EVENT_NAME]: eventName, [RequestProps.STAKE]: wagerAmount});

  return new NextResponse(
    getFrameHtmlResponse({
      image: `${imageUrl}`,
      post_url: `${process.env['HOST']}/api/frames/bet-confirmation`,
      buttons: [{label: "Confirm"}]
    }),
  );
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
} 


export const dynamic = 'force-dynamic';
