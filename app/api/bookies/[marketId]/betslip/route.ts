import { FrameButtonsType, getFrameHtml} from "frames.js";
import { NextRequest, NextResponse } from 'next/server';
import { generateUrl, getFrameMessage, calculatePayout, getRequestProps } from '@utils';
import { FrameNames, RequestProps, Transactions, STAKE_LIMIT, PICK_DECIMALS, ODDS_DECIMALS } from '@utils/constants';
import {orderBookieABI, erc20ABI} from '@abis';
import { kv } from "@vercel/kv";
import { Market } from "@types";
import { ethers } from "ethers";

export async function POST(req: NextRequest, { params: { marketId } }: { params: { marketId: string } }): Promise<Response> {
  // Verify the frame request
  const message = await getFrameMessage(req, false);

  const {button, fid, input, transactionId} = message;
  
  console.log('FID: ', fid.toString())

  let {odds, pick: sharePick, stake: shareStake  } = getRequestProps(req, [RequestProps.ODDS, RequestProps.PICK, RequestProps.STAKE]);

  let pick;
  let stake;

  if (sharePick && shareStake) { // Coming from share bet
    if (button === 1) {
      // Bet Against
      pick = 1 - sharePick
      const oppositeOdd = odds[pick];

      // Calculate the stake to match the opposite side
      stake = calculatePayout(oppositeOdd, shareStake) - shareStake;
    }
    else {
      // Copy Bet
      pick = sharePick
      stake = shareStake
    }
  }
  else { // Coming from place bet
    pick = button - 1;
    stake = parseFloat(input);
  }


  console.log('Stake: ', stake)

  // Check if stake is not float
  if (!stake || stake < 0 || Number.isNaN(stake) || typeof stake !== 'number' || !Number.isFinite(stake) || stake > STAKE_LIMIT) {
    // return 400 response
    return new Response(JSON.stringify({ message: 'Invalid stake amount' }), { status: 400, headers: { 'content-type': 'application/json' } });
  }

  // Wait for both user to be found and event to be found
  let event : Market | null = null;

  await Promise.all([kv.hgetall(marketId)]).then( (res) => {
    event = res[0] as Market || null;
  });

  event = event as unknown as Market || null;

  // Get info for bet
  if (event === null) throw new Error('Event not found');

  // Check if result has been set
  const result = parseInt(event.result.toString())

  let imageUrl = ''
  let buttons;
  const impliedProbability = odds[pick]
  const orderBookieAddress = event.address;

  const now = new Date().getTime() / 1000;
  // Check if event has already passed
  if (event.startDate < now || result !== -1) {
    return new Response(JSON.stringify({ message: 'Market already closed' }), { status: 400, headers: { 'content-type': 'application/json' } });
  }
  else
  {
    const provider = new ethers.JsonRpcProvider(process.env.BASE_PROVIDER_URL);
    const orderBookie = new ethers.Contract(orderBookieAddress, orderBookieABI, provider)
    const orderBookieInfo = await orderBookie.getBookieInfo()

    const acceptedToken = await new ethers.Contract(orderBookieInfo.acceptedTokenAddress, erc20ABI, provider)
    const decimals = await acceptedToken.decimals();
    const symbol = await acceptedToken.symbol();

    // Format orderbookie txfee
    const txfee = parseFloat(orderBookieInfo.txFee) / 100;
      
    // Get percent of stake filled
    const oppositePick = 1 - pick;
    const oppositeOdd = event.odds[oppositePick];
    const openLiquidty = await orderBookie.getOpenLiquidity(ethers.parseUnits(oppositePick.toString(), PICK_DECIMALS), ethers.parseUnits(oppositeOdd.toString(), ODDS_DECIMALS));

    const toWinAmount = calculatePayout(impliedProbability, stake) - stake;
    const toWinFilledAmount = Math.min(parseFloat(ethers.formatUnits(openLiquidty, decimals)), toWinAmount);
    
    const percentFilled = Math.floor((toWinFilledAmount / toWinAmount) * 100)

    const options = event.options;

    imageUrl = generateUrl(`api/bookies/${marketId}/${FrameNames.BETSLIP}/image`, {[RequestProps.PICK]: pick, 
                                                                      [RequestProps.STAKE]: stake, 
                                                                      [RequestProps.ODD]: impliedProbability,
                                                                      [RequestProps.OPTIONS]: options,
                                                                      [RequestProps.PERCENT_FILLED]: percentFilled,
                                                                      [RequestProps.SYMBOL]: symbol,
                                                                      [RequestProps.TX_FEE]: txfee}, true);
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
      postUrl: generateUrl(`api/bookies/${marketId}/${FrameNames.BET_CONFIRMATION}`, {[RequestProps.STAKE]: stake, [RequestProps.PICK]: pick, [RequestProps.TRANSACTION_HASH]: ""}, false),
      buttons: buttons as FrameButtonsType 
    }),
  );
} 

export const revalidate = 0;
// export const dynamic = 'force-dynamic';
// export const fetchCache = 'force-no-store';
