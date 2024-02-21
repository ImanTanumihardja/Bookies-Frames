import { getFrameHtml} from "frames.js";
import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_USER, FrameNames, RequestProps, generateUrl, getRequestProps, validateFrameMessage } from '../../../../src/utils';
import { kv } from "@vercel/kv";
import { User, Event } from "../../../types";

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Verify the frame request
  const message = await validateFrameMessage(req);

  const {followingBookies: isFollowing, button, fid} = message;

  let {eventName} = getRequestProps(req, [RequestProps.EVENT_NAME]);
  
  console.log('FID: ', fid.toString())
  
  // Check if float
  let isFloat = parseFloat(message?.input) % 1 !== 0;

  let stake = parseInt(message?.input);
  // Check if stake is not float
  if (!stake || stake < 0 || Number.isNaN(stake) || typeof stake !== 'number' || isFloat) {
    throw new Error('Invalid wager amount');  
  }

  // Wait for both user to be found and event to be found
  let user : User | null = null;
  let event : Event | null = null;
  var isNewUser: boolean = false;

  await Promise.all([kv.hgetall(fid.toString()), kv.hgetall(eventName)]).then( (res) => {
    user = res[0] as User || null;
    event = res[1] as Event || null;
  });

  event = event as unknown as Event || null;

  if (!user || (user as User)?.hasClaimed === undefined) {
    // New user
    user = DEFAULT_USER
    console.log('NEW USER: ', user)
  }

  if (user === null) throw new Error('User is null');

  // Get info for bet
  if (event === null) throw new Error('Event not found');

  // Check if event has already passed
  if (event.startDate < new Date().getTime()) {
    throw new Error('Event has already started');
  }

  // Check if new user if so add new user
  isNewUser = !user || (user as User)?.hasClaimed === undefined;

  if (isNewUser) {
      // New user
      user = DEFAULT_USER
      console.log('NEW USER: ', user)
  }
  else {
    console.log('USER: ', user)    
  }

  const prediction = button - 1;
  const impliedProbability = event.odds[prediction]
  const multiplier = event.multiplier;
  const streak = parseInt(user.streak.toString());
  const availableBal = parseInt(user?.balance.toString());
  const poll = Object.values(await kv.hgetall(`${eventName}:poll`) as Record<number, number>)
  const prompt = event.prompt;
  const options = event.options;


  const imageUrl = generateUrl(`api/frames/${FrameNames.BETSLIP}/image`, {[RequestProps.IS_FOLLOWING]: isFollowing, 
                                                                          [RequestProps.PREDICTION]: prediction, 
                                                                          [RequestProps.STAKE]: stake, 
                                                                          [RequestProps.ODD]: impliedProbability,
                                                                          [RequestProps.MULTIPLIER]: multiplier,
                                                                          [RequestProps.STREAK]: streak,
                                                                          [RequestProps.BALANCE]: availableBal,
                                                                          [RequestProps.POLL]: poll,
                                                                          [RequestProps.PROMPT]: prompt, 
                                                                          [RequestProps.OPTIONS]: options}, true, true);

  return new NextResponse(
    getFrameHtml({
      version: "vNext",
      image: `${imageUrl}`,
      postUrl: `${process.env['HOST']}/api/frames/${FrameNames.BET_CONFIRMATION}?eventName=${eventName}&stake=${stake}&prediction=${button-1}`,
      buttons: [
                {label: "Confirm", action: 'post'},
                {label: "Reject", action: 'post'}
              ]
    }),
  );
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
} 


export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
