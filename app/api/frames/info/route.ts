import { NextRequest, NextResponse } from 'next/server';
import { FrameNames, RequestProps, generateUrl, getRequestProps, validateFrameMessage } from '../../../../src/utils';
import { getFrameHtml} from "frames.js";

const MAX_INDEX:number = 11;

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Verify the frame request
  const {button} = await validateFrameMessage(req);

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
      image: `${process.env['HOST']}/${FrameNames.INFO}/${currentIndex}.png`,
      buttons: currentIndex === MAX_INDEX ? [{label: '<', action:'post'}, { label: "Follow Us!", action: 'link', target: 'https://warpcast.com/bookies'}] : currentIndex !== 1 ? [{label: '<', action:'post'} , {label: '>', action:'post'}] : [{label: currentIndex === 1 ? 'See Schedule': '>', action:'post'}],
      postUrl: `${process.env['HOST']}/api/frames/${FrameNames.INFO}?index=${currentIndex}`,
    }),
  );
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
} 
