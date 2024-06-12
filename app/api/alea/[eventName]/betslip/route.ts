import { getFrameHtml} from "frames.js";
import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_USER, DatabaseKeys, FrameNames, RequestProps, generateUrl, getFrameMessage } from '../../../../../src/utils';
import { kv } from "@vercel/kv";
import { User, Event } from "../../../../types";

export async function POST(req: NextRequest, { params: { eventName } }: { params: { eventName: string } }): Promise<Response> {
  // Verify the frame request
  const message = await getFrameMessage(req, false);

  const {button, fid, input} = message;
  
  console.log('FID: ', fid.toString())

  let stake = parseFloat(input);

  // Check if stake is not float
  if (!stake || stake < 0 || Number.isNaN(stake) || typeof stake !== 'number' || !Number.isFinite(stake) || stake % 1 !== 0) {
    return new Response(JSON.stringify({ message: 'Invalid stake amount' }), { status: 400, headers: { 'content-type': 'application/json' } });
  }

  stake = Math.floor(stake);

  // Wait for both user to be found and event to be found
  let user : User | null = null;
  let event : Event | null = null;

  await Promise.all([kv.hgetall(fid.toString()), kv.hgetall(eventName)]).then( (res) => {
    user = res[0] as User || null;
    event = res[1] as Event || null;
  });

  event = event as unknown as Event || null;

  if (!user || (user as User)?.hasClaimed === undefined || await kv.zscore(DatabaseKeys.LEADERBOARD, fid.toString()) === null) {
    // New user
    user = DEFAULT_USER
  }

  if (user === null) throw new Error('User is null');

  // Get info for bet
  if (event === null) throw new Error('Event not found');

  if (stake > user.balance) {
    return new Response(JSON.stringify({ message: `Invalid wager amount STAKE: ${stake}` }), { status: 400, headers: { 'content-type': 'application/json' } });
  }

  // Check if result has been set
  const result = parseInt(event.result.toString())
  if (result !== -1) {
    console.log('Event has already been settled');
  }

  let imageUrl = ''
  let pick = button - 1;
  const now = new Date().getTime() / 1000;
  // Check if event has already passed
  if (event.startDate < now || result !== -1) {
    pick = -1;
    imageUrl = generateUrl(`api/alea/${eventName}/${FrameNames.BET_CONFIRMATION}/image`, {[RequestProps.STAKE]: stake, 
                                                                              [RequestProps.PICK]: pick, 
                                                                              [RequestProps.BUTTON_INDEX]: button, 
                                                                              [RequestProps.FID]: fid, 
                                                                              [RequestProps.OPTIONS]: event.options, 
                                                                              [RequestProps.TIME]: now, 
                                                                              [RequestProps.RESULT]: result}, true);
  }
  else
  {
    const odd = event.odds[pick]
    const poll = Object.values(await kv.hgetall(`${eventName}:${DatabaseKeys.POLL}`) as Record<number, number>)
    const prompt = event.prompt;
    const options = event.options;


    imageUrl = generateUrl(`api/alea/${eventName}/${FrameNames.BETSLIP}/image`, {[RequestProps.PICK]: pick, 
                                                                      [RequestProps.STAKE]: stake, 
                                                                      [RequestProps.POLL]: poll,
                                                                      [RequestProps.ODD]: odd,
                                                                      [RequestProps.PROMPT]: prompt, 
                                                                      [RequestProps.OPTIONS]: options,}, true);
  }

  return new NextResponse(
    getFrameHtml({
      version: "vNext",
      image: `${imageUrl}`,
      postUrl: generateUrl(`api/alea/${eventName}/${FrameNames.BET_CONFIRMATION}`, {[RequestProps.STAKE]: stake, [RequestProps.PICK]: pick}, false),
      buttons: pick !== -1 ? [
                {
                  label: "Reject", 
                  action: 'post'
                },
                {
                  label: "Confirm", 
                  action: 'post'
                }
              ]
              :
              [
                { 
                  label: "Check out /bookies!", 
                  action: 'link', 
                  target: 'https://warpcast.com/~/channel/bookies'
                }
              ]
    }),
  );
} 

export const revalidate = 0;
// export const dynamic = 'force-dynamic';
// export const fetchCache = 'force-no-store';
