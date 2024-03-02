import { NextRequest, NextResponse } from 'next/server';
import { FrameNames, RequestProps, generateUrl, getFrameMessage } from '../../../../src/utils';
import { Frame, getFrameHtml} from "frames.js";
import { kv } from '@vercel/kv';
import { getRequestProps } from '../../../../src/utils';

export async function POST(req: NextRequest): Promise<Response> {
  return await GET(req);
}

export async function GET(req: NextRequest): Promise<Response> {
  const {eventName} = getRequestProps(req, [RequestProps.EVENT_NAME]);
  const startDate : number | null = await kv.hget(eventName, 'startDate')

  if (startDate === null) throw new Error('Event not found');

  const imageUrl:string = generateUrl(`api/frames/${FrameNames.EVENT}/image`, {[RequestProps.EVENT_NAME]: eventName, [RequestProps.TIME]: startDate}, true)
  
  const frame : Frame = {
    version: "vNext",
    buttons: [
      {
        label: 'Place Bet',
        action: 'post',
      },
    ],
    image: imageUrl,
    postUrl: generateUrl(`api/frames/${FrameNames.PLACE_BET}`, {[RequestProps.EVENT_NAME]: FrameNames.BOS_DAL_ML}, false),
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
