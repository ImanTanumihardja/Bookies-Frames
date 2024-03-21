import { NextRequest, NextResponse } from 'next/server';
import { FrameNames, RequestProps, generateUrl, getRequestProps, getFrameMessage } from '../../../../src/utils';
import { Frame, getFrameHtml} from "frames.js";

const MAX_INDEX:number = 1;

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Verify the frame request
  const {button} = await getFrameMessage(req, false);

  const {index: lastIndex} = getRequestProps(req, [RequestProps.INDEX]);

  let currentIndex:number = 0

  if ((button === 2 && lastIndex !== MAX_INDEX) || lastIndex === 1 || lastIndex === 0) {
    currentIndex = lastIndex + 1;
  } else if (button === 1 && lastIndex !== 0) {
    currentIndex = lastIndex - 1;
  }

  return new NextResponse(
    getFrameHtml({
      version: "vNext",
      image: generateUrl(`${FrameNames.INFO}/${currentIndex}.png`, {}, true),
      buttons: [{ label: "Check out /bookies!", action: 'link', target: 'https://warpcast.com/~/channel/bookies'}],
      postUrl: generateUrl(`api/alea/${FrameNames.INFO}`, {[RequestProps.INDEX] : currentIndex}, false),
    }),
  );
}

export async function GET(req: NextRequest): Promise<Response> {
  const imageUrl = generateUrl(`thumbnails/claim-dice.gif`, {}, true)

  const frame : Frame = {
    version: "vNext",
    buttons: [{label: 'Learn More', action:'post'}],
    image: imageUrl,
    postUrl: generateUrl(`api/alea/${FrameNames.INFO}`, {[RequestProps.INDEX] : 0}, false),
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
