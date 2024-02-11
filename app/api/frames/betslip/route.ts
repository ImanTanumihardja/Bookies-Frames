import { getFrameHtmlResponse } from '@coinbase/onchainkit';
import { NextRequest, NextResponse } from 'next/server';
import { FrameNames, RequestProps, generateImageUrl, getRequestProps, validateFrameMessage } from '../../../../src/utils';

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Verify the frame request
  const message = await validateFrameMessage(req);

  const {followingBookies: isFollowing, button, fid} = message;
  
  let stake = parseInt(message?.input);
  if (!stake || stake < 0 || Number.isNaN(stake)) {
    throw new Error('Invalid wager amount');  
  }

  // Get eventName from req
  const {eventName} = getRequestProps(req, [RequestProps.EVENT_NAME]);

  const imageUrl = generateImageUrl(FrameNames.BETSLIP, {[RequestProps.IS_FOLLOWING]: isFollowing, [RequestProps.FID]: fid, [RequestProps.PREDICTION]: button-1, [RequestProps.EVENT_NAME]: eventName, [RequestProps.STAKE]: stake});

  return new NextResponse(
    getFrameHtmlResponse({
      image: `${imageUrl}`,
      post_url: `${process.env['HOST']}/api/frames/${FrameNames.BET_CONFIRMATION}?eventName=${eventName}&stake=${stake}&prediction=${button-1}`,
      buttons: [{label: "Confirm"}, {label: "Reject"}]
    }),
  );
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
} 


export const dynamic = 'force-dynamic';
