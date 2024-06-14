import { NextRequest, NextResponse } from 'next/server';
import { generateUrl, getRequestProps, getFrameMessage } from '@utils';
import { FrameNames, RequestProps } from '@utils/constants';
import { Frame, getFrameHtml} from "frames.js";

export async function POST(req: NextRequest): Promise<Response> {
  // Verify the frame request
  const message = await getFrameMessage(req, false);
  let {offset, redirect} = getRequestProps(req, [RequestProps.OFFSET, RequestProps.REDIRECT]);

  if (offset === -1) { // Coming from profile finder and looking for top 5
    offset = 0;
  }
  else if (offset === 0){
    offset += 5
  }
  else if (message.button === 2 && !redirect) {
    offset += 10;
  }
  else if (message.button === 1 && !redirect) {
    offset = Math.max(0, offset - 10);
  }

  const imageUrl = generateUrl(`api/alea/${FrameNames.LEADERBOARD}/image`, {[RequestProps.OFFSET]: offset}, true);

  return new NextResponse(
    getFrameHtml({
      version: "vNext",
      image: imageUrl,
      buttons: (offset !== 0 ?  [{label: '<', action:'post'} , {label: '>', action:'post'}] : [{label: '>', action:'post'}]),
      postUrl: generateUrl(`api/alea/${FrameNames.LEADERBOARD}`, {[RequestProps.OFFSET]: offset, [RequestProps.REDIRECT]: false}, false)
    }),
  );
} 

export async function GET(_: NextRequest): Promise<Response> {
  const imageUrl = generateUrl(`api/alea/${FrameNames.LEADERBOARD}/image`, {[RequestProps.OFFSET]: 0, [RequestProps.REDIRECT]: false}, true)

    const frame : Frame = {
      version: "vNext",
      buttons: [{label: '>', action:'post'}],
      image: imageUrl,
      postUrl: generateUrl(`api/alea/${FrameNames.LEADERBOARD}`, {[RequestProps.OFFSET]: 0, [RequestProps.REDIRECT]: false}, false)
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
