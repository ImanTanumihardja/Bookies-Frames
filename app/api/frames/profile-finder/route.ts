import { NextRequest, NextResponse } from 'next/server';
import { getFrameMessage, Frame, getFrameHtml } from "frames.js";
import { generateImageUrl, RequestProps} from '../../../../src/utils';

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Verify the frame request
  const body = await req.json();
  const { isValid, requesterFollowsCaster: isFollowing, requesterFid: fid}  = await getFrameMessage(body, { fetchHubContext: true });

  if (!isValid) throw new Error('Invalid frame message');

  const frameName: string = req.nextUrl.pathname.split('/').pop() || "";

  const imageUrl = generateImageUrl(frameName, {[RequestProps.IS_FOLLOWING]: isFollowing, [RequestProps.FID]: fid});

  const frame: Frame = {
    version: "vNext",
    image: imageUrl,
    buttons: isFollowing ? [{ label: "Check out /bookies!", action: 'link', target: 'https://warpcast.com/~/channel/bookies'}, { label: "Refresh", action: 'post'}] : [{ label: "Follow Us!", action: 'link', target: 'https://warpcast.com/bookies'}, { label: "Refresh", action: 'post'}],
    postUrl: `${process.env['HOST']}/api/frames/${frameName}`,
  };

  return new NextResponse(
    getFrameHtml(frame),
  );
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
} 


export const dynamic = 'force-dynamic';
