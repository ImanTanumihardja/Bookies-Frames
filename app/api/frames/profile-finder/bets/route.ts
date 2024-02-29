import { NextRequest, NextResponse } from 'next/server';
import { Frame, getFrameHtml } from "frames.js";
import { generateUrl, RequestProps, validateFrameMessage, FrameNames, getRequestProps } from '../../../../../src/utils';

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Verify the frame request
  const message = await validateFrameMessage(req);

  const {followingBookies: isFollowing, button} = message;

  const {fid, index:lastEventIndex, array:eventNames} = getRequestProps(req, [RequestProps.FID, RequestProps.INDEX, RequestProps.ARRAY]);

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
    
  const imageUrl = generateUrl(`api/frames/${FrameNames.PROFILE_FINDER}/${FrameNames.BETS}/image`, {[RequestProps.IS_FOLLOWING]: isFollowing, [RequestProps.FID]: fid, [RequestProps.EVENT_NAME]: eventNames[currentEventIndex]}, true);

  const frame: Frame = {
    version: "vNext",
    image: imageUrl,
    buttons: isFollowing ? currentEventIndex === 0 && eventNames.length === 1 ? // First event and no others
    [
      {
        label: 'Back to Profile',
        action: 'post',
        target: generateUrl(`/api/frames/${FrameNames.PROFILE_FINDER}`, {[RequestProps.FID]: fid, [RequestProps.IS_FOLLOWING]: isFollowing}, false)
      },
      {
        label: 'Search Again',
        action: 'link',
        target: generateUrl(`/api/frames/${FrameNames.PROFILE_FINDER}`, {[RequestProps.FID]: -1, [RequestProps.IS_FOLLOWING]: isFollowing}, false)
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
        action: 'link',
        target: generateUrl(`/api/frames/${FrameNames.PROFILE_FINDER}`, {[RequestProps.FID]: -1, [RequestProps.IS_FOLLOWING]: isFollowing}, false)
      },
    ]
    :
    currentEventIndex === 0 && eventNames.length !== 1 ? // First event with others
    [
      {
        label: 'Back to Profile',
        action: 'post'
      },
      {
        label: 'Search Again',
        action: 'link',
        target: generateUrl(`/api/frames/${FrameNames.PROFILE_FINDER}`, {[RequestProps.FID]: -1, [RequestProps.IS_FOLLOWING]: isFollowing}, false)
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
        action: 'link',
        target: generateUrl(`/api/frames/${FrameNames.PROFILE_FINDER}`, {[RequestProps.FID]: -1, [RequestProps.IS_FOLLOWING]: isFollowing}, false)
      },
      {
        label: '>',
        action: 'post'
      }
    ]
    :
    [{ label: "Follow Us!", action: 'link', target: 'https://warpcast.com/bookies'}],
    postUrl: generateUrl(`/api/frames/${FrameNames.PROFILE_FINDER}/${FrameNames.BETS}`, {[RequestProps.FID]: fid, [RequestProps.INDEX]: currentEventIndex, [RequestProps.ARRAY]: eventNames}, false),
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
