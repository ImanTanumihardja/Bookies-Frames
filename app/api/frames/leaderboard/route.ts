import { NextRequest, NextResponse } from 'next/server';
import { FrameNames, RequestProps, generateUrl, getRequestProps, getFrameMessage } from '../../../../src/utils';
import { Frame, getFrameHtml} from "frames.js";

export async function POST(req: NextRequest): Promise<Response> {
  // Verify the frame request
  const message = await getFrameMessage(req, false);
  let {offset} = getRequestProps(req, [RequestProps.OFFSET]);

  if (offset === -1) { // Coming from profile finder aand looking for top 5
    offset = 0;
  }
  else if (offset === 0){
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
  const imageUrl = generateUrl(`api/frames/${FrameNames.LEADERBOARD}/image`, {[RequestProps.OFFSET]: 0}, true)

    const frame : Frame = {
      version: "vNext",
      buttons: [{label: '>', action:'post'}],
      image: imageUrl,
      postUrl: generateUrl(`api/frames/${FrameNames.LEADERBOARD}`, {[RequestProps.OFFSET]: 0, [RequestProps.COUNT]: 5}, false)
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

export const revalidate = 0;
// export const dynamic = 'force-dynamic';
// export const fetchCache = 'force-no-store';
