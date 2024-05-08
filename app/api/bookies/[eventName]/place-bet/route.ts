import { NextRequest, NextResponse } from 'next/server';
import { FrameNames, PICK_DECIMALS, RequestProps, Transactions, convertImpliedProbabilityToAmerican, generateUrl, getFrameMessage } from '../../../../../src/utils';
import { Frame, FrameButton, FrameButtonsType, getFrameHtml} from "frames.js";
import { Event } from '../../../../types';
import { kv } from '@vercel/kv';
import { ethers } from 'ethers';
import {OrderBookieABI} from '../../../../contract-abis/orderBookie.json';

export async function POST(req: NextRequest, { params: { eventName } }: { params: { eventName: string } }): Promise<Response> {
  const {fid} = await getFrameMessage(req);
  
  const provider = new ethers.JsonRpcProvider(process.env.BASE_PROVIDER_URL);

  let event : Event | null = null;
  await Promise.all([kv.hgetall(eventName)]).then( (res) => {
    event = res[0] as Event || null;
  });

  event = event as unknown as Event || null;

  // Get info for bet
  if (event === null) throw new Error('Event not found');

  // Check if result has been set
  const orderBookie = new ethers.Contract(event.address, OrderBookieABI, provider)
  const orderBookieInfo = await orderBookie.getBookieInfo()
  const result = parseFloat(ethers.formatUnits(orderBookieInfo.result, PICK_DECIMALS))

  let imageUrl = '';
  let buttons = undefined;
  let inputText : string | undefined = 'Wager Amount ($DEGEN)';
  let postUrl;

  const now = new Date().getTime() / 1000;
  if (now > Number(orderBookieInfo.startDate) || result !== -1) { // Event has already passed and 
    inputText = undefined

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
    
    postUrl = "" // Collect payout page

    imageUrl = generateUrl(`api/bookies/${eventName}/${FrameNames.BET_CONFIRMATION}/image`, {[RequestProps.PICK]: -1, 
                                                                                            [RequestProps.BUTTON_INDEX]: 0, 
                                                                                            [RequestProps.FID]: fid,  
                                                                                            [RequestProps.OPTIONS]: event.options, 
                                                                                            [RequestProps.ADDRESS]: event.address,
                                                                                            [RequestProps.RESULT]: result,
                                                                                            [RequestProps.PROMPT]: event.prompt,
                                                                                            [RequestProps.TRANSACTION_HASH]: "",
                                                                                            [RequestProps.IS_MINED]: false}, true);                                                          
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
    postUrl = generateUrl(`api/bookies/${eventName}/${FrameNames.BETSLIP}`, {}, false),
    imageUrl = generateUrl(`api/bookies/${eventName}/${FrameNames.PLACE_BET}/image`, {[RequestProps.PROMPT]: event.prompt, [RequestProps.BALANCE]: 0, [RequestProps.TIME]: event.startDate}, true);
  }

  const frame : Frame = {
    version: "vNext",
    inputText: inputText,
    buttons: buttons as FrameButtonsType,
    image: imageUrl,
    postUrl: postUrl
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
