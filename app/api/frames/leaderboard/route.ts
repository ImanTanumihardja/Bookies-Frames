import { NextRequest, NextResponse } from 'next/server';
import { FrameNames, RequestProps, generateUrl, getRequestProps, validateFrameMessage } from '../../../../src/utils';
import { Frame, getFrameHtml} from "frames.js";

export async function POST(req: NextRequest): Promise<Response> {
  // Verify the frame request
  const message = await validateFrameMessage(req);
  let {offset} = getRequestProps(req, [RequestProps.OFFSET]);

  if (offset === 0){
    offset += 5
  }
  else if (message.button === 2) {
    offset += 10;
  }
  else if (message.button === 1) {
    offset = Math.max(0, offset - 10);
  }

  const imageUrl = generateUrl(`api/frames/${FrameNames.LEADERBOARD}/image`, {[RequestProps.OFFSET]: offset}, true);

  return new NextResponse(
    getFrameHtml({
      version: "vNext",
      image: imageUrl,
      buttons: (offset !== 0 ?  [{label: '<', action:'post'} , {label: '>', action:'post'}] : [{label: '>', action:'post'}]),
      postUrl: `${process.env['HOST']}/api/frames/${FrameNames.LEADERBOARD}?offset=${offset}`,
    }),
  );
} 

export async function GET(req: NextRequest): Promise<Response> {
  const imageUrl = generateUrl(`thumbnails/${FrameNames.CLAIM_DICE}.gif`, {}, false)

  const frame : Frame = {
    version: "vNext",
    buttons: [{label: 'Learn More', action:'post'}],
    image: imageUrl,
    postUrl: `${process.env['HOST']}/api/frames/${FrameNames.INFO}?index=0`
  };

  return new NextResponse(
    getFrameHtml(frame),
    {
      headers: {
        'content-type': 'application/json',
      },
    },
  );
}

export const revalidate = 0;
// export const dynamic = 'force-dynamic';
// export const fetchCache = 'force-no-store';
