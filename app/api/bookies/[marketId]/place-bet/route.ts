import { NextRequest, NextResponse } from 'next/server';
import { formatOdd, generateUrl, getFrameMessage, getRequestProps } from '@utils';
import { DatabaseKeys, FrameNames, PICK_DECIMALS, RequestProps, Transactions } from '@utils/constants';
import { Frame, FrameButton, FrameButtonsType, getFrameHtml} from "frames.js";
import { Market } from '@types';
import { kv } from '@vercel/kv';
import { ethers } from 'ethers';
import {orderBookieABI, erc20ABI} from '@abis';

export async function POST(req: NextRequest, { params: { marketId } }: { params: { marketId: string } }): Promise<Response> {
  const {fid} = await getFrameMessage(req);
  
  const provider = new ethers.JsonRpcProvider(process.env.BASE_PROVIDER_URL);

  let event : Market | null = null;
  await Promise.all([kv.hgetall(marketId)]).then( (res) => {
    event = res[0] as Market || null;
  });

  event = event as unknown as Market || null;

  // Get info for bet
  if (event === null) throw new Error('Event not found');

  // Check if result has been set
  const orderBookie = new ethers.Contract(event.address, orderBookieABI, provider)
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
  let odds: number[] = event.odds
  try {
    const {propOdds} = getRequestProps(req, [RequestProps.ODDS]);

    // Check if null
    if (propOdds) {
      odds = propOdds
    }
  }
  catch (e) {
      console.warn("No odds given in url.")
  }

  let imageUrl = '';
  let buttons = undefined;
  let inputText : string | undefined = 'Wager Amount ($DEGEN)';
  let postUrl;

  const now = new Date().getTime() / 1000;
  if (now > Number(orderBookieInfo.startDate) || result !== -1) { // Event has already passed and 
    return new Response(JSON.stringify({ message: 'Market Closed' }), { status: 400, headers: { 'content-type': 'application/json' } });                                                   
  }
  else 
  {
    // Get liquidity spread from contract and convert to array of decimals
    let liquiditySpread: number[] = await (orderBookie.getLiquiditySpread()).then((res) => {
      return res.map((val: any) => parseFloat(ethers.formatUnits(val, decimals)))
    });

    buttons = event.options.map((option, index) => {
      if (event === null) throw new Error('Event not found');
      const formattedOdd = formatOdd(odds[index]);
  
      return {
        label: `${option} (${formattedOdd})`,
        action: 'tx',
        target: generateUrl(`api/bookies/transactions/${Transactions.APPROVE}`, {[RequestProps.ADDRESS]: event.address}, false),
      } as FrameButton
    })
    postUrl = generateUrl(`api/bookies/${marketId}/${FrameNames.BETSLIP}`, {[RequestProps.ODDS]: odds}, false),
    imageUrl = generateUrl(`api/bookies/${marketId}/${FrameNames.PLACE_BET}/image`, {[RequestProps.PROMPT]: event.prompt, 
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
