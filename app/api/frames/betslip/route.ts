import { getFrameHtml} from "frames.js";
import { NextRequest, NextResponse } from 'next/server';
import { FrameNames, RequestProps, generateUrl, getRequestProps, validateFrameMessage } from '../../../../src/utils';
import { parse } from "path";

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Verify the frame request
  const message = await validateFrameMessage(req);

  const {followingBookies: isFollowing, button, fid} = message;
  
  console.log('FID: ', fid.toString())
  
  // Check if float
  let isFloat = parseFloat(message?.input) % 1 !== 0;

  let stake = parseInt(message?.input);
  // Check if stake is not float

  if (!stake || stake < 0 || Number.isNaN(stake) || typeof stake !== 'number' || isFloat) {
    throw new Error('Invalid wager amount');  
  }

  // Get eventName from req
  const {eventName} = getRequestProps(req, [RequestProps.EVENT_NAME]);

  const imageUrl = generateUrl(`api/frames/${FrameNames.BETSLIP}/image`, {[RequestProps.IS_FOLLOWING]: isFollowing, [RequestProps.FID]: fid, [RequestProps.PREDICTION]: button-1, [RequestProps.EVENT_NAME]: eventName, [RequestProps.STAKE]: stake}, true, true);

  return new NextResponse(
    getFrameHtml({
      version: "vNext",
      image: `${imageUrl}`,
      postUrl: `${process.env['HOST']}/api/frames/${FrameNames.BET_CONFIRMATION}?eventName=${eventName}&stake=${stake}&prediction=${button-1}`,
      buttons: [
                {label: "Confirm", action: 'post'},
                {label: "Reject", action: 'post'}
              ]
    }),
  );
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
} 


export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
