import { getFrameHtml} from "frames.js";
import { NextRequest, NextResponse } from 'next/server';
import {  DatabaseKeys, FrameNames, RequestProps, generateUrl, getRequestProps, getFrameMessage, Transactions } from '../../../../../src/utils';
import { kv } from "@vercel/kv";
import { User, Event } from "../../../../types";
import {ethers} from 'ethers';

export async function POST(req: NextRequest): Promise<Response> {
  // Verify the frame request
  const message = await getFrameMessage(req, false);

  const {button, fid, input, transactionId} = message;

  const provider = new ethers.JsonRpcProvider(process.env.OPTIMISM_PROVIDER_URL);

  let {eventName} = getRequestProps(req, [RequestProps.EVENT_NAME]);
  
  console.log('FID: ', fid.toString())

  let stake = parseFloat(input);

  // Check if stake is not float
  if (!stake || stake < 0 || Number.isNaN(stake) || typeof stake !== 'number' || !Number.isFinite(stake)) {
    throw new Error(`Invalid wager amount STAKE: ${input}`);  
  }

  // Wait for both user to be found and event to be found
  let event : Event | null = null;

  await Promise.all([kv.hgetall(eventName)]).then( (res) => {
    event = res[0] as Event || null;
  });

  event = event as unknown as Event || null;

  // Get info for bet
  if (event === null) throw new Error('Event not found');

  // Check if result has been set
  const result = parseInt(event.result.toString())
  if (result !== -1) {
    console.log('Event has already been settled');
  }

  const txReceipt = await provider.getTransaction(transactionId)
  // Need to check if approve tx is mined

  let imageUrl = ''
  let pick = button - 1;
  const impliedProbability = event.odds[pick]
  const now = new Date().getTime();
  // Check if event has already passed
  if (event.startDate < now || result !== -1) {
    pick = -1;
    imageUrl = generateUrl(`api/bookies/${eventName}/${FrameNames.BET_CONFIRMATION}/image`, {[RequestProps.STAKE]: stake, 
                                                                              [RequestProps.PICK]: pick, 
                                                                              [RequestProps.BUTTON_INDEX]: button, 
                                                                              [RequestProps.FID]: fid, 
                                                                              [RequestProps.EVENT_NAME]: eventName, 
                                                                              [RequestProps.OPTIONS]: event.options, 
                                                                              [RequestProps.TIME]: now, 
                                                                              [RequestProps.RESULT]: result}, true);
  }
  else
  {
    const poll = Object.values(await kv.hgetall(`${eventName}:${DatabaseKeys.POLL}`) as Record<number, number>)
    const prompt = event.prompt;
    const options = event.options;


    imageUrl = generateUrl(`api/bookies/${eventName}/${FrameNames.BETSLIP}/image`, {[RequestProps.PICK]: pick, 
                                                                      [RequestProps.STAKE]: stake, 
                                                                      [RequestProps.ODD]: impliedProbability,
                                                                      [RequestProps.POLL]: poll,
                                                                      [RequestProps.PROMPT]: prompt, 
                                                                      [RequestProps.OPTIONS]: options}, true);
  }

  return new NextResponse(
    getFrameHtml({
      version: "vNext",
      image: `${imageUrl}`,
      postUrl: generateUrl(`api/bookies/${eventName}/${FrameNames.BET_CONFIRMATION}`, {[RequestProps.EVENT_NAME]: eventName, [RequestProps.STAKE]: stake, [RequestProps.PICK]: pick}, false),
      buttons: pick !== -1 ? [
                {
                  label: "Reject", 
                  action: 'post'
                },
                {
                  label: "Confirm", 
                  action: 'tx',
                  target: generateUrl(`api/bookies/transactions/${Transactions.PLACE_BET}`, {[RequestProps.STAKE]: stake, [RequestProps.PICK]: pick, [RequestProps.ODD]: impliedProbability}, false)
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
