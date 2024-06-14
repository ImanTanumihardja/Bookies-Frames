import { NextRequest, NextResponse } from 'next/server';
import { convertImpliedProbabilityToAmerican, generateUrl, getFrameMessage, getRequestProps } from '@utils';
import { Accounts, DatabaseKeys, FrameNames, PICK_DECIMALS, RequestProps, Transactions } from '@utils/constants';
import { Frame, FrameButton, FrameButtonsType, getFrameHtml} from "frames.js";
import { Event } from '@types';
import { kv } from '@vercel/kv';
import { ethers } from 'ethers';
import {OrderBookieABI} from '@contract-abis/orderBookie.json';
import {erc20ABI} from '@contract-abis/erc20.json';

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

  // Get all bookies events and filter out this eventName
  let activeEvents = (await kv.sscan(`${Accounts.BOOKIES}:${DatabaseKeys.EVENTS}`, 0, {count: 150}))[1] as string[];
  activeEvents = activeEvents.filter((e) => e !== String(eventName));

  // Check if result has been set
  const orderBookie = new ethers.Contract(event.address, OrderBookieABI, provider)
  const orderBookieInfo = await orderBookie.getBookieInfo()
  const result = parseFloat(ethers.formatUnits(orderBookieInfo.result, PICK_DECIMALS))

  const acceptedToken = await new ethers.Contract(orderBookieInfo.acceptedTokenAddress, erc20ABI, provider)
  const decimals = await acceptedToken.decimals();
  const symbol = await acceptedToken.symbol();

  // Get address of fid
  const address = (await kv.sscan(`${fid}:${DatabaseKeys.ADDRESSES}`, 0))[1][0] || null;

  // Get balance
  let balance = null;
  
  if (address !== null) {
    const bal = await acceptedToken.balanceOf(address)
    balance = parseFloat(ethers.formatUnits(bal, decimals))
  }

  // Get odds
  const {odds} = getRequestProps(req, [RequestProps.ODDS]);


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

    if (activeEvents.length > 0) {
      buttons.push({
        label: 'Bet on Another Event', 
        action:'post', 
        target: generateUrl(`/api/bookies/${activeEvents[Math.floor(Math.random() * activeEvents.length)]}`, {}, false)
      })
    }
    
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
    // Get liquidity spread from contract and convert to array of decimals
    let liquiditySpread: number[] = await (orderBookie.getLiquiditySpread()).then((res) => {
      return res.map((val: any) => parseFloat(ethers.formatUnits(val, decimals)))
    });

    buttons = event.options.map((option, index) => {
      if (event === null) throw new Error('Event not found');
      const probability = odds[index];
      const odd = convertImpliedProbabilityToAmerican(odds[index]);
      const probString = `${probability > 0.5 ? '-' : '+'}${odd.toString()}`; 
  
      return {
        label: `${option} (${probString})`,
        action: 'tx',
        target: generateUrl(`api/bookies/transactions/${Transactions.APPROVE}`, {[RequestProps.ADDRESS]: event.address}, false),
      } as FrameButton
    })
    postUrl = generateUrl(`api/bookies/${eventName}/${FrameNames.BETSLIP}`, {[RequestProps.ODDS]: odds}, false),
    imageUrl = generateUrl(`api/bookies/${eventName}/${FrameNames.PLACE_BET}/image`, {[RequestProps.PROMPT]: event.prompt, 
                                                                                      [RequestProps.BALANCE]: balance !== null ? balance : "", 
                                                                                      [RequestProps.POLL]: liquiditySpread, 
                                                                                      [RequestProps.OPTIONS]: event.options, 
                                                                                      [RequestProps.SYMBOL]: symbol}, true);
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
