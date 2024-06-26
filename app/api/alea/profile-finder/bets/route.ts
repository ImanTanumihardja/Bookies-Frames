import { NextRequest, NextResponse } from 'next/server';
import { Frame, getFrameHtml } from "frames.js";
import { generateUrl, getFrameMessage, getRequestProps } from '@utils';
import { FrameNames, RequestProps, DEFAULT_USER } from '@utils/constants';
import { kv } from '@vercel/kv';
import { User } from '@types';

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Verify the frame request
  const message = await getFrameMessage(req, false);

  const { button } = message;

  const {fid, index:lastEventIndex} = getRequestProps(req, [RequestProps.FID, RequestProps.INDEX]);

  const user: User = await kv.hgetall(fid?.toString() || "") || DEFAULT_USER;
  
  const eventNames = Object.keys((user as User).bets) 

  console.log('Searched FID: ', fid.toString())

  // Get next eventName
  if (!eventNames[lastEventIndex] && lastEventIndex !== -1) {
    throw new Error('Invalid event name');
  }

  // If on bets page figure out which event to show based on button press
  let currentEventIndex = lastEventIndex
  if (eventNames && lastEventIndex !== -1) {
    if (button === 1){
      currentEventIndex = lastEventIndex - 1;
    }
    else if (button === 3) { // Increment index if not coming from profile page
      currentEventIndex = lastEventIndex + 1;
    }
  }

  console.log('Current Index: ', currentEventIndex)
    
  const imageUrl = generateUrl(`api/alea/${FrameNames.PROFILE_FINDER}/${FrameNames.BETS}/image`, { [RequestProps.FID]: fid, [RequestProps.EVENT_NAME]: eventNames[currentEventIndex]}, true);

  const frame: Frame = {
    version: "vNext",
    image: imageUrl,
    buttons: currentEventIndex === 0 && eventNames.length === 1 ? // First event and no others
    [
      {
        label: 'Back to Profile',
        action: 'post',
        target: generateUrl(`/api/alea/${FrameNames.PROFILE_FINDER}`, {[RequestProps.FID]: fid}, false)
      },
      {
        label: 'Search Again',
        action: 'post',
        target: generateUrl(`/api/alea/${FrameNames.PROFILE_FINDER}`, {[RequestProps.FID]: -1}, false)
      },
    ] 
    :
    currentEventIndex === eventNames.length - 1 ? // Last event with others
    [
      {
        label: '<',
        action: 'post'
      },
      {
        label: 'Search Again',
        action: 'post',
        target: generateUrl(`/api/alea/${FrameNames.PROFILE_FINDER}`, {[RequestProps.FID]: -1}, false)
      },
    ]
    :
    currentEventIndex === 0 && eventNames.length !== 1 ? // First event with others
    [
      {
        label: 'Back to Profile',
        action: 'post',
        target: generateUrl(`/api/alea/${FrameNames.PROFILE_FINDER}`, {[RequestProps.FID]: fid}, false)
      },
      {
        label: 'Search Again',
        action: 'post',
        target: generateUrl(`/api/alea/${FrameNames.PROFILE_FINDER}`, {[RequestProps.FID]: -1}, false)
      },
      {
        label: '>',
        action: 'post'
      }
    ]
    :
    [
      {
        label: '<',
        action: 'post'
      },
      {
        label: 'Search Again',
        action: 'post',
        target: generateUrl(`/api/alea/${FrameNames.PROFILE_FINDER}`, {[RequestProps.FID]: -1}, false)
      },
      {
        label: '>',
        action: 'post'
      }
    ],
    postUrl: generateUrl(`/api/alea/${FrameNames.PROFILE_FINDER}/${FrameNames.BETS}`, {[RequestProps.FID]: fid, [RequestProps.INDEX]: currentEventIndex}, false),
  };

  return new NextResponse(
    getFrameHtml(frame),
  );
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
} 

export const revalidate = 30;
// export const dynamic = 'force-dynamic';
// export const fetchCache = 'force-no-store';
