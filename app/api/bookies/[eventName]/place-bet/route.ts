import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_USER, DatabaseKeys, FrameNames, RequestProps, Transactions, convertImpliedProbabilityToAmerican, generateUrl, getFrameMessage, getRequestProps, notFollowingResponse } from '../../../../../src/utils';
import { Frame, FrameButton, FrameButtonsType, getFrameHtml} from "frames.js";
import { User, Event } from '../../../../types';
import { kv } from '@vercel/kv';

export async function POST(req: NextRequest): Promise<Response> {
  let {eventName} = getRequestProps(req, [RequestProps.EVENT_NAME]);

  // Wait for both user to be found and event to be found
  let event : Event | null = null;

  const {fid} = await getFrameMessage(req);

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

  let imageUrl = '';
  let buttons = undefined;
  let inputText : string | undefined = 'Amount of dice you want to bet';

  const now = new Date().getTime();
  if (event.startDate < now || result !== -1) {
    const pick = -1;
    inputText = undefined

    buttons =
      [
        { 
          label: "/bookies!", 
          action: 'link', 
          target: 'https://warpcast.com/~/channel/bookies'
        }
      ]
    imageUrl = generateUrl(`api/bookies/${eventName}/${FrameNames.BET_CONFIRMATION}/image`, {[RequestProps.STAKE]: 0, 
                                                                              [RequestProps.PICK]: pick, 
                                                                              [RequestProps.BUTTON_INDEX]: 0, 
                                                                              [RequestProps.FID]: fid, 
                                                                              [RequestProps.EVENT_NAME]: eventName, 
                                                                              [RequestProps.OPTIONS]: event.options, 
                                                                              [RequestProps.TIME]: now, 
                                                                              [RequestProps.RESULT]: result}, true);                                                          
  }
  else 
  {
    buttons = event.options.map((option, index) => {
      if (event === null) throw new Error('Event not found');
      const probability = event.odds[index];
      const odd = convertImpliedProbabilityToAmerican(event.odds[index]);
      const probString = `${probability > 0.5 ? '-' : '+'}${odd.toString()}`; 
  
      return {
        label: `${option} (${probString})`,
        action: 'tx',
        target: generateUrl(`api/bookies/transactions/${Transactions.APPROVE}`, {[RequestProps.ADDRESS]: event.address}, false),
      } as FrameButton
    })
    imageUrl = generateUrl(`api/bookies/${eventName}/${FrameNames.PLACE_BET}/image`, {[RequestProps.PROMPT]: event.prompt, [RequestProps.BALANCE]: 0, [RequestProps.TIME]: event.startDate}, true);
  }

  const frame : Frame = {
    version: "vNext",
    inputText: inputText,

    buttons: buttons as FrameButtonsType,
    image: imageUrl,
    postUrl: generateUrl(`api/bookies/${eventName}/${FrameNames.BETSLIP}`, {[RequestProps.EVENT_NAME]: eventName}, false),
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