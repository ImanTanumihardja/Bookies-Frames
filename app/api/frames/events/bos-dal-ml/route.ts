import { NextRequest, NextResponse } from 'next/server';
import { FrameNames, RequestProps, generateUrl, getFrameMessage } from '../../../../../src/utils';
import { Frame, getFrameHtml} from "frames.js";


export async function POST(req: NextRequest): Promise<Response> {
  const options = ["Celtics", "Mavericks"]
  const imageUrl = generateUrl(`api/frames/${FrameNames.EVENT_THUMBNAIL}/image`, {[RequestProps.EVENT_NAME]: FrameNames.BOS_DAL_ML}, true)

  const frame : Frame = {
    version: "vNext",
    inputText: 'Amount of dice you want to bet',

    buttons: [
      {
        label: options[0],
        action: 'post',
      },
      {
        label: options[1],
        action: 'post',
      },
    ],
    image: imageUrl,
    postUrl: generateUrl(`api/frames/${FrameNames.BETSLIP}`, {[RequestProps.EVENT_NAME]: FrameNames.BOS_DAL_ML}, false),
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

export async function GET(req: NextRequest): Promise<Response> {
  const options = ["Heat", "Nuggets"]
  const imageUrl = generateUrl(`api/frames/${FrameNames.EVENT_THUMBNAIL}/image`, {[RequestProps.EVENT_NAME]: FrameNames.BOS_DAL_ML}, true)

  const frame : Frame = {
    version: "vNext",
    inputText: 'Amount of dice you want to bet',

    buttons: [
      {
        label: options[0],
        action: 'post',
      },
      {
        label: options[1],
        action: 'post',
      },
    ],
    image: imageUrl,
    postUrl: generateUrl(`api/frames/${FrameNames.BETSLIP}`, {[RequestProps.EVENT_NAME]: FrameNames.BOS_DAL_ML}, false),
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
