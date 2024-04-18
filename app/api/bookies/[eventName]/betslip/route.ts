import { FrameButtonsType, getFrameHtml} from "frames.js";
import { NextRequest, NextResponse } from 'next/server';
import {  DatabaseKeys, FrameNames, RequestProps, generateUrl, getFrameMessage, Transactions } from '../../../../../src/utils';
import { kv } from "@vercel/kv";
import { Event } from "../../../../types";

export async function POST(req: NextRequest, { params: { eventName } }: { params: { eventName: string } }): Promise<Response> {
  // Verify the frame request
  const message = await getFrameMessage(req, false);

  const {button, fid, input, transactionId} = message;
  
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

  let imageUrl = ''
  let pick = button - 1;
  let buttons;
  const impliedProbability = event.odds[pick]
  const orderBookieAddress = event.address;
  const now = new Date().getTime() / 1000;
  // Check if event has already passed
  if (event.startDate < now || result !== -1) {
    pick = -1;
    imageUrl = generateUrl(`api/bookies/${eventName}/${FrameNames.BET_CONFIRMATION}/image`, {[RequestProps.PICK]: -1, 
                                                                                            [RequestProps.BUTTON_INDEX]: 0, 
                                                                                            [RequestProps.FID]: fid,  
                                                                                            [RequestProps.OPTIONS]: event.options, 
                                                                                            [RequestProps.ADDRESS]: event.address,
                                                                                            [RequestProps.RESULT]: result,
                                                                                            [RequestProps.PROMPT]: event.prompt,
                                                                                            [RequestProps.TRANSACTION_HASH]: "",
                                                                                            [RequestProps.IS_MINED]: false}, true);

    buttons =
    [
      { 
        label: "/bookies!", 
        action: 'link', 
        target: 'https://warpcast.com/~/channel/bookies'
      },
      {
        label: 'Refresh', 
        action:'post', 
        target: generateUrl(`/api/bookies/${eventName}/${FrameNames.BET_CONFIRMATION}`, {[RequestProps.EVENT_NAME]: eventName, 
                                                                                        [RequestProps.STAKE]: 0,
                                                                                        [RequestProps.PICK]: 0,
                                                                                        [RequestProps.TRANSACTION_HASH]: ""}, false)
      },
    ]
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
    buttons = [
      {
        label: "Reject", 
        action: 'post'
      },
      {
        label: "Confirm", 
        action: 'tx',
        target: generateUrl(`api/bookies/transactions/${Transactions.PLACE_BET}`, {[RequestProps.STAKE]: stake, [RequestProps.PICK]: pick, [RequestProps.ODD]: impliedProbability, [RequestProps.ADDRESS]: orderBookieAddress, [RequestProps.TRANSACTION_HASH]: transactionId}, false)
      }
    ]
  }

  return new NextResponse(
    getFrameHtml({
      version: "vNext",
      image: imageUrl,
      postUrl: generateUrl(`api/bookies/${eventName}/${FrameNames.BET_CONFIRMATION}`, {[RequestProps.STAKE]: stake, [RequestProps.PICK]: pick, [RequestProps.TRANSACTION_HASH]: ""}, false),
      buttons: buttons as FrameButtonsType 
    }),
  );
} 

export const revalidate = 0;
// export const dynamic = 'force-dynamic';
// export const fetchCache = 'force-no-store';
