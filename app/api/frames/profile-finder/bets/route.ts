import { NextRequest, NextResponse } from 'next/server';
import { Frame, getFrameHtml } from "frames.js";
import { generateUrl, RequestProps, validateFrameMessage, FrameNames, getRequestProps } from '../../../../../src/utils';
import { User } from '../../../../types';
import { kv } from '@vercel/kv';

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Verify the frame request
  const message = await validateFrameMessage(req);

  const {followingBookies: isFollowing, button} = message;

  const {fid, index:lastEventIndex, array:eventNames} = getRequestProps(req, [RequestProps.FID, RequestProps.INDEX, RequestProps.ARRAY]);

  console.log('FID: ', fid.toString())

  // Get next eventName
  if (!eventNames[lastEventIndex] && lastEventIndex !== -1) {
    throw new Error('Invalid event name');
  }

  let currentIndex = 0
  if (eventNames && lastEventIndex < eventNames.length) {
    if (button === 2 || button === 3 || lastEventIndex === -1 || lastEventIndex === 0) {
      currentIndex = lastEventIndex + 1;
    }
    else if (button === 1){
      currentIndex = lastEventIndex - 1;
    }
  }

  console.log('Current Index: ', currentIndex)
    
  const imageUrl = generateUrl(`api/frames/${FrameNames.PROFILE_FINDER}/${FrameNames.BETS}/image`, {[RequestProps.IS_FOLLOWING]: isFollowing, [RequestProps.FID]: fid, [RequestProps.EVENT_NAME]: eventNames[currentIndex]}, true, true);

  const frame: Frame = {
    version: "vNext",
    image: imageUrl,
    buttons: isFollowing ? currentIndex === eventNames.length - 1 ? 
    [
      {
        label: '<',
        action: 'post'
      },
      {
        label: 'Search Again',
        action: 'link',
        target: 'https://warpcast.com/bookies'
      },
    ]
    :
    currentIndex === 0 && eventNames.length !== 1 ? [
      {
        label: 'Search Again',
        action: 'link',
        target: 'https://warpcast.com/bookies'
      },
      {
        label: '>',
        action: 'post'
      }
    ] 
    :
    currentIndex === 0 && eventNames.length === 1 ? [
      {
        label: 'Search Again',
        action: 'link',
        target: 'https://warpcast.com/bookies'
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
        target: 'https://warpcast.com/bookies'
      },
      {
        label: '>',
        action: 'post'
      }
    ]
    :
    [{ label: "Follow Us!", action: 'link', target: 'https://warpcast.com/bookies'}],
    postUrl: generateUrl(`/api/frames/${FrameNames.PROFILE_FINDER}/${FrameNames.BETS}`, {[RequestProps.FID]: fid, [RequestProps.INDEX]: currentIndex, [RequestProps.ARRAY]: eventNames}, false, false),
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
